<script setup lang="ts">
import JSZip from 'jszip'
import pLimit from 'p-limit'
import { init as initDecoder } from '@jsquash/png/decode'

import bulkOperation from '~/utils/bulk/bulkOperation'
import OptimizeWorker from '~/utils/bulk/optimize.worker?worker'
import EncodeWorker from '~/utils/bulk/encode.worker?worker'
import ProcessWorker from '~/utils/bulk/process.worker?worker'

const props = defineProps(['files', 'options'])
const emit = defineEmits(['next'])

const stage = ref('')

const indeterminateProgress: Ref<boolean> = ref(false)
const progress: Ref<number> = ref(0)
const progressMax: Ref<number> = ref(0)
const progressFilename_Debug: Ref<string> = ref('')
const iterProgress = () => progress.value++

const nonImages: Ref<Array<DumbFile>> = ref([])
const images: Ref<Array<Image>> = ref([])
const processedImages: Ref<Array<Image>> = ref([])
const optimizedImages: Ref<Array<DumbFile>> = ref([])

async function loadFiles() {
  // update display
  stage.value = 'Loading Files'
  progress.value = 0
  progressMax.value = props.files.length

  await initDecoder()
    .catch(() => console.error('failed to init fast PNG decoder, may take awhile to load files'))

  // load every file's arrayBuffer asynchronously
  console.time('loadFiles')
  const limit = pLimit(8)
  await Promise.all(props.files.map(async (file: File) => await limit(async () => {
    if (file.name.startsWith('__MACOSX'))
      return iterProgress() // remove macosx meta files

    const data = await file.arrayBuffer()
    progressFilename_Debug.value = file.name
    if (isPNG(file))
      images.value.push({ name: file.name, data: await safeDecodePNG(data) })
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
    processedImages.value = (await bulkOperation(toRaw(images.value), ProcessWorker, props.options.threads, iterProgress, props.options.scale)) as Image[]
    console.timeEnd('Process')

    // move to next step
    optimizeImages()
  }
  // otherwise, Manual component will start rendering, which will add to processedImages and call saveResult when done
}
function manualPrev() {
  if (progress.value < 1)
    return
  processedImages.value.pop()
  progress.value--
}
function manualNext(image: Image) {
  if (image === undefined)
    return

  processedImages.value.push(image)
  progress.value++

  if (progress.value === progressMax.value)
    optimizeImages()
}

async function optimizeImages() {
  // update display
  progress.value = 0
  progressMax.value = processedImages.value.length

  let results
  if (props.options.optimize) {
    // optimize images
    stage.value = 'Optimizing'
    console.time('Optimize')
    results = await bulkOperation(toRaw(processedImages.value), OptimizeWorker, props.options.threads, iterProgress)
    console.timeEnd('Optimize')
  }
  else {
    // encode images as png
    stage.value = 'Encoding'
    console.time('Encode')
    results = await bulkOperation(toRaw(processedImages.value), EncodeWorker, props.options.threads, iterProgress)
    console.timeEnd('Encode')
  }
  optimizedImages.value = results as DumbFile[]

  // move to next step
  saveResult()
}

async function saveResult() {
  const files = [...nonImages.value, ...optimizedImages.value]
  const outputName = `${props.options.outputName}-${props.options.scale}xBR`

  if (files.length > 1) {
    // update display
    stage.value = 'Compressing'
    progress.value = 0
    progressMax.value = props.files.length

    // add files to zip
    console.time('Compress')
    const zip = new JSZip()
    await Promise.all(files.map(async (file) => {
      await zip.file(file.name, file.data, {
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
      iterProgress()
    }))
    console.timeEnd('Compress')

    // save zip
    stage.value = 'Saving'
    indeterminateProgress.value = true // switch progressbar to one that implies movement but doesn't show progress
    saveBlob(await zip.generateAsync({ type: 'blob' }), `${outputName}.zip`)
  }
  else {
    // save image
    stage.value = 'Saving'
    indeterminateProgress.value = true // switch progressbar to one that implies movement but doesn't show progress
    saveBlob(new Blob([files[0].data]), `${outputName}.png`)
  }
  // move to Complete page
  emit('next')
}

onMounted(loadFiles)
</script>

<template>
  <UtilManual
    v-if="!props.options.auto && stage === 'Processing Images'"
    :image="images[progress]"
    :scale-factor="options.scale"
    :prev="manualPrev"
    :next="manualNext"
    :progress="progress"
    :progress-max="progressMax"
  />
  <template v-else>
    <StaticLogo class="showBox" />

    <div class="col gap1 centerChildren">
      <h2>{{ stage }}</h2>
      <progress v-if="indeterminateProgress" />
      <template v-else>
        <progress :value="progress" :max="progressMax" />
        <span>{{ progress }} / {{ progressMax }}</span>
        <span>File: {{ progressFilename_Debug }}</span>
      </template>
    </div>
  </template>
</template>
