<script setup>
const state = ref('input')
const files = ref([])

const options = ref({
  scale: 4,
  auto: true,
  threads: 1, // updated to navigator.hardwareConcurrency - 2 inside StepOptions
  optimize: true,
  outputName: 'images',
})

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
  <div id="app" class="col centerChildren">
    <StaticHeader />

    <StepInput
      v-if="state === 'input'"
      v-model:files="files" v-model:outputName="options.outputName" @next="next()"
    />
    <StepOptions
      v-else-if="state === 'options'"
      v-model:options="options" @next="next()"
    />
    <StepProcessing
      v-else-if="state === 'processing'"
      :files="files" :options="options" @next="next()"
    />
    <StepComplete
      v-else-if="state === 'complete'"
      @next="next()"
    />

    <div class="spacer" />

    <StaticInfo />

    <StaticBackground />
  </div>
</template>

<style>
  #app {
    min-height: calc(100vh - 2.5rem);
    max-width: calc(100vw - 1rem);
    margin-top: 2rem;
    margin-bottom: .5rem;
  }
</style>
