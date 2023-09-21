import { init as initEncode } from '@jsquash/png/encode'
import { encode as encodePNG } from '@jsquash/png'
import optimize, { init as initOxiPNG } from '@jsquash/oxipng/optimise'

// on creation, init needed shit
Promise.all([initOxiPNG(), initEncode()]).then(() => {
  // when everything is ready, tell main thread we are initialized
  globalThis.postMessage({})
}).catch(console.error)

// on message, process data
globalThis.onmessage = async (event) => {
  const { input } = event.data

  // encode to png
  const encoded = await encodePNG(input.data)
  // optimize with oxi
  const optimized = await optimize(encoded, { optimiseAlpha: true })
  // take whichever is smaller, oxi result, or encode result
  const outData = optimized.byteLength < encoded.byteLength ? optimized : encoded

  // Send the result back to the main thread
  globalThis.postMessage({ data: { name: input.name, data: outData } })
}
