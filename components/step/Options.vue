<script setup>
defineProps(['auto', 'scale'])
defineEmits(['update:auto', 'update:scale', 'next'])
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
            @change="(e) => $emit('update:auto', e.target.value)"
          >
          <label :for="`auto${mode}`">{{ mode ? 'auto' : 'manual' }}</label>
        </div>
      </div>
    </div>
    <button @click="$emit('next')">
      Go
    </button>
  </div>
</template>
