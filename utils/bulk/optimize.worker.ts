import { init as initEncode } from '@jsquash/png/encode'
import { init as initOxiPNG } from '@jsquash/oxipng/optimise'
import pLimit from 'p-limit'
import optimizeImage from '~/utils/image/optimize'

globalThis.onmessage = async (event) => {
  const { array } = event.data

  // init needed wasm modules
  await Promise.all([initOxiPNG(), initEncode()])

  // optimize every Image in array
  const limit = pLimit(8)
  const arrayResults = await Promise.all(
    array.map(async (img: Image) => await limit(async () => {
      const out = await optimizeImage(img)
      globalThis.postMessage({ type: 'update' })
      return out
    })),
  )

  // Send the results back to the main thread
  globalThis.postMessage({ type: 'done', data: arrayResults })
}
