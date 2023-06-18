import { createApp } from 'petite-vue';
import process_image from './process_image.js';
import { initialize as initScaler } from 'xbrzWA';
import { canvasToOptimizedBuffer, isPNG, isZIP, saveBlob } from './util.js'
import { init as initPngEncode } from '@jsquash/png'
import { init as initOptimizer } from '@jsquash/oxipng'
import pLimit from 'p-limit'
import Viewer from 'viewerjs'

// a place to put stuff you don't have a place for, because they don't really belong anywhere
const garbageHole = document.querySelector('body > #garbageHole')

// init viewer
const viewerImg = document.createElement('img')
viewerImg.id = 'viewerImg'
const viewer = new Viewer(viewerImg, {
  navbar: false,
  title: false,
  container: garbageHole,
  toolbar: {
    zoomIn: true, zoomOut: true, oneToOne: true, reset: true,
    rotateLeft: true, rotateRight: true, flipHorizontal: true, flipVertical: true,
    prev: false, play: false, next: false,
  },
})
garbageHole.appendChild(viewerImg) // put the image in the garbageHole so the viewer will work

createApp({
  mounted() { document.body.className = 'vue-mounted' },

  tooltips: {
    preset: 'changes all 4 edge modes at once',
    relayer: 'un-rounds corners, useful for models/entities',
    wrap: 'changes how the processor treats whats "outside" the edge of this dropdown',
    back: 'goes to previous image, undoing your prior settings for it',
    next: 'goes to next image, saving result (right image)',
    skip: 'goes to next image, saving source (left image)',
    semiTranslucencyCulling: 'remove pixels that are only partially translucent, (Highly Recommended)',
  },

  appState: 'fileInput',

  zip: new JSZip(),
  selectedText: 'No files selected',
  handlingZip: false,

  scaleFactor: 4,
  isAuto: true,

  images: [],
  processedImages: [],
  imageIndex: 0,

  hotkeyHandler(e) {
    if (this.appState === 'processing' && !this.isAuto) {
      this.manualHotkeyHandler(e);
    }
  },

  // #region packInput stuff
  handleFileDrop(e) { this.handleFiles([...e.dataTransfer.files]) },
  handleFileInput(e) { this.handleFiles([...e.target.files]) },
  async handleFiles(files) {
    this.images = [];

    // if there are any zip files, select the first one to process
    let zipFile
    for (const file of files) {
      if (isZIP(file)) { zipFile = file; break }
    }

    // save selected images into array
    if (zipFile) {
      // if zip, unzip first
      this.selectedText = zipFile.name
      this.handlingZip = true

      const zip = await this.zip.loadAsync(zipFile)
      this.images = Object.values(zip.files).filter(isPNG)
      // files from JSZip don't have stuff in the same places, so remap them so the rest of the code works
      this.images = await this.images.map(img => ({
        ...img, size: img._data.uncompressedSize,
        arrayBuffer: async () => img.async("ArrayBuffer")
      }))
    } else {
      this.images = files.filter(isPNG)
      this.selectedText = `${this.images.length} image${this.images.length > 1? 's' : ''}`
    }

    // in case of somehow not having any images, panic
    if (this.images.length === 0) {
      console.error('File selected, but no images found! Did the user select a zip that doesn\'t contain any .pngs?')
      this.reset()
    }
  },
  // #endregion

  async startScaling() {
    this.appState = 'processing'; // set app state

    // initialize xBRZ scaler's webassembly environment
    await Promise.all([initScaler(), initPngEncode(), initOptimizer(), this.$nextTick()])

    if (this.isAuto) {
      // scale every image on asynchronous threads, waiting for all to complete
      await this.autoScale();
      this.appState = 'complete';
      await this.saveResult()
    } else {
      this.loadCurrentToCanvas();
      this.updateImage();
    }
  },

  async autoScale() {
    const limit = pLimit(32)
    // process each image asynchronously, wait for all to complete
    this.processedImages = await Promise.all(this.images.map(async pngFile => await limit(async () => {
      const { name } = pngFile;

      // #region configure processing params based on image path
      let tile = { n: 'void', s: 'void', e: 'void', w: 'void' }
      let relayer = false;
      let skip = false;

      if (name.includes('block/')) {
        tile = { n: 'wrap', s: 'wrap', e: 'wrap', w: 'wrap' }
      } else if (name.includes('painting/')) {
        tile = { n: 'extend', s: 'extend', e: 'extend', w: 'extend' }
      } else if (name.includes('model/') || name.includes('entity/')) {
        relayer = true;
      } else if (name.includes('font/') || name.includes('colormap/') || name.endsWith('pack.png') || name.endsWith('title/minecraft.png')) {
        skip = true;
      }
      // #endregion

      // process the image
      const processedCanvas = await process_image({ pngFile, scaleFactor: this.scaleFactor, tile, relayer, skip });;

      // convert the image to a buffer (easily saveable), and optimize it (OptiPng)
      const data = await canvasToOptimizedBuffer(processedCanvas);

      // increment progressBar
      this.imageIndex++;

      return { name, data };
    })));
  },

  // #region manual stuff
  tileOptions: ['void', 'wrap', 'extend', 'mirror'],
  tile: { n: 'void', s: 'void', e: 'void', w: 'void' },
  tilePresets: [
    { name: 'Block', value: { n: 'wrap', s: 'wrap', e: 'wrap', w: 'wrap' } },
    { name: 'Plant', value: { n: 'void', s: 'mirror', e: 'void', w: 'void' } },
    { name: 'Item', value: { n: 'void', s: 'void', e: 'void', w: 'void' } },
  ],
  relayer: false,
  semiTranslucencyCulling: true,

  async loadCurrentToCanvas() {
    const img = new Image();
    img.src = URL.createObjectURL(new Blob([await this.images[this.imageIndex].arrayBuffer()], { type: 'image/png' }));
    await new Promise(resolve => img.onload = resolve);
    const { width, height } = img;

    this.$refs.original.width = width;
    this.$refs.original.height = height;
    const ctx = this.$refs.original.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
  },
  async updateImage() {
    // temporarily switch to a "scaling" graphic, as we wait for the processing to finish
    const ctx = this.$refs.processed.getContext('2d');
    this.$refs.processed.width = 64;
    this.$refs.processed.height = 64;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('processing', 32, 32);

    process_image({
      pngFile: this.images[this.imageIndex],
      scaleFactor: this.scaleFactor,
      tile: this.tile,
      relayer: this.relayer,
      semiTranslucencyCulling: this.semiTranslucencyCulling,
      skip: false,
    }).then((processed) => {
      const { width, height } = processed;

      this.$refs.processed.width = width;
      this.$refs.processed.height = height;
      ctx.drawImage(processed, 0, 0, width, height);
    });
  },
  loadImages() {
    this.loadCurrentToCanvas();
    this.updateImage();
  },
  async skip() {
    this.processedImages.push({
      name: this.images[this.imageIndex].name,
      data: await canvasToOptimizedBuffer(this.$refs.original)
    });
    this.imageIndex++;
    if (this.imageIndex >= this.images.length) {
      this.appState = 'complete';
      this.saveResult();
    } else { this.loadImages(); }
  },
  async next() {
    this.processedImages.push({
      name: this.images[this.imageIndex].name,
      data: await canvasToOptimizedBuffer(this.$refs.processed)
    });
    this.imageIndex++;
    if (this.imageIndex >= this.images.length) {
      this.appState = 'complete';
      this.saveResult();
    } else { this.loadImages(); }
  },
  back() {
    if (this.imageIndex === 0) { return }
    this.processedImages.pop();
    this.imageIndex--;
    this.loadImages();
  },

  cycleTileOption(option) {
    this.tile[option] = this.tileOptions[(this.tileOptions.indexOf(this.tile[option])+1) % this.tileOptions.length];
    this.updateImage();
  },
  cycleTilePreset(offset) {
    // find the current preset in a way that is safe because comparing objects is STUPID
    const tilePresetValues = this.tilePresets.map(a=>a.value);
    let presetIndex = 0;
    tilePresetValues.forEach((preset, i) => {
      if (JSON.stringify(preset) === JSON.stringify(this.tile)) {
        presetIndex = i;
      }
    });
    const newPresetIndex = (presetIndex + offset + tilePresetValues.length) % tilePresetValues.length

    this.tile = { ...tilePresetValues[newPresetIndex] }
    this.updateImage();
  },

  manualHotkeyHandler(e) {
    // disable hotkeys while viewer is open
    if (viewer.fulled) { return }

    const { key, ctrlKey, shiftKey } = e

    if (shiftKey) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) { e.preventDefault(); }

      switch (key) {
        case 'ArrowUp':
          return this.cycleTileOption('n')
        case 'ArrowDown':
          return this.cycleTileOption('s')
        case 'ArrowLeft':
          return this.cycleTileOption('w')
        case 'ArrowRight':
          return this.cycleTileOption('e')
      }
    } else if (ctrlKey) {
      if (['ArrowUp', 'ArrowDown'].includes(key)) { e.preventDefault(); }

      switch (key) {
        case 'ArrowUp':
          return this.cycleTilePreset(-1)
        case 'ArrowDown':
          return this.cycleTilePreset(1)
      }
    } else {
      if ([' ', '.', 'ArrowLeft', 'ArrowRight', 'p'].includes(key)) { e.preventDefault(); }

      switch (key) {
        case 'ArrowLeft':
          return this.back()
        case 'ArrowRight':
          return this.next()
        case ' ':
          return this.skip()
        case '.':
          this.relayer = !this.relayer;
          return this.updateImage();
        case 'p':
          return this.viewCanvas({ target: this.$refs.processed })
      }
    }
  },

  // given a click event, shows the canvas clicked on the viewer
  viewCanvas(e) {
    const canvas = e.target
    viewerImg.src = canvas.toDataURL()
    viewer.show()
    viewer.update()
  },
  // #endregion

  async saveResult() {
    // if we have a single image, we can save it directly, no zip
    if (!this.handlingZip && this.processedImages.length === 1) {
      // encode png to blob
      const blob = new Blob([this.processedImages[0].data], { type: 'image/png' })
      // save it
      saveBlob(blob, this.processedImages[0].name)
    } else {
      // add every image to a zip file
      this.processedImages.forEach(({ name, data }) => {
        this.zip.file(name, data)
      })
      // encode the zip as a blob
      const zipBlob = await this.zip.generateAsync({ type: 'blob' })

      let outputName = `xbr_${this.scaleFactor}x.zip`
      if (this.handlingZip) { outputName = `${this.selectedText.split(".").slice(0,-1).join(".")}_${outputName}`}
      // save it retaining original zip filename if input was a zip
      saveBlob(zipBlob, outputName)
    }
  },

  reset() {
    this.appState = 'fileInput'

    this.zip = new JSZip()
    this.selectedText = 'No files selected'
    this.handlingZip = false

    this.scaleFactor = 4
    this.isAuto = true

    this.images = []
    this.processedImages = []
    this.imageIndex = 0
  }
}).mount();
