<template>
  <div id="background">
    <!-- https://stackoverflow.com/a/70911566/8133370 -->
    <svg v-for="id in ['darkWave', 'lightWave']" :id="id" :key="id" viewBox="0 0 40 1.5" preserveAspectRatio="none">
      <path d="M0,.75 q5,1,10,0 t 10 0 10 0 10 0 10 0 10,0" />
    </svg>
  </div>
</template>

<style lang="scss">
  #background {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: -1;

    @keyframes waveLeft {
      from { left: 0; }
      to { left: -100vw; }
    }
    @keyframes waveRight {
      from { left: -100vw; }
      to { left: 0; }
    }
    svg {
      top: 9rem;
      position: fixed;
      width: 200vw;
      height: 5rem;

      animation-duration: 10s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      &#lightWave {
        animation-name: waveLeft;
        > path { stroke: #671616; }
      }
      &#darkWave {
        animation-name: waveRight;
        > path { stroke: #3C0D0D; }
      }

      path {
        stroke-width: .2;
        fill: none;
      }
    }
  }
</style>
