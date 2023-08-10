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
    if (imageData.data[index] < 255)
      imageData.data[index] = 0
  }
}
