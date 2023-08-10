type ImageMatrix = Array<Array<Uint8ClampedArray>>

type TileOption = 'void' | 'wrap' | 'extend' | 'mirror'
type TileDirection = 'n' | 's' | 'e' | 'w'

interface TileSettings {
  n: TileOption
  s: TileOption
  e: TileOption
  w: TileOption
}

interface ProcessSettings {
  tile: TileSettings
  cullTranslucent: boolean
  relayer: boolean
  skip: boolean
}

interface Image {
  name: string
  data: ImageData
}

interface DumbFile {
  name: string
  data: ArrayBuffer
}
