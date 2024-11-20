import { init as initEncode } from '@jsquash/png/encode'
import { safeEncodePNG, workerError } from '~/utils/misc'

// on creation, init needed shit
initEncode().then(() => {
  // when everything is ready, tell main thread we are initialized
  globalThis.postMessage({})
}).catch(console.error)

// on message, process data
globalThis.onmessage = async (event) => {
  const { input } = event.data

  // encode to png
  let data
  try {
    data = await safeEncodePNG(input.data)
  }
  catch (error) {
    workerError(error, `While attempting canvas encode on ${input.name}`, ' skipping image because its dumb and stupid')
    globalThis.postMessage({ data: { error: `${input.name} is dumb and refuses to encode for both JSquash and Canvas encoding` } })
    return
  }

  // Send the result back to the main thread
  globalThis.postMessage({ data: { name: input.name, data } })
}
