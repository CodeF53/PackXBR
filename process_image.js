import {scale} from "https://codef53.github.io/xbrzWA/xbrz.js"

/**
 * Asynchronously loads a PNG file, then processes it according to the inputs
 *
 * @param {File} pngFile - The PNG file to be loaded and scaled
 * @param {number} scaleFactor - The factor by which to scale the canvas, can be 2, 3, 4, 5, or 6, defaults to 4\
 * @param {tile} - An object containing information how each edge of the image should be treated.
 *   Each edge can be `void`, `wrap`, `extend`, or `mirror`
 *   example: `{ n: 'void', s: 'void', e: 'void', w: 'void' }`
 * @returns {canvas} A canvas containing the processed image
 */
export default async function process_image({ pngFile, scaleFactor, tile, relayer, skip }) {
  // Load the png file into an Image object
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([await pngFile.async('uint8array')], { type: 'image/png' }));
  await new Promise(resolve => img.onload = resolve);
  const { width, height } = img;

  try {
    // create a new canvas and draw the original image to it
    const ctx = createCanvas(img)
    ctx.drawImage(img, 0, 0, width, height);
    let { canvas } = ctx;

    // skip images deemed skipped
    if (skip) { return canvas; }

    // determine if image should undergo culling
    const shouldCull = !containsSemiTranslucency(canvas);

    // #region draw surrounding tiles
    // TODO: reduce unnecessary excess tiling, (only tile out scaleFactor pixels in every direction)
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
    // #endregion

    // upscale
    canvas = await scale(canvas, scaleFactor);

    if (shouldCull) { cullSemiTranslucency(canvas); }

    // #region crop away tiling
    const cropped = createCanvas({ width: width * scaleFactor, height: height * scaleFactor });
    cropped.drawImage(canvas, -width * scaleFactor, -height * scaleFactor);
    canvas = cropped.canvas;
    // #endregion

    if (relayer && shouldCull) {
      // underlay nearest neighbor scale of the input
      const underlayCTX = createCanvas(canvas);
      underlayCTX.drawImage(img, 0, 0, width*scaleFactor, height*scaleFactor);
      const underlayCanvas = underlayCTX.canvas;

      underlay(canvas, underlayCanvas);
    }

    return canvas;
  } catch (error) {
    console.error(`error occurred while scaling ${pngFile.name}`);
    console.error(error);

    const errorNode = document.createElement('span');
    errorNode.className = 'error';
    errorNode.innerText = `error occurred while scaling ${pngFile.name}`;
    document.body.querySelector('.errors').appendChild(errorNode);

    // return the original image
    const ctx = createCanvas(img);
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.canvas;
  }
}

function underlay(canvas, underlayCanvas) {
  // Get the 2D contexts of the canvases
  const ctx = canvas.getContext('2d');
  const underlayCtx = underlayCanvas.getContext('2d');

  // Get the dimensions of the canvases
  const { width, height } = canvas;

  // Iterate over each pixel
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Get the RGBA values of the pixel in canvas
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const alpha = pixelData[3];

      // If the alpha is 0, replace the pixel with the corresponding pixel in underlayCanvas
      if (alpha === 0) {
        const underlayPixelData = underlayCtx.getImageData(x, y, 1, 1).data;
        if (underlayPixelData[3] !== 0) {
          console.log(pixelData)
          console.log(underlayPixelData)
        }
        ctx.putImageData(new ImageData(underlayPixelData, 1, 1), x, y);
      }
    }
  }
}

/**
 * removes all pixels from canvas with 0 < alpha < 255 (anything that isn't fully solid or fully transparent)
 */
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

/**
 * returns true if canvas contains any pixels where 0 < alpha < 255 (anything that isn't fully solid or fully transparent)
 */
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

/**
 * creates an empty canvas, with width and height of given image or canvas
 */
function createCanvas({ width, height }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

/**
 * given any number of canvases, puts them into a row in a single canvas
 */
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

/**
 * given any number of canvases, puts them into a column in a single canvas
 */
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
