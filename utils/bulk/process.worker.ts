import pLimit from 'p-limit'
import { initialize as initXBRZ } from '~/utils/image/xbrz'
import { processAuto } from '~/utils/image/process'

globalThis.onmessage = async (event) => {
  const { array, args } = event.data
  const scaleFactor = args[0]

  // init needed wasm modules
  await initXBRZ()

  // process every Image in array
  const limit = pLimit(8)
  const arrayResults = await Promise.all(
    array.map(async (img: Image) => await limit(async () => {
      const imageData = await processAuto(img, scaleFactor)
      globalThis.postMessage({ type: 'update' })
      return { name: img.name, data: imageData }
    })),
  )

  // Send the results back to the main thread
  globalThis.postMessage({ type: 'done', data: arrayResults })
}
