<script setup lang="ts">
import JSZip from 'jszip'
import pLimit from 'p-limit'
import { decode as decodePNG, encode as encodePNG } from '@jsquash/png'

import initPNG from '@jsquash/png/codec'
import { initialize as initXBRZ } from '~/utils/image/xbrz'

import { processAuto } from '~/utils/image/process'

const props = defineProps(['files', 'options'])
const emit = defineEmits(['next'])

const stage = ref('')

const dumbProgressBar: Ref<boolean> = ref(false)
const progress: Ref<number> = ref(0)
const progressMax: Ref<number> = ref(0)

const nonImages: Ref<Array<DumbFile>> = ref([])
const images: Ref<Array<Image>> = ref([])
const processedImages: Ref<Array<Image>> = ref([])
const optimizedImages: Ref<Array<DumbFile>> = ref([])

const limit = pLimit(8)

async function loadFiles() {
  // update display
  stage.value = 'Loading Files'
  progress.value = 0
  progressMax.value = props.files.length

  await initPNG()

  // load every file's arrayBuffer asynchronously
  console.time('loadFiles')
  await Promise.all(props.files.map(async (file: File) => await limit(async () => {
    const data = await file.arrayBuffer()
    if (isPNG(file))
      images.value.push({ name: file.name, data: await decodePNG(data) })
    else
      nonImages.value.push({ name: file.name, data })
    progress.value++
  })))
  console.timeEnd('loadFiles')

  // move to next step
  processImages()
}

async function processImages() {
  // update display
  stage.value = 'Processing Images'
  progress.value = 0
  progressMax.value = images.value.length
  getCurrentInstance()?.proxy?.$forceUpdate()
  await Promise.all([initXBRZ(), nextTick()])

  // (if auto) process all images
  if (props.options.auto) {
    console.time('Process')
    processedImages.value = await Promise.all(images.value.map(async image => await limit(async () => {
      const imageData = await processAuto(image, props.options.scale)
      progress.value++
      return { name: image.name, data: imageData }
    })))
    console.timeEnd('Process')

    // move to next step
    optimizeImages()
  }
  // otherwise, Manual component will start rendering, which will add to processedImages and call saveResult when done
}

async function optimizeImages() {
  // update display
  stage.value = 'Optimizing'
  progress.value = 0
  progressMax.value = processedImages.value.length
  getCurrentInstance()?.proxy?.$forceUpdate()
  await nextTick()
  // await Promise.all([initOxi(), nextTick()])

  // TODO: optimize images
  console.time('Optimize')
  optimizedImages.value = await Promise.all(processedImages.value.map(async img => await limit(async () => ({ name: img.name, data: await encodePNG(img.data) }))))
  console.timeEnd('Optimize')

  // move to next step
  saveResult()
}

async function saveResult() {
  // update display
  stage.value = 'Compressing'
  progress.value = 0
  progressMax.value = props.files.length
  getCurrentInstance()?.proxy?.$forceUpdate()
  await nextTick()

  // add files to zip
  const zip = new JSZip()
  const files = [...nonImages.value, ...optimizedImages.value]
  await Promise.all(files.map(async (file) => {
    await zip.file(file.name, file.data, {
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })
    progress.value++
  }))

  // save zip
  stage.value = 'Saving'
  dumbProgressBar.value = true // switch progressbar to one that implies movement but doesn't show progress
  saveBlob(await zip.generateAsync({ type: 'blob' }), 'tempName.zip')

  // move to Complete page
  emit('next')
}

onMounted(loadFiles)
</script>

<template>
  <div v-if="!props.options.auto && stage === 'Processing Images'" TODO="Manual GUI Component" />
  <div v-else class="col gap1">
    <h2>{{ stage }}</h2>
    <progress :value="progress" :max="progressMax" />
  </div>
</template>
