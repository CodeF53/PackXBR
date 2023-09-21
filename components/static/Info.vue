<template>
  <!-- "main" because it contains text that we want to be seen by SEO algorithms -->
  <main class="col centerChildren gap1">
    <h3>About</h3>
    <p class="col gap1">
      <span>
        A utility for upscaling pixel-art images using the xBR algorithm
      </span>
      <span>
        Upscales images using the <a href="https://sourceforge.net/projects/xbrz/">xBRZ</a> scaling algorithm.
      </span>
      <span>
        Losslessly optimizes the outputted images using <a href="https://github.com/shssoichiro/oxipng">OxiPNG</a>.
      </span>
      <span>
        Designed for development of Minecraft resource packs in the <a href="https://modrinth.com/resourcepack/VanillaXBR">VanillaXBR</a> ecosystem
      </span>
    </p>
    <details>
      <summary>TODO:</summary>
      <ul class="col">
        <li title="currently errors during processing are ignored, and images are reverted to their original texture, add feedback">
          Error feedback & Handling
        </li>
        <li title="instead of waiting until all images have been done in manual mode before optimizing, we could optimize images as they are completed. This is difficult as it could introduce a lot of race conditions">
          Optimize while in manual mode (very hard)
        </li>
        <li>Upload icon in logo during input step</li>
        <li>Bigger & cooler button layouts</li>
        <li>Misc Eye Candy</li>
      </ul>
    </details>
    <p id="legal">
      If you did not create or do not own the textures you put into PackXBR, you do not own the textures that PackXBR turns them into.
      Your permission to release or distribute textures made with PackXBR is at the discretion of the creator of the original textures.
      If you re-release stolen textures without permission, even if you've run them through PackXBR, you would be at fault for doing the wrong thing.
    </p>
  </main>
</template>

<style lang="scss">
main {
  > #legal {
    font-size: .65rem;
    line-height: .65rem;
    color: rgba(255, 255, 255, 0.25);
  }
}
</style>
