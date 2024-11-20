import { endsWithAny, includesAny } from '../misc'
import { containsTranslucent, crop, cullTranslucent, relayer } from './miscProcess'
import { tile } from './tile'
import { xbrz } from './xbrz'

function getSettings(fileName: string): ProcessSettings {
  const settings: ProcessSettings = {
    tile: { n: 'void', s: 'void', e: 'void', w: 'void' },
    cullTranslucent: true,
    relayer: false,
    skip: false,
  }

  const path = fileName.toLowerCase()
  if (path.includes('/block/'))
    settings.tile = { n: 'wrap', s: 'wrap', e: 'wrap', w: 'wrap' }
  else if (path.includes('/painting/'))
    settings.tile = { n: 'wrap', s: 'wrap', e: 'wrap', w: 'wrap' }
  else if (includesAny(path, '/model/', '/entity/'))
    settings.relayer = true
  else if (includesAny(path, '/font/', '/colormap/') || endsWithAny(path, 'pack.png', 'title/minecraft.png'))
    settings.skip = true

  return settings
}

export function processAuto(image: Image, scaleFactor: number, settings?: ProcessSettings) {
  if (settings === undefined)
    settings = getSettings(image.name)

  return process(image.data, scaleFactor, settings)
}

export async function process(imageData: ImageData, scaleFactor: number, settings: ProcessSettings) {
  if (settings.skip)
    return imageData

  if (imageData.width > 2048 || imageData.height > 2048)
    throw new Error('image too big')

  const shouldCull: boolean = settings.cullTranslucent ? !containsTranslucent(imageData) : false
  const tileDistance: number = Math.min(scaleFactor, imageData.width, imageData.height)

  let processImageData: ImageData = tile(imageData, settings.tile, tileDistance)

  processImageData = await xbrz(processImageData, scaleFactor)

  processImageData = crop(processImageData, tileDistance * scaleFactor)

  if (shouldCull)
    cullTranslucent(processImageData)

  if (settings.relayer)
    relayer(processImageData, imageData, scaleFactor)

  return processImageData
}
