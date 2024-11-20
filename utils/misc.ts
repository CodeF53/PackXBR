import { decode as decodePNG, encode as encodePNG } from '@jsquash/png'
import { createOffscreenContext, setImageData } from '~/utils/image/canvas'

export const isPNG = (file: File) => file.name.toLowerCase().endsWith('.png')
export const isZIP = (file: File) => file.name.toLowerCase().endsWith('.zip')

// processes error into a human readable string, then sends it to the main thread
export function workerError(error: unknown, comment?: string, postComment?: string) {
  let prefix = ''
  if (comment)
    prefix = `${comment}: `

  let errorText = 'Unknown Error'
  if (error && typeof error === 'object' && error.name)
    errorText = `${error.name} - ${error.message}`

  globalThis.postMessage({ error: `${prefix}${errorText}${postComment || ''}` })
}

export async function safeEncodePNG(imageData: ImageData): Promise<ArrayBuffer> {
  try { // try using @jsquash/png encode
    return await encodePNG(imageData)
  }
  catch { // fall back on dumb canvas encode
    // canvas => blob => arrayBuffer
    const ctx = createOffscreenContext()
    setImageData(ctx, imageData)
    return (await ctx.canvas.convertToBlob()).arrayBuffer()
  }
}

export async function safeDecodePNG(buffer: ArrayBuffer): Promise<ImageData> {
  try { // try using @jsquash/png decode
    return await decodePNG(buffer)
  }
  catch { // fall back on dumb canvas decode
    // ArrayBuffer => Blob => URL => HTMLImageElement
    const src = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }))
    const image = new Image()
    image.src = src
    await new Promise(resolve => image.onload = resolve)
    // HTMLImageElement => Canvas => ImageData
    const ctx = createOffscreenContext(image.width, image.height)
    ctx.drawImage(image, 0, 0)
    const imageData = ctx.getImageData(0, 0, image.width, image.height)
    // Clean up URL
    URL.revokeObjectURL(src)
    return imageData
  }
}

export function saveBlob(blob: Blob, fileName: string) {
  // create a URL for the blob
  const url = URL.createObjectURL(blob)
  // create a link to download the blob, and click it
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Clean up by revoking the URL object
  URL.revokeObjectURL(url)
}

export function includesAny(str: string, ...substrings: string[]): boolean {
  return substrings.some(substring => str.includes(substring))
}

export function endsWithAny(str: string, ...substrings: string[]): boolean {
  return substrings.some(substring => str.endsWith(substring))
}
