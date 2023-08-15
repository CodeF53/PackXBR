<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import { process } from '~/utils/image/process'
import { createContext, setImageData } from '~/utils/image/canvas'

const props = defineProps<{
  image: Image
  scaleFactor: number
  next: (image: Image) => void
  prev: () => void
}>()

const tileOptions: TileOption[] = ['void', 'wrap', 'extend', 'mirror']
const settings: Ref<ProcessSettings> = ref({
  tile: { n: 'void', s: 'void', e: 'void', w: 'void' },
  cullTranslucent: true,
  relayer: false,
  skip: false,
})

const inputCanvas: Ref<HTMLCanvasElement | undefined> = ref()
const processCanvas: Ref<HTMLCanvasElement | undefined> = ref()
const processedImage: Ref<Image | undefined> = ref()
async function processImage() {
  if (!(inputCanvas.value && processCanvas.value))
    return
  const inputCtx = createContext(inputCanvas.value)
  setImageData(inputCtx, props.image.data)

  processedImage.value = {
    name: props.image.name,
    data: await process(props.image.data, props.scaleFactor, settings.value),
  }

  const processCtx = createContext(processCanvas.value)
  setImageData(processCtx, processedImage.value.data)
}
onMounted(processImage)
onBeforeUpdate(processImage)
</script>

<template>
  <!-- TODO: tooltips -->
  <div class="col">
    <div id="settingHeader" class="row gap4">
      <span>TODO: presets</span>
      <LabeledInput v-model="settings.relayer" name="relayer" label="relayer" type="checkbox" />
      <LabeledInput v-model="settings.cullTranslucent" name="cullTranslucent" label="cullTranslucent" type="checkbox" />
    </div>
    <div class="row spaceBetween gap2">
      <div class="col centerChildren">
        <select v-model="settings.tile.n">
          <option v-for="value in tileOptions" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
        <div class="row centerChildren">
          <select v-model="settings.tile.w">
            <option v-for="value in tileOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
          <canvas ref="inputCanvas" />
          <select v-model="settings.tile.e">
            <option v-for="value in tileOptions" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
        </div>
        <select v-model="settings.tile.s">
          <option v-for="value in tileOptions" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </div>
      <div class="col">
        <canvas ref="processCanvas" />
        <p id="pathTextContainer" class="centered">
          <span id="pathText">{{ image.name }}</span>
        </p>
      </div>
    </div>
    <div class="row gap2">
      <div class="spacer" />
      <button @click="prev()">
        back
      </button>
      <button @click="next(image)">
        skip
      </button>
      <button @click="processedImage && next(processedImage)">
        next
      </button>
    </div>
  </div>
</template>
