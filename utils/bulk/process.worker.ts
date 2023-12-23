import { initialize as initXBRZ } from '~/utils/image/xbrz'
import { processAuto } from '~/utils/image/process'
import { workerError } from '~/utils/misc'

// on creation, init needed shit
initXBRZ().then(() => {
  // when everything is ready, tell main thread we are initialized
  globalThis.postMessage({})
}).catch(console.error)

globalThis.onmessage = async (event) => {
  const { input, args } = event.data
  const scaleFactor = args[0]

  // process img
  let imageData
  try {
    imageData = await processAuto(input, scaleFactor)
  }
  catch (error) {
    workerError(error, `While processing "${input.name}"`, ' - skipping image')
    imageData = input.data
  }

  // Send the result back to the main thread
  globalThis.postMessage({ data: { name: input.name, data: imageData } })
}
