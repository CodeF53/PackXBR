<script setup lang="ts">
import { ref } from 'vue'
import LabeledInput from './LabeledInput.vue'
import { process } from '~/utils/image/process'
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
onMounted(() => { // init rendering context on mount
  inputCtx = createContext(inputCanvas.value)
  processCtx = createContext(processCanvas.value)
})

const processedImage: Ref<Image | undefined> = ref()
async function draw() {
  setImageData(inputCtx, props.image.data)
  // TODO: fix freezing here with big images
  const procData = await process(props.image.data, props.scaleFactor, settings.value)
  setImageData(processCtx, procData)
  processedImage.value = { name: props.image.name, data: procData }
}
onMounted(draw)
onUpdated(draw)

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
  // if (viewer.fulled)
  //   return

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
  <!-- TODO: tooltips -->
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
        <canvas ref="inputCanvas" class="pixel" />
        <select v-for="direction in tileDirections" :key="direction" v-model="settings.tile[direction]" :title="tooltips.wrap" :class="direction">
          <option v-for="value in tileOptions" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </div>
      <div id="outputContainer">
        <canvas ref="processCanvas" class="pixel" />
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
      <!-- I would add :disabled="!processedImage", but that leads to a re-render loop -->
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
</style>
