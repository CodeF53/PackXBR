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
    <div>
      <h3>TODO:</h3>
      <ul class="col">
        <li title="currently errors during processing are ignored, and images are reverted to their original texture, add feedback">
          Error feedback & Handling
        </li>
        <li>Ding when done</li>
        <li>Num threads to use (options, default 2)</li>
        <li>Optimize toggle (default on)</li>
        <li>
          Functionality from original
          <ul>
            <li>
              File input
              <ul>
                <li>Drop input</li>
                <li>Paste input</li>
                <li>Fancy</li>
              </ul>
            </li>
            <li>
              Image processor
              <ul>
                <li>Manual</li>
              </ul>
            </li>
            <li>Proper output-zip save name</li>
            <li>Proper Favicon</li>
          </ul>
        </li>
        <li>
          UI changes from Misterk
          <ul>
            <li>Background</li>
            <li>Color-changing progress bars</li>
            <li>Persistent Logo</li>
            <li>Other shit</li>
          </ul>
        </li>
      </ul>
    </div>
  </main>
</template>
