<script setup>
defineEmits(['next'])
</script>

<template>
  <StaticLogo class="showBox" />
  <div class="col gap1 centerChildren">
    <h3>DONE!</h3>
    <progress max="1" value="1" />
    <button @click="$emit('next')">
      Back to Start
    </button>
  </div>
</template>
