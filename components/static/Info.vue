<template>
  <!-- "main" because it contains text that we want to be seen by SEO algorithms -->
  <main class="col centerChildren gap3">
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
        Designed for development of Minecraft resource packs in the <a href="modrinth.com/resourcepack/VanillaXBR">VanillaXBR</a> ecosystem
      </span>
    </p>
    <details>
      <summary>TODO:</summary>
      <ul class="col">
        <li title="currently errors during processing are ignored, and images are reverted to their original texture, add feedback">
          Error feedback & Handling
        </li>
        <li>Ding when done</li>
        <li>Optimize toggle (default on)</li>
        <li>Hide/Disable threads option when manual is selected</li>
        <li>
          Functionality from original
          <ul>
            <li>
              Fancy File input
            </li>
            <li>
              Image processor
              <ul>
                <li>Manual</li>
                <ul>
                  <li>Detail Image viewer (click to view big)</li>
                  <li>Optimize as scale</li>
                  <li>"Processing" placeholder (while waiting for current image to process)</li>
                  <li>Presets</li>
                  <li>Tooltips</li>
                </ul>
              </ul>
            </li>
            <li>Proper output-zip save name</li>
            <li>Proper Favicon</li>
          </ul>
        </li>
        <li>
          UI changes from Misterk
          <ul>
            <li>Color-changing progress bars</li>
            <li>Persistent Logo</li>
            <li>Other shit</li>
          </ul>
        </li>
      </ul>
    </details>
  </main>
</template>
