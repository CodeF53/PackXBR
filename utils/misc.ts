import { createContext, setImageData } from '~/utils/image/canvas'

export const isPNG = (file: File) => file.name.toLowerCase().endsWith('.png')
export const isZIP = (file: File) => file.name.toLowerCase().endsWith('.zip')

// when @jsquash/png encode doesn't work, we need a fallback
export async function alternateEncodePNG(imageData: ImageData): Promise<ArrayBuffer> {
  // put onto canvas
  const ctx = createContext()
  setImageData(ctx, imageData)
  // canvas => blob => arrayBuffer
  return new Promise((resolve, _reject) => {
    ctx.canvas.toBlob(async blob => resolve(await blob!.arrayBuffer()))
  })
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
