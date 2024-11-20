export function createOffscreenContext(width = 0, height = 0): OffscreenCanvasRenderingContext2D {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  return ctx
}

export function createContext(canvas: HTMLCanvasElement = document.createElement('canvas')): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.imageSmoothingEnabled = false
  return ctx
}

export function setImageData(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, imageData: ImageData) {
  const { canvas } = ctx
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
}
