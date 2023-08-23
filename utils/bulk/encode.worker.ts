import { encode as encodePNG } from '@jsquash/png'
import { init as initEncode } from '@jsquash/png/encode'
import pLimit from 'p-limit'

globalThis.onmessage = async (event) => {
  const { array } = event.data

  // init needed wasm modules
  await initEncode()

  // optimize every Image in array
  const limit = pLimit(8)
  const arrayResults = await Promise.all(
    array.map(async (img: Image) => await limit(async () => {
      const out = { name: img.name, data: await encodePNG(img.data) }
      globalThis.postMessage({ type: 'update' })
      return out
    })),
  )

  // Send the results back to the main thread
  globalThis.postMessage({ type: 'done', data: arrayResults })
}
