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
  <div id="errorPanel" class="col">
    <span v-for="(entry, i) in logs" :key="i">{{ entry }}</span>
  </div>
</template>

<style lang="scss">
#errorPanel {
  position: absolute;
  left: 0; top: 0;

  min-width: 20rem;
  max-width: 100vw;
  max-height: 8rem;
  overflow-y: scroll;

  > span {
    font-family: monospace;
    color: red;
    background-color: black;
  }
}
</style>
