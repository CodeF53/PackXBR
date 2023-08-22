<script setup>
const props = defineProps(['options'])
const emit = defineEmits(['update:options', 'next'])

function updateValue(key, value) {
  emit('update:options', { ...props.options, [key]: value })
}

const maxThreads = ref(navigator.hardwareConcurrency)
onMounted(() => updateValue('threads', Math.max(navigator.hardwareConcurrency - 2, 1)))
</script>

<template>
  <div class="col gap2">
    <div class="row gap2">
      <div class="col spaceEvenly">
        <label for="scaleFactor">Scale Factor</label>
        <select id="scaleFactor" :value="$props.options.scale" @change="(e) => updateValue('scale', e.target.value)">
          <option v-for="value in [2, 3, 4, 5, 6]" :key="value" :value="value">
            {{ value }}x
          </option>
        </select>
      </div>
      <div class="col spaceEvenly">
        <div v-for="(mode, i) in [true, false]" :key="i">
          <input
            :id="`auto${mode}`" type="radio" name="scaleFactor"
            :value="mode" :checked="mode === $props.options.auto"
            @change="(e) => updateValue('auto', mode)"
          >
          <label :for="`auto${mode}`">{{ mode ? 'auto' : 'manual' }}</label>
        </div>
      </div>
    </div>
    <div v-if="$props.options.auto" class="col">
      <label>Threads {{ $props.options.threads }} / {{ maxThreads }}</label>
      <input
        type="range" min="1" :max="maxThreads" :value="$props.options.threads"
        @change="(e) => updateValue('threads', e.target.value)"
      >
    </div>
    <div class="row gap1">
      <label for="optimize">Optimize</label>
      <input
        id="optimize"
        type="checkbox" :checked="$props.options.optimize"
        @change="(e) => updateValue('optimize', e.target.checked)"
      >
    </div>
    <button @click="$emit('next')">
      Go
    </button>
  </div>
</template>
