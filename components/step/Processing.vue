<script setup lang="ts">
import JSZip from 'jszip'
import pLimit from 'p-limit'
import decodePNG from '@jsquash/png/decode'
import initPNG from '@jsquash/png/codec'

import { processAuto } from '~/utils/image/process'
import bulkOperation from '~/utils/bulk/bulkOperation'
import OptimizeWorker from '~/utils/bulk/optimize.worker?worker'

const props = defineProps(['files', 'options'])
const emit = defineEmits(['next'])

const stage = ref('')

const dumbProgressBar: Ref<boolean> = ref(false)
const progress: Ref<number> = ref(0)
const progressMax: Ref<number> = ref(0)
const iterProgress = () => progress.value++

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
    iterProgress()
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

  // (if auto) process all images
  if (props.options.auto) {
    console.time('Process')
    processedImages.value = await Promise.all(images.value.map(async image => await limit(async () => {
      const imageData = await processAuto(image, props.options.scale)
      iterProgress()
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

  // optimize images
  console.time('Optimize')
  const results = await bulkOperation(toRaw(processedImages.value), OptimizeWorker, iterProgress)
  console.timeEnd('Optimize')
  optimizedImages.value = results

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
    iterProgress()
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
    <progress v-if="dumbProgressBar" />
    <progress v-else :value="progress" :max="progressMax" />
  </div>
</template>
