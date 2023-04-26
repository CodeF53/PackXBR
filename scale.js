import {scaleImage} from "https://will-wyx.github.io/xbrz/src/xBRZ.js"

// TODO: take tiling inputs tile(N,S,E,W), can be 'void', 'wrap', 'extend', or 'mirror'
// TODO: take 'relayer' input, if true it underlays a nearest neighbor scale of the input
// TODO: implement transparency masking (split into opacity)
/**
 * Asynchronously loads a PNG file and scales it by a factor of 4 using the `scaleCanvas` function.
 *
 * @param {File} pngFile - The PNG file to be loaded and scaled
 * @param {number} scaleSize - The factor by which to scale the canvas, can be 2, 3, 4, 5, or 6, defaults to 4
 * @returns {string} The data URL of the scaled PNG image as a base64-encoded string, without the `data:image/png;base64,` prefix
 */
export default async function scale(pngFile, scaleSize) {
  // Load the png file into an Image object
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([await pngFile.async('uint8array')], { type: 'image/png' }));
  await new Promise(resolve => img.onload = resolve);

  // create a new canvas and draw the scaled image to it
  const canvas = document.createElement('canvas');
  const {width, height} = img;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, width, height);

  // scale to new canvas
  const canvasScale = scaleCanvas(ctx, scaleSize)

  // return finished thing encoded into a base 64 string
  return canvasScale.toDataURL('image/png').replace(/^data:image\/png;base64,/, '')
}


/**
 * Scales the provided canvas context using xBRz by the given factor.\
 * Based on https://github.com/will-wyx/xbrz/blob/master/index.html.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas context to be scaled
 * @param {number} scaleSize - The factor by which to scale the canvas, can be 2, 3, 4, 5, or 6
 * @returns {HTMLCanvasElement} A new canvas element that has been scaled by the given factor
 */
function scaleCanvas(ctx, scaleSize=4) {
  // get the canvas image data
  const { width, height } = ctx.canvas
  const imageData = ctx.getImageData(0, 0, width, height);

  // convert the image data to a 1D array of pixels
  const buffer = Array.from(imageData.data);
  let source = [];
  for (let i = 0, len = buffer.length; i < len; i += 4) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    const a = buffer[i + 3];
    const pixel = a << 24 | r << 16 | g << 8 | b;
    source.push(pixel)
  }

  // scale the image
  let target = new Array(width * scaleSize * height * scaleSize);
  target.fill(0);
  scaleImage(scaleSize, source, target, width, height, 0, height);

  // convert the scaled image back to image data
  let bufferScale = [];
  for (let i = 0, len = target.length; i < len; ++i) {
    const pixel = target[i];
    const a = (pixel >> 24) & 0xff;
    const r = (pixel >> 16) & 0xff;
    const g = (pixel >> 8) & 0xff;
    const b = (pixel) & 0xff;
    bufferScale.push(r);
    bufferScale.push(g);
    bufferScale.push(b);
    bufferScale.push(a);
  }

  const imgScaleBuffer = new Uint8ClampedArray(bufferScale);
  const widthScale = width * scaleSize;
  const heightScale = height * scaleSize;
  const imgScaleData = new ImageData(imgScaleBuffer, widthScale, heightScale);

  // create a new canvas and draw the scaled image to it
  const canvasScale = document.createElement('canvas');
  canvasScale.width = widthScale;
  canvasScale.height = heightScale;
  const ctxScale = canvasScale.getContext('2d');

  ctxScale.putImageData(imgScaleData, 0, 0)

  return canvasScale
}