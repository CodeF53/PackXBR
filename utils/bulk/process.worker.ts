import { initialize as initXBRZ } from '~/utils/image/xbrz'
import { processAuto } from '~/utils/image/process'

globalThis.onmessage = async (event) => {
  const { array, args } = event.data
  const scaleFactor = args[0]

  // init needed wasm modules
  await initXBRZ()

  // process every Image in array
  // TODO: re-introduce Promise.all & p-limit
  // removed because it made data go into the wrong images
  // scaling `acacia_chest_boat.png` to `bamboo.png` on a single thread lead to everything being bamboo
  const arrayResults = Array(array.length)
  for (let i = 0; i < array.length; i++) {
    const img = array[i]
    const imageData = await processAuto(img, scaleFactor)
    arrayResults[i] = { name: img.name, data: imageData }
    globalThis.postMessage({ type: 'update' })
  }

  // Send the results back to the main thread
  globalThis.postMessage({ type: 'done', data: arrayResults })
}
