// returns true if any pixel is translucent (not solid, not invisible)
export function containsTranslucent(imageData: ImageData): boolean {
  for (let index = 3; index < imageData.data.length; index += 4) {
    if (imageData.data[index] < 255 && imageData.data[index] > 0)
      return true
  }
  return false
}

// sets all translucent pixels to 0 opacity
// ! in-place (modifies the passed variable)
export function cullTranslucent(imageData: ImageData): void {
  for (let index = 3; index < imageData.data.length; index += 4) {
    if (imageData.data[index] < 191)
      imageData.data[index] = 0
    else
      imageData.data[index] = 255
  }
}

export function crop(imageData: ImageData, choppy: number): ImageData {
  const { width, height } = imageData
  const { data } = imageData
  const croppedWidth = width - 2 * choppy
  const croppedHeight = height - 2 * choppy

  const croppedData = new Uint8ClampedArray(croppedWidth * croppedHeight * 4)

  for (let y = 0; y < croppedHeight; y++) {
    for (let x = 0; x < croppedWidth; x++) {
      const srcIndex = ((y + choppy) * width + x + choppy) * 4
      const destIndex = (y * croppedWidth + x) * 4

      croppedData[destIndex] = data[srcIndex]
      croppedData[destIndex + 1] = data[srcIndex + 1]
      croppedData[destIndex + 2] = data[srcIndex + 2]
      croppedData[destIndex + 3] = data[srcIndex + 3]
    }
  }

  return new ImageData(croppedData, croppedWidth, croppedHeight)
}

export function relayer(imageData: ImageData, original: ImageData, scaleFactor: number) {
  const { width: srcWidth } = original
  const { width: destWidth, height: destHeight } = imageData

  const destData = imageData.data
  const srcData = original.data

  const invScaleFactor = 1 / scaleFactor

  for (let y = 0; y < destHeight; y++) {
    const srcY = Math.floor(y * invScaleFactor)

    for (let x = 0; x < destWidth; x++) {
      const destIndex = (y * destWidth + x) * 4
      if (destData[destIndex + 3] !== 0)
        continue

      const srcX = Math.floor(x * invScaleFactor)
      const srcIndex = (srcY * srcWidth + srcX) * 4
      if (srcData[srcIndex + 3] === 0)
        continue

      destData[destIndex] = srcData[srcIndex]
      destData[destIndex + 1] = srcData[srcIndex + 1]
      destData[destIndex + 2] = srcData[srcIndex + 2]
      destData[destIndex + 3] = srcData[srcIndex + 3]
    }
  }
}
