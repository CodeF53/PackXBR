import {scaleImage} from "https://will-wyx.github.io/xbrz/src/xBRZ.js"

// TODO: Fix Semi-Translucency culling
/**
 * Asynchronously loads a PNG file and scales it by a factor of 4 using the `scaleCanvas` function.
 *
 * @param {File} pngFile - The PNG file to be loaded and scaled
 * @param {number} scaleSize - The factor by which to scale the canvas, can be 2, 3, 4, 5, or 6, defaults to 4
 * @returns {string} The data URL of the scaled PNG image as a base64-encoded string, without the `data:image/png;base64,` prefix
 */
export default async function process_image({ pngFile, scaleFactor, tile, relayer, skip }) {
  // Load the png file into an Image object
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([await pngFile.async('uint8array')], { type: 'image/png' }));
  await new Promise(resolve => img.onload = resolve);
  const { width, height } = img;

  // create a new canvas and draw the scaled image to it
  const ctx = createCanvas(img)
  ctx.drawImage(img, 0, 0, width, height);
  let { canvas } = ctx;

  // skip scaling image if its too big, or has already been deemed skipped
  if (skip || width > 256 || height > 256) { return canvas; }

  // TODO: reduce unnecessary excess tiling, (only tile out scaleFactor pixels in every direction)
  // draw surrounding tiles
  // tile north and south
  const imgTileNorth = tileDict[tile.n](canvas, 'n');
  const imgTileSouth = tileDict[tile.s](canvas, 's');
  // merge
  canvas = vStack(imgTileNorth, canvas, imgTileSouth);
  // tile east and west
  const imgTileEast = tileDict[tile.e](canvas, 'e');
  const imgTileWest = tileDict[tile.w](canvas, 'w');
  // merge
  canvas = hStack(imgTileEast, canvas, imgTileWest);

  const shouldCull = !containsSemiTranslucency(canvas);

  // split image into alpha and rgb channels
  let [alphaCanvas, rgbCanvas] = splitRGB_A(canvas);

  // upscale split images
  alphaCanvas = scaleCanvas(alphaCanvas.getContext('2d'), scaleFactor);
  rgbCanvas = scaleCanvas(rgbCanvas.getContext('2d'), scaleFactor);

  // merge upscaled images
  canvas = mergeRGB_A(rgbCanvas, alphaCanvas)

  if (shouldCull) { cullSemiTranslucency(canvas); }

  // crop away tiling
  const cropped = createCanvas({ width: width * scaleFactor, height: height * scaleFactor });
  cropped.drawImage(canvas, -width * scaleFactor, -height * scaleFactor);
  canvas = cropped.canvas;

  if (relayer) {
    // TODO: underlay nearest neighbor scale of the input
  }

  // return finished thing encoded into a base 64 string
  return canvas;
}

function mergeRGB_A(rgbCanvas, alphaCanvas) {
  const ctx = rgbCanvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, rgbCanvas.width, rgbCanvas.height);
  const alphaCtx = alphaCanvas.getContext('2d');
  const alphaData = alphaCtx.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = alphaData.data[i];
    imageData.data[i + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);

  return rgbCanvas;
}

function splitRGB_A(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Create a grayscale canvas of the alpha channel
  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = canvas.width;
  alphaCanvas.height = canvas.height;
  const alphaCtx = alphaCanvas.getContext('2d');
  const alphaData = alphaCtx.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    alphaData.data[i] = alpha;
    alphaData.data[i + 1] = alpha;
    alphaData.data[i + 2] = alpha;
    alphaData.data[i + 3] = 255;
  }

  alphaCtx.putImageData(alphaData, 0, 0);
  ctx.putImageData(imageData, 0, 0);

  return [alphaCanvas, canvas];
}

function cullSemiTranslucency(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha > 0 && alpha < 255) {
      imageData.data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function containsSemiTranslucency(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha > 0 && alpha < 255) {
      return true;
    }
  }

  return false;
}

// creates an empty canvas, with width and height of given image
function createCanvas({ width, height }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

function hStack(...canvases) {
  const totalWidth = canvases.reduce((acc, canvas) => acc + canvas.width, 0);
  const maxHeight = Math.max(...canvases.map(canvas => canvas.height));

  const result = document.createElement('canvas');
  result.width = totalWidth;
  result.height = maxHeight;
  const ctx = result.getContext('2d');

  let currentX = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, currentX, 0);
    currentX += canvas.width;
  }

  return result;
}

function vStack(...canvases) {
  const totalHeight = canvases.reduce((acc, canvas) => acc + canvas.height, 0);
  const maxWidth = Math.max(...canvases.map(canvas => canvas.width));

  const result = document.createElement('canvas');
  result.width = maxWidth;
  result.height = totalHeight;
  const ctx = result.getContext('2d');

  let currentY = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, currentY);
    currentY += canvas.height;
  }

  return result;
}

function tileVoid(img) {
  return createCanvas(img).canvas;
}

function tileWrap(img) {
  const {width, height} = img;
  const ctx = createCanvas(img);
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.canvas;
}

function tileExtend(img, direction) {
  const {width, height} = img;
  const ctx = createCanvas({width, height});

  switch (direction) {
    case 'n':
      ctx.drawImage(img, 0, 0, width, 1, 0, 0, width, height);
      break;
    case 's':
      ctx.drawImage(img, 0, height-1, width, 1, 0, 0, width, height);
      break;
    case 'e':
      ctx.drawImage(img, 0, 0, 1, height, 0, 0, width, height);
      break;
    case 'w':
      ctx.drawImage(img, width - 1, 0, 1, height, 0, 0, width, height);
      break;
  }
  return ctx.canvas;
}

function tileMirror(img, direction) {
  const {width, height} = img;
  const ctx = createCanvas(img);

  if (['n', 's'].includes(direction)) {
    ctx.translate(0, height);
    ctx.scale(1, -1);
  } else {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(img, 0, 0, width, height);

  return ctx.canvas;
}

const tileDict = {
  void: (img, direction) => tileVoid(img, direction),
  wrap: (img, direction) => tileWrap(img, direction),
  extend: (img, direction) => tileExtend(img, direction),
  mirror: (img, direction) => tileMirror(img, direction)
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