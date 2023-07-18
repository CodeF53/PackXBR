<script setup>
import JSZip from 'jszip'

defineProps(['files'])
const emit = defineEmits(['update:files', 'next'])

const selectedText = ref('No files selected')

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
    console.error('File selected, but no images found! Did the user select a zip that doesn\'t contain any .pngs?')
    return
  }
  // update selectedText
  selectedText.value = `${images.length} image(s)`

  // broadcast new files
  emit('update:files', files)
}
const handleFileInput = e => handleFiles([...e.target.files])
</script>

<template>
  <div class="col gap2">
    <div class="row gap-1 centerChildren">
      <input type="file" accept=".zip,.png" multiple @change="handleFileInput">
      <span>{{ selectedText }}</span>
    </div>
    <button v-if="files.length > 0" @click="$emit('next')">
      GO
    </button>
  </div>
</template>

<style lang="scss">
  input[type="file"] {
    font-size: 0;
    &::file-selector-button {
      font-size: 0.8rem;
    }
  }
</style>
