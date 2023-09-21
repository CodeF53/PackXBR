<script setup lang="ts">
const originalLogMethod = ref(console.error.bind(console))

const logs: Ref<string[]> = ref([])

onBeforeMount(() => {
  // interrupt console.error()s with middleware that adds arguments to our log
  console.error = (...values: string[]) => {
    originalLogMethod.value(...values)
    values.forEach(value => logs.value.push(value))
  }
})

onBeforeUnmount(() => {
  console.error = (...values) => originalLogMethod.value(...values)
})
</script>

<template>
  <div id="errorWrapper">
    <span id="spacer" />
    <div id="errorPanel">
      <span v-for="(entry, i) in logs" :key="i">{{ entry }}</span>
    </div>
  </div>
</template>

<style lang="scss">
#errorWrapper {
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;

  position: absolute;
  left: 0; top: 0;
  min-width: 20rem;
  max-width: 60vw;
  max-height: 8rem;
  > #errorPanel {
    > span {
      display: block;
      font-family: monospace;
      color: red;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
