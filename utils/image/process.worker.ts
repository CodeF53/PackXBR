// for use in manual mode
import { initialize as initXBRZ } from '~/utils/image/xbrz'

import { process } from '~/utils/image/process'

globalThis.onmessage = async (event) => {
  if (event.data.init) {
    await initXBRZ()
  }
  else {
    const [imageData, scaleFactor, settings] = event.data
    const procData = await process(imageData, scaleFactor, settings)

    // Send the results back to the main thread
    globalThis.postMessage(procData)
  }
}
