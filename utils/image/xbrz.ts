let instance: WebAssembly.Instance

const ColorFormat = {
  RGB: 0,
  ARGB: 1,
  ARGB_UNBUFFERED: 2,
}

export async function initialize() {
  // Get the correct location of xbrz.wasm
  const wasmPath = new URL('xbrz.wasm', import.meta.url).href

  // Load in xbrz.wasm
  const result = await WebAssembly.instantiateStreaming(fetch(wasmPath), {
    wasi_snapshot_preview1: {
      fd_write: () => {},
      fd_close: () => {},
      fd_seek: () => {},
      proc_exit: () => {},
    },
  })
  instance = result.instance
}

export async function xbrz(imageData: ImageData, scaleFactor: number) {
  // Load WASM env if not already loaded
  if (!instance)
    await initialize()

  // prep vars
  const { width, height } = imageData
  const scaleWidth = width * scaleFactor
  const scaleHeight = height * scaleFactor
  const inputLength = width * height * 4 // 4 values per pixel (RGBA)
  const outputLength = scaleWidth * scaleHeight * 4

  // allocate memory for input data
  const srcData = imageData.data
  const inputSize = inputLength * srcData.BYTES_PER_ELEMENT
  const inputOffset = instance.exports.malloc(inputSize)
  // copy input data into allocated space
  const inputBuffer = new Uint8Array(instance.exports.memory.buffer, inputOffset, inputSize)
  inputBuffer.set(srcData)

  // create memory region for output
  const outputSize = outputLength * srcData.BYTES_PER_ELEMENT
  const outputOffset = instance.exports.malloc(outputSize)

  // scale (fills output memory region with scaled image)
  instance.exports.xbrz_scale(
    scaleFactor,
    inputOffset,
    outputOffset,
    width,
    height,
    ColorFormat.ARGB_UNBUFFERED,
    0, // yFirst
    scaleHeight, // yLast
  )

  // read scaled image from memory
  const resultData = new Uint8ClampedArray(instance.exports.memory.buffer, outputOffset, outputLength)

  // free memory
  instance.exports.free(inputOffset)
  instance.exports.free(outputOffset)

  return new ImageData(resultData, scaleWidth, scaleHeight)
}
