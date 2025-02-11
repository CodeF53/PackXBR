<script setup lang="ts">
import JSZip from 'jszip'

defineProps(['files'])
const emit = defineEmits(['update:files', 'update:outputName', 'next'])

const activeSelect = ref(false)
const selectedText = ref('No files selected')
const hasFiles = ref(false)

const error: Ref<string | undefined> = ref()

async function handleFiles(fileList) {
  // if there are any zip files, select the first one to process
  let zipFile
  for (const file of fileList) {
    if (isZIP(file)) {
      zipFile = file
      break
    }
  }

  // save selected files into an array
  let files
  if (zipFile) {
    const zip = await (new JSZip()).loadAsync(zipFile)
    files = Object.values(zip.files).map(img => ({
      name: img.name,
      arrayBuffer: async () => await img.async('ArrayBuffer'),
    }))
  }
  else { files = fileList }

  const images = files.filter(isPNG)
  // verify we have atleast one image
  if (images.length < 1) {
    error.value = 'No files found in input! Only .zips, .png, and clipboard contents are supported'
    console.error('File selected, but no images found! Did the user select a zip that doesn\'t contain any .pngs?')
    return
  }
  error.value = undefined
  // update selectedText
  hasFiles.value = true
  selectedText.value = `${images.length} image(s)`

  // broadcast new files
  emit('update:files', files)

  // determine and broadcast outputName
  let outputName = 'images._' // ._ is to make the file extension remover not break
  if (zipFile)
    outputName = zipFile.name
  else if (images.length === 1)
    outputName = images[0].name
  emit('update:outputName', outputName.split('.').slice(0, -1).join('.'))
}
const handleFileInput = e => handleFiles([...e.target.files])
function handleFileDrop(e) {
  e.preventDefault()
  handleFiles([...e.dataTransfer.files])
}
function handleFilePaste(e) {
  const files = [...e.clipboardData.files]
  if (files.length > 0)
    handleFiles(files)
}
const dragStart = () => activeSelect.value = true
function dragLeave(e) {
  if (e.explicitOriginalTarget.nodeName === 'BODY')
    activeSelect.value = false
}
const dragEnd = () => activeSelect.value = false
const prevent = e => e.preventDefault()
onBeforeMount(() => {
  document.addEventListener('drop', handleFileDrop)
  document.addEventListener('paste', handleFilePaste, { passive: true })
  document.addEventListener('dragover', prevent)

  // keep track of if there is a file being dragged, for file input feedback
  document.addEventListener('dragenter', dragStart)
  document.addEventListener('dragend', dragEnd)
  document.body.addEventListener('dragleave', dragLeave)
})
onBeforeUnmount(() => {
  document.removeEventListener('drop', handleFileDrop)
  document.removeEventListener('paste', handleFilePaste)
  document.removeEventListener('dragover', prevent)
  document.removeEventListener('dragenter', dragStart)
  document.removeEventListener('dragend', dragEnd)
  document.body.removeEventListener('dragleave', dragLeave)
})
// (comment to fix syntax highlights)
</script>

<template>
  <div class="col gap2 centerChildren">
    <StaticLogo class="interactive" :class="{ showBox: hasFiles, activeSelect }" @click="$refs.input.click()" />
    <input
      ref="input" type="file" accept=".zip,.png" multiple
      @change="handleFileInput"
      @input="activeSelect = false" @click="activeSelect = true" @cancel="activeSelect = false"
    >
    <span v-if="error" class="error">{{ error }}</span>
    <span>{{ selectedText }}</span>
    <button :class="{ hidden: !hasFiles }" @click="$emit('next')">
      Next
    </button>
  </div>

  <StaticInfo />
</template>

<style lang="scss" scoped>
input[type="file"] {
  display: none;
}
.error {
  color: red;
}
</style>
