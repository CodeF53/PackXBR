import { encode as encodePNG } from '@jsquash/png'
import { init as initEncode } from '@jsquash/png/encode'

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
    data = await encodePNG(input.data)
  }
  catch (error) {
    console.error(`error occurred while encoding ${input.name}, falling back on canvas encode`)
    data = await alternateEncodePNG(input.data)
  }

  // Send the result back to the main thread
  globalThis.postMessage({ data: { name: input.name, data } })
}
