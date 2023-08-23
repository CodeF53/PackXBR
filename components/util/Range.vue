<script setup>
defineProps({
  min: { type: Number, default: 0 },
  modelValue: { type: Number, default: 50 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
})

defineEmits(['update:modelValue', 'change'])
</script>

<template>
  <input
    type="range" :min="min" :max="max" :step="step"
    :style="{ '--min': min, '--max': max, '--val': modelValue }"
    :value="modelValue"
    @input="$emit('update:modelValue', Number($event.target.value)); $emit('change', $event)"
  >
</template>

<style lang="scss">
// https://css-tricks.com/sliding-nightmare-understanding-range-input/
// https://codepen.io/thebabydino/pen/goYYrN
$thumb-d: 1rem;

@mixin track($fill: 0) {
  box-sizing: border-box;
  border: none;
  width: var(--bar-width); height: var(--bar-height);
  background: var(--bar-background);
  border-radius: var(--border-radius);

  @if $fill == 1 {
    background: linear-gradient(var(--accent), var(--accent))
      0/ var(--sx) 100% no-repeat var(--bar-background)
  }
}

@mixin fill() {
  height: var(--bar-height);
  background: var(--accent);
  border-radius: var(--border-radius);
}

@mixin thumb() {
  box-sizing: border-box;
  border: none;
  width: $thumb-d; height: $thumb-d;
  border-radius: 50%;
  background: var(--elv2);
  &:hover { background: var(--elv3) }
}

input[type='range'] {
  &, &::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  --range: calc(var(--max) - var(--min));
  --ratio: calc((var(--val) - var(--min))/var(--range));
  --sx: calc(.5*#{$thumb-d} + var(--ratio)*(100% - #{$thumb-d}));
  margin: 0;
  padding: 0;
  width: var(--bar-width); height: $thumb-d;
  background: transparent;
  font: 1em/1 arial, sans-serif;

  &::-webkit-slider-runnable-track {
    @include track(1)
  }
  &::-moz-range-track { @include track }
  &::-ms-track { @include track }

  &::-moz-range-progress { @include fill }
  &::-ms-fill-lower { @include fill }

  &::-webkit-slider-thumb {
    margin-top: calc(.5*(var(--bar-height) - $thumb-d));
    @include thumb
  }
  &::-moz-range-thumb { @include thumb }
  &::-ms-thumb {
    margin-top: 0;
    @include thumb
  }

  &::-ms-tooltip { display: none }
}
</style>
