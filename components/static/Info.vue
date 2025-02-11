<template>
  <!-- "main" because it contains text that we want to be seen by SEO algorithms -->
  <main class="col centerChildren gap1">
    <h3>About</h3>
    <p class="col">
      <span>
        A utility for upscaling pixel-art images using the
        <a href="https://sourceforge.net/projects/xbrz/">xBRZ</a>
        algorithm
      </span>
      <span>
        Designed for development of Minecraft resource packs in the
        <a href="https://modrinth.com/resourcepack/VanillaXBR">VanillaXBR</a>
        ecosystem
      </span>
      <span>
        For support, join the
        <a href="https://discord.com/invite/8N4xzej">VanillaXBR Discord server</a>
        and ask in <code>#packxbr-discussion</code>
      </span>
    </p>
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
    text-align: center;
    font-size: .65rem;
    line-height: .65rem;
    color: rgba(255, 255, 255, 0.25);
  }
}
</style>
