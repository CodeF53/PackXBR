<script setup>
const state = ref('input')
const files = ref([])

// TODO: combine into one options object { scale, auto, threads }
const scale = ref(4)
const auto = ref(true)
const threads = ref(1) // updated to navigator.hardwareConcurrency - 2 inside StepOptions

function next() {
  state.value = (() => {
    switch (state.value) {
      case 'input': return 'options'
      case 'options': return 'processing'
      case 'processing': return 'complete'
      case 'complete':
      default:
        files.value = []
        return 'input'
    }
  })()
}
</script>

<template>
  <div id="app" class="col centerChildren spaceEvenly">
    <StaticHeader />

    <StepInput v-if="state === 'input'" v-model:files="files" @next="next()" />
    <StepOptions v-else-if="state === 'options'" v-model:scale="scale" v-model:auto="auto" v-model:threads="threads" @next="next()" />
    <StepProcessing v-else-if="state === 'processing'" :files="files" :options="{ scale, auto, threads }" @next="next()" />
    <StepComplete v-else-if="state === 'complete'" @next="next()" />

    <StaticInfo />
  </div>
</template>

<style>
  #app {
    min-height: 100vh;
  }
</style>
