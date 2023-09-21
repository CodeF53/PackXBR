<script setup lang="ts">
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'
import LabeledInput from './LabeledInput.vue'
import ProcessWorker from '~/utils/image/process.worker?worker'
import { createContext, setImageData } from '~/utils/image/canvas'

const props = defineProps<{
  image: Image
  scaleFactor: number
  next: (image: Image) => void
  prev: () => void
  progress: number
  progressMax: number
}>()

const tileDirections: TileDirection[] = ['n', 's', 'e', 'w']
const tileOptions: TileOption[] = ['void', 'wrap', 'extend', 'mirror']
const settings: Ref<ProcessSettings> = ref({
  tile: { n: 'void', s: 'void', e: 'void', w: 'void' },
  cullTranslucent: true,
  relayer: false,
  skip: false,
})

const inputCanvas: Ref<HTMLCanvasElement | undefined> = ref()
const processCanvas: Ref<HTMLCanvasElement | undefined> = ref()
let inputCtx: CanvasRenderingContext2D
let processCtx: CanvasRenderingContext2D
function initRenderingContext() {
  inputCtx = createContext(inputCanvas.value)
  processCtx = createContext(processCanvas.value)
}
onMounted(initRenderingContext)

// worker for processing images (so we don't freeze while processing)
const worker: Ref<Worker> = ref(new ProcessWorker())
function initWorker() {
  worker.value.postMessage({ init: true })
}
onMounted(initWorker)
// delete worker when done
onBeforeUnmount(() => worker.value.terminate())

const processingPlaceHolder: Ref<ImageData | undefined> = ref()
function initPlaceHolder() {
  const ctx = createContext()
  const canvas = ctx.canvas
  canvas.width = 300
  canvas.height = 200
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = 'white'
  ctx.font = '40px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('processing', 100, 100)

  processingPlaceHolder.value = ctx.getImageData(0, 0, 200, 200)
}
onBeforeMount(initPlaceHolder)

const processedImage: Ref<Image | undefined> = ref()
async function draw() {
  // prevent going forward with old image
  processedImage.value = undefined

  // update input canvas
  setImageData(inputCtx, props.image.data)

  if (processingPlaceHolder.value)
    // "Processing" placeholder (while waiting for current image to process)
    setImageData(processCtx, processingPlaceHolder.value)

  const currentProgress = props.progress
  worker.value.onmessage = ({ data }) => {
    // if we changed image since starting, toss result
    if (props.progress !== currentProgress)
      return
    if (data.error)
      return console.error(`"${props.image.name}" - ${data.error} - skipping image`)

    setImageData(processCtx, data)
    processedImage.value = { name: props.image.name, data }
  }
  worker.value.postMessage([toRaw(props.image.data), props.scaleFactor, toRaw(settings.value)])
}
onMounted(draw)
onUpdated(draw)

const viewerImage: HTMLImageElement = document.createElement('img')
let viewer: Viewer
onMounted(() => {
  viewerImage.id = 'viewerImage'
  document.body.appendChild(viewerImage)
  viewer = new Viewer(viewerImage, {
    navbar: false,
    title: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      oneToOne: true,
      reset: true,
      rotateLeft: true,
      rotateRight: true,
      flipHorizontal: true,
      flipVertical: true,
      prev: false,
      play: false,
      next: false,
    },
  })
})
onBeforeUnmount(() => {
  viewerImage.remove()
  viewer.destroy()
})
function clickEventViewCanvas(e: MouseEvent) {
  if (e.target)
    viewCanvas(e.target as HTMLCanvasElement)
}
function viewCanvas(canvas: HTMLCanvasElement) {
  viewerImage.src = canvas.toDataURL()
  viewer.show()
  viewer.update()
}

function cycleTileOption(direction: TileDirection) {
  const currentSetting = settings.value.tile[direction]
  settings.value.tile[direction] = tileOptions[(tileOptions.indexOf(currentSetting) + 1) % tileOptions.length]
}

// TODO: redo preset system in a way that:
// - doesn't require JSON.stringify
// - is cleaner
const tilePresets: { name: string; value: TileSettings }[] = [
  { name: 'Block', value: { n: 'wrap', s: 'wrap', e: 'wrap', w: 'wrap' } },
  { name: 'Plant', value: { n: 'void', s: 'mirror', e: 'void', w: 'void' } },
  { name: 'Item', value: { n: 'void', s: 'void', e: 'void', w: 'void' } },
]
function cycleTilePreset(offset: number) {
  // find the current preset in a way that is safe because comparing objects is STUPID
  const tilePresetValues = tilePresets.map(a => a.value)
  let presetIndex = 0
  tilePresetValues.forEach((preset, i) => {
    if (JSON.stringify(preset) === JSON.stringify(settings.value.tile))
      presetIndex = i
  })
  const newPresetIndex = (presetIndex + offset + tilePresetValues.length) % tilePresetValues.length

  settings.value.tile = { ...tilePresetValues[newPresetIndex] }
}

