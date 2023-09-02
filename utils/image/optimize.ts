import { encode as encodePNG } from '@jsquash/png'
import optimize from '@jsquash/oxipng/optimise'

export default async function optimizeImage(image: Image) {
  const encoded = await encodePNG(image.data)
  const optimized = await optimize(encoded, { optimiseAlpha: true })
  const outData = optimized.byteLength < encoded.byteLength ? optimized : encoded
  return { name: image.name, data: outData }
}
