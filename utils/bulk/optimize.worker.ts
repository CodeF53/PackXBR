import { init as initEncode } from '@jsquash/png/encode'
import optimize, { init as initOxiPNG } from '@jsquash/oxipng/optimise'
import { safeEncodePNG, workerError } from '~/utils/misc'

// on creation, init needed shit
Promise.all([initOxiPNG(), initEncode()]).then(() => {
  // when everything is ready, tell main thread we are initialized
  globalThis.postMessage({})
}).catch(() => {
  // allow fallback decoding when failing to init wasm encoders
  globalThis.postMessage({})
})

// on message, process data
globalThis.onmessage = async (event) => {
  const { input } = event.data

  // encode to png
  let encoded
  try {
    encoded = await safeEncodePNG(input.data)
  }
  catch (error) {
    workerError(error, `While attempting canvas encode on ${input.name}`, ' skipping image because its dumb and stupid')
    globalThis.postMessage({ data: { error: `${input.name} is dumb and refuses to encode for both JSquash and Canvas encoding` } })
    return
  }

  // optimize with oxi
  let optimized
  try {
    optimized = await optimize(encoded, { optimiseAlpha: true })
  }
  catch (error) {
    workerError(error, `While optimizing "${input.name}"`, ' - skipping optimization step')
    optimized = encoded
  }

  // take whichever is smaller, oxi result, or encode result
  const outData = optimized.byteLength < encoded.byteLength ? optimized : encoded

  // Send the result back to the main thread
  globalThis.postMessage({ data: { name: input.name, data: outData } })
}