function hotkey(e: KeyboardEvent) {
  // disable hotkeys while viewer is open
  if (viewer.isShown)
    return

  const { key, ctrlKey, shiftKey } = e

  if (shiftKey) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key))
      e.preventDefault()

    switch (key) {
      case 'ArrowUp': return cycleTileOption('n')
      case 'ArrowDown': return cycleTileOption('s')
      case 'ArrowLeft': return cycleTileOption('w')
      case 'ArrowRight': return cycleTileOption('e')
    }
  }
  else if (ctrlKey) {
    if (['ArrowUp', 'ArrowDown'].includes(key))
      e.preventDefault()

    switch (key) {
      case 'ArrowUp': return cycleTilePreset(-1)
      case 'ArrowDown': return cycleTilePreset(1)
    }
  }
  else {
    if ([' ', '.', 'ArrowLeft', 'ArrowRight', 'p'].includes(key))
      e.preventDefault()

    switch (key) {
      case 'ArrowLeft': return props.prev()
      case 'ArrowRight':
        if (processedImage.value)
          return props.next(processedImage.value)
        break
      case ' ': return props.next(props.image)
      case '.':
        return settings.value.relayer = !settings.value.relayer
      case 'p':
        return '' // TODO: enable image viewer
    }
  }
}
onBeforeMount(() => document.addEventListener('keydown', hotkey))
onBeforeUnmount(() => document.removeEventListener('keydown', hotkey))

const tooltips = {
  preset: 'changes all 4 edge modes at once',
  relayer: 'un-rounds corners, useful for models/entities',
  cullTranslucent: 'remove pixels that are translucent, (Highly Recommended)',
  wrap: 'changes how the processor treats whats "outside" the edge of this dropdown',
  back: 'goes to previous image, undoing your prior settings for it',
  next: 'goes to next image, saving result (right image)',
  skip: 'goes to next image, saving source (left image)',
}
</script>

<template>
  <div id="manual" class="col gap2">
    <div id="settingHeader" class="row gap4">
      <select v-model="settings.tile" :title="tooltips.preset">
        <option v-for="preset in tilePresets" :key="preset.name" :value="preset.value">
          {{ preset.name }}
        </option>
        <option :value="settings.tile">
          Custom
        </option>
      </select>
      <LabeledInput v-model="settings.relayer" :title="tooltips.relayer" name="relayer" label="relayer" type="checkbox" />
      <LabeledInput v-model="settings.cullTranslucent" :title="tooltips.cullTranslucent" name="cullTranslucent" label="cullTranslucent" type="checkbox" />
    </div>
    <div class="row spaceBetween gap2">
      <div id="inputContainer">
        <canvas ref="inputCanvas" class="pixel" @click="clickEventViewCanvas" />
        <select v-for="direction in tileDirections" :key="direction" v-model="settings.tile[direction]" :title="tooltips.wrap" :class="direction">
          <option v-for="value in tileOptions" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </div>
      <div id="outputContainer">
        <canvas ref="processCanvas" class="pixel" @click="clickEventViewCanvas" />
        <p id="pathContainer">
          <span id="path">{{ image.name }}</span>
        </p>
      </div>
    </div>
    <div class="row gap2 centerChildren">
      <progress :value="progress + 1" :max="progressMax" />
      <span>{{ progress + 1 }} / {{ progressMax }}</span>
      <div class="spacer" />
      <button :title="tooltips.back" :disabled="progress === 0" @click="prev()">
        back
      </button>
      <button :title="tooltips.skip" @click="next(image)">
        skip
      </button>
      <button :title="tooltips.next" @click="processedImage && next(processedImage)">
        next
      </button>
    </div>
    <StaticManualKeybinds />
  </div>
</template>

<style lang="scss">
#manual {
  --size: min(22.5rem, 50vh, calc(50vw - 4rem));
  #inputContainer, #outputContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    min-width: var(--size);
    min-height: var(--size);
    max-width: var(--size);
    max-height: var(--size);

    & > canvas {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &#inputContainer > select {
      position: absolute;
      &.n { top:    0 }
      &.s { bottom: 0 }
      &.e { left:   0 }
      &.w { right:  0 }

      // ensure visibility of text and image behind it
      background: rgba($color: #1f1f1f, $alpha: .5);
      > * { background: #1f1f1f; }
      text-shadow: black 0 0 4px, black 0 0 4px, black 0 0 4px, black 0 0 4px, black 0 0 4px;
    }

    &#outputContainer > #pathContainer {
      position: absolute;
      bottom: 0px;
      width: 100%;

      // convoluted way of cutting of the left side of text
      overflow: hidden;
      text-overflow: ellipsis;
      direction: rtl;
      #path {
        direction: ltr;
        white-space: nowrap;
      }
    }
  }
}

body > #viewerImage { display: none; }
</style>
