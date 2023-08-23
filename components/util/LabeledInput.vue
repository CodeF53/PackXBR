<script setup lang="ts">
defineProps<{
  label: string
  name: string
  title?: string
  type: string
  modelValue: any
}>()
defineEmits(['update:modelValue', 'change'])
</script>

<template>
  <div class="">
    <label :for="name" :title="title">{{ label }}</label>
    <input
      :id="name"
      :name="name"
      :value="modelValue"
      :checked="modelValue"
      :type="type"
      @input="$emit('update:modelValue', type === 'checkbox' ? $event.target.checked : $event.target.value)"
      @change="$emit('change', $event)"
    >
  </div>
</template>
