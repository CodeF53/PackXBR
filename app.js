import { createApp } from "https://unpkg.com/petite-vue?module";
import process_image from './process_image.js';

createApp({
  appState: 'fileInput',

  file: null,
  zip: null,
  scaleFactor: 4,
  isAuto: true,

  images: [],
  scaledImages: [],
  imageIndex: 0,

  // #region packInput stuff
  isFileDrag: false,
  handleDragOver(e) {
    e.preventDefault();
    this.isFileDrag = true;
  },
  handleDragLeave() { this.isFileDrag = false; },
  handleFileInput(e) { this.file = e.target.files[0] },
  handleFileDrop(e) {
    e.preventDefault();
    this.isFileDrag = false;
    this.file = e.dataTransfer.files[0];
  },
  // #endregion

  async startScaling() {
    this.appState = 'scaling'; // set app state

    // Get all the png files in the zip
    this.zip = new JSZip();
    const zipFile = await this.zip.loadAsync(this.file);
    this.images = Object.values(zipFile.files).filter(file => file.name.endsWith('.png'));

    if (this.isAuto) {
      // scale every image on asynchronous threads, waiting for all to complete
      await this.autoScale();
      await this.saveZip();
      this.appState = 'complete';
    } else {
      // TODO: implement manual scaler
    }
  },

  async autoScale() {
    // process each image asynchronously, wait for all to complete
    this.scaledImages = await Promise.all(this.images.map(async pngFile => {
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
      } else if (name.includes('font/') || name.includes('colormap/') || name.includes('pack.png')) {
        skip = true;
      }
      // #endregion

      // process the image
      const scaledCanvas = await process_image({ pngFile, scaleFactor: this.scaleFactor, tile, relayer, skip });

      // convert the image to data that can be easily saved
      const data = scaledCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')

      // increment progressBar
      this.imageIndex = this.imageIndex + 1;

      return { name, data };
    }));
  },

  async saveZip() {
    // overwrite old images with processed images in inputted zip file
    this.scaledImages.forEach(({ name, data }) => {
      this.zip.file(name, data, { base64: true });
    });

    // Generate the zip file as a blob
    const zipBlob = await this.zip.generateAsync({ type: 'blob' });

    // Save the zip file as the (input_filename)_xbr_(scaleFactor)x.zip
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(zipBlob);
    downloadLink.download = this.file.name.split(".").slice(0,-1).join(".")+`_xbr_${this.scaleFactor}x.zip`
    downloadLink.click();
  },

  reset() {
    this.appState = 'fileInput';

    this.file = null;
    this.scaleFactor = 4;
    this.isAuto = true;

    this.images = [];
    this.scaledImages = [];
    this.imageIndex = 0;
  }
}).mount('#vueMount');
