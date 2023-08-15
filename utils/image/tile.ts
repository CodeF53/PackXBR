function splitSections(inputArray: Array<any> | Uint8ClampedArray, size: number): Array<Array<any>> {
  if (inputArray.length % size !== 0)
    throw new Error('descriptive error')

  const outputArray: Array<any> = []
  for (let i = 0; i < inputArray.length; i += size)
    outputArray.push(inputArray.slice(i, i + size))

  return outputArray
}

// ImageData -> ImageMatrix
function sliceImageData(imageData: ImageData): ImageMatrix {
  const out = splitSections(splitSections(imageData.data, 4), imageData.width)
  return out
}

// ImageMatrix -> ImageData
function spliceImageData(imageMatrix: ImageMatrix): ImageData {
  const width = imageMatrix[0].length
  const height = imageMatrix.length
  const data = new Uint8ClampedArray(width * height * 4)

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++)
      data.set(imageMatrix[r][c], (r * width + c) * 4)
  }
  return new ImageData(data, width, height)
}

function hStack(...matrices: ImageMatrix[]): ImageMatrix {
  const height = matrices[0].length
  if (matrices.some(matrix => matrix.length !== height))
    throw new Error('all heights must be equal when horizontally stacking matrices')

  const out: ImageMatrix = []

  for (let r = 0; r < height; r++)
    out.push(Array.prototype.concat(...matrices.map(matrix => matrix[r])))
  return out
}

function vStack(...matrices: ImageMatrix[]): ImageMatrix {
  const width = matrices[0][0].length
  if (matrices.some(matrix => matrix[0].length !== width))
    throw new Error('all widths must be equal when vertically stacking matrices')

  const out: ImageMatrix = matrices.flat()

  return out
}

function hSlice(imageMatrix: ImageMatrix, start: number, stop: number): ImageMatrix {
  return imageMatrix.map(row => row.slice(start, stop))
}

function vSlice(imageMatrix: ImageMatrix, start: number, stop: number): ImageMatrix {
  return imageMatrix.slice(start, stop)
}

function inverseDirection(direction: TileDirection): TileDirection {
  switch (direction) {
    case 'n': return 's'
    case 's': return 'n'
    case 'e': return 'w'
    case 'w': return 'e'
  }
}

function tileVoid(imageMatrix: ImageMatrix, direction: TileDirection, tileDistance: number): ImageMatrix {
  const width = imageMatrix[0].length
  const height = imageMatrix.length

  switch (direction) {
    case 'n': case 's':
      return Array(tileDistance).fill(Array(width).fill(new Uint8ClampedArray(4)))
    case 'e': case 'w':
      return Array(height).fill(Array(tileDistance).fill(new Uint8ClampedArray(4)))
  }
}

function tileWrap(imageMatrix: ImageMatrix, direction: TileDirection, tileDistance: number): ImageMatrix {
  const width = imageMatrix[0].length
  const height = imageMatrix.length

  switch (direction) {
    case 'n':
      return vSlice(imageMatrix, height - tileDistance, height)
    case 's':
      return vSlice(imageMatrix, 0, tileDistance)
    case 'e':
      return hSlice(imageMatrix, 0, tileDistance)
    case 'w':
      return hSlice(imageMatrix, width - tileDistance, width)
  }
}

function tileExtend(imageMatrix: ImageMatrix, direction: TileDirection, tileDistance: number): ImageMatrix {
  const wrapShort = tileWrap(imageMatrix, inverseDirection(direction), 1)
  const toStack = Array(tileDistance).fill(wrapShort)

  switch (direction) {
    case 'n': case 's':
      return vStack(...toStack)
    case 'e': case 'w':
      return hStack(...toStack)
  }
}

function tileMirror(imageMatrix: ImageMatrix, direction: TileDirection, tileDistance: number): ImageMatrix {
  const wrapShort = tileWrap(imageMatrix, inverseDirection(direction), tileDistance)

  switch (direction) {
    case 'n': case 's':
      return wrapShort.reverse()
    case 'e': case 'w':
      return wrapShort.map(row => row.reverse())
  }
}

function tileGeneric(imageMatrix: ImageMatrix, tileSettings: TileSettings, direction: TileDirection, tileDistance: number): ImageMatrix {
  switch (tileSettings[direction]) {
    case 'void':
      return tileVoid(imageMatrix, direction, tileDistance)
    case 'wrap':
      return tileWrap(imageMatrix, direction, tileDistance)
    case 'extend':
      return tileExtend(imageMatrix, direction, tileDistance)
    case 'mirror':
      return tileMirror(imageMatrix, direction, tileDistance)
  }
}

export function tile(imageData: ImageData, tileSettings: TileSettings, tileDistance: number): ImageData {
  let imageMatrix = sliceImageData(imageData)

  const tileN = tileGeneric(imageMatrix, tileSettings, 'n', tileDistance)
  const tileS = tileGeneric(imageMatrix, tileSettings, 's', tileDistance)

  imageMatrix = vStack(tileN, imageMatrix, tileS)

  const tileE = tileGeneric(imageMatrix, tileSettings, 'e', tileDistance)
  const tileW = tileGeneric(imageMatrix, tileSettings, 'w', tileDistance)

  imageMatrix = hStack(tileW, imageMatrix, tileE)
  return spliceImageData(imageMatrix)
}
