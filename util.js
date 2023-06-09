import encodePngBuffer from '@jsquash/png'
import optimize from '@jsquash/oxipng'

export const isPNG = ({name}) => name.endsWith('.png')
export const isZIP = ({name}) => name.endsWith('.zip')

/**
 * Downloads a blob as a file with the specified filename.
 *
 * @param {Blob} blob - The blob to be downloaded.
 * @param {string} filename - The name of the file to be saved.
 * @returns {void}
 */
export function saveBlob(blob, filename) {
  // create a URL for the blob
  const url = URL.createObjectURL(blob)

  // create a link to download the blob, and click it
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // Clean up by revoking the URL object
  URL.revokeObjectURL(url)
}

/**
 * Converts a canvas to a buffer asynchronously.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to convert.
 * @returns {Promise<ArrayBuffer>} - A promise that resolves to a ArrayBuffer containing the canvas image data in PNG format.
 */
export async function canvasToOptimizedBuffer(canvas) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const buffer = await encodePngBuffer(ctx.getImageData(0, 0, width, height))
  return await optimize(buffer, { level: 6, interlace: false })
}
