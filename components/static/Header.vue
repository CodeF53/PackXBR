<template>
  <header class="col centerChildren">
    <h1 class="packLogo" title="PackXBR">
      PackXBR
    </h1>
    <h2>
      - bulk pixel art upscaler -
    </h2>
    <StaticGithubCorner />
  </header>
</template>

<style lang="scss">
  header {
    h1 { font-size: 4rem; }
    margin-bottom: 6rem;
    .packLogo {
      font-family: 'Franklin Gothic Bold', 'Arial Narrow', Arial, sans-serif;
      position: relative;
      background: transparent;
      z-index: 0;
      color:white;
    }
    // ↓ Stroke 1
    .packLogo:before {
      content: attr(title);
      position: absolute;
      -webkit-text-stroke: 0.11em rgb(42, 0, 0); 
      left: 0;
      z-index: -1;
    }
    // ↓ Stroke 2
    .packLogo:after {
      content: attr(title);
      position: absolute;
      -webkit-text-stroke: 0.20em rgb(127, 12, 32);
      left: 0;
      z-index: -2;
    }
  }
</style>
