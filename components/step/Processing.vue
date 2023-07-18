<script setup>
import JSZip from 'jszip'

const props = defineProps(['files', 'options'])
const emit = defineEmits(['next'])

const stage = ref('')
const progress = ref(0)
const progressMax = ref(0)

const nonImages = ref([])
const images = ref([])
const processedImages = ref([])

async function loadFiles() {
  // update display
  stage.value = 'Loading Files'
  progress.value = 0
  progressMax.value = props.files.length

  // load every file's arrayBuffer asynchronously
  const files = await Promise.all(props.files.map(async (file) => {
    const data = await file.arrayBuffer()
    progress.value++
    return { name: file.name, data }
  }))

  // split loaded files into images and nonImages
  images.value = files.filter(isPNG)
  nonImages.value = files.filter(file => !isPNG(file))

  // move to next step
  processImages()
}

async function processImages() {
  // update display
  stage.value = 'Processing Images'
  progress.value = 0
  progressMax.value = images.length

  // (if auto) process all images
  if (props.options.auto) {
    processedImages.value = await Promise.all(images.value.map(async (image) => {
      // TODO: process image

      progress.value++

      return image
    }))

    // move to next step
    optimizeImages()
  }
  // otherwise, Manual component will start rendering, which will add to processedImages and call saveResult when done
}

async function optimizeImages() {
  // update display
  stage.value = 'Optimizing'
  progress.value = 0
  progressMax.value = processedImages.length

  // TODO: optimize images

  // move to next step
  saveResult()
}

async function saveResult() {
  // update display
  stage.value = 'Compressing'
  progress.value = 0
  progressMax.value = props.files.length

  // add files to zip
  const zip = new JSZip()
  const files = [...nonImages.value, ...processedImages.value]
  await Promise.all(files.map(async (file) => {
    await zip.file(file.name, file.data, {
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })
    progress.value++
  }))

  // save zip
  stage.value = 'Saving'
  progress.value = null // switch progressbar to one that implies movement but doesn't show progress
  progressMax.value = null
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
