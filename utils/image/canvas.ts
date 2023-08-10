export function createContext(canvas: HTMLCanvasElement = document.createElement('canvas')): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.imageSmoothingEnabled = false
  return ctx
}

export function setImageData(ctx: CanvasRenderingContext2D, imageData: ImageData) {
  const { canvas } = ctx
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
}
