<script setup>
defineProps(['auto', 'scale', 'threads'])
const emit = defineEmits(['update:auto', 'update:scale', 'update:threads', 'next'])

const maxThreads = ref(navigator.hardwareConcurrency)
onMounted(() => emit('update:threads', Math.max(navigator.hardwareConcurrency - 2, 1)))
</script>

<template>
  <div class="col gap2">
    <div class="row gap2">
      <div class="col spaceEvenly">
        <label for="scaleFactor">Scale Factor</label>
        <select id="scaleFactor" :value="$props.scale" @change="(e) => $emit('update:scale', e.target.value)">
          <option v-for="value in [2, 3, 4, 5, 6]" :key="value" :value="value">
            {{ value }}x
          </option>
        </select>
      </div>
      <div class="col spaceEvenly">
        <div v-for="(mode, i) in [true, false]" :key="i">
          <input
            :id="`auto${mode}`" type="radio" name="scaleFactor"
            :value="mode" :checked="mode === $props.auto"
            @change="(e) => $emit('update:auto', mode)"
          >
          <label :for="`auto${mode}`">{{ mode ? 'auto' : 'manual' }}</label>
        </div>
      </div>
    </div>
    <div class="col">
      <label>Threads {{ $props.threads }} / {{ maxThreads }}</label>
      <input type="range" min="1" :max="maxThreads" :value="$props.threads" @change="(e) => $emit('update:threads', e.target.value)">
    </div>
    <button @click="$emit('next')">
      Go
    </button>
  </div>
</template>
