<template>
  <details id="shortcutGuide">
    <summary>Shortcut Guide</summary>
    <span class="row gap1">
      <kbd>.</kbd>
      Toggle Relayer
    </span>
    <span class="row gap1">
      <kbd>Shift</kbd> + <kbd class="cycleAll" />
      Cycle Edge Mode
    </span>
    <span class="row gap1">
      <kbd>Ctrl</kbd> + <kbd class="cycleUD" />
      Change Preset
    </span>
    <span class="row gap1">
      <kbd class="cycleLR" />
      Previous / Next Image
    </span>
    <span class="row gap1">
      <kbd>Space</kbd>
      Skip Image
    </span>
    <span class="row gap1">
      <kbd>P</kbd>
      Preview Result
    </span>
  </details>
</template>

<style>
  /* good looking keys */
  kbd {
    background-color: #373737;
    border-radius: 0.25rem;
    border: 1px solid #191919;
    box-shadow: 0 2px 0 1px #191919;

    font-size: 0.75em;

    min-width: 0.75rem;
    display: block;
    text-align: center;

    padding: 2px 5px;

    position: relative;
    top: -1px;
  }

  /* cycling between options for which arrow keys can be pressed */
  @keyframes cycleAll {
    0%   { content: "↑"; }
    33%  { content: "→"; }
    66%  { content: "↓"; }
    100% { content: "←"; }
  }
  .cycleAll {
    width: 1.5rem;
  }
  .cycleAll::after {
    animation: cycleAll 4s linear infinite;
    content: '↑';
  }

  @keyframes cycleLR {
    from { content: "←"; }
    to   { content: "→"; }
  }
  .cycleLR {
    width: 1.5rem;
  }
  .cycleLR::after {
    animation: cycleLR 2s linear infinite;
    content: '←';
  }

  @keyframes cycleUD {
    from { content: "↑"; }
    to   { content: "↓"; }
  }
  .cycleUD::after {
    animation: cycleUD 2s linear infinite;
    content: '↑';
  }
</style>
