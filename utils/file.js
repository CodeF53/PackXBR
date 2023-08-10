export const isPNG = file => file.name.toLowerCase().endsWith('.png')
export const isZIP = file => file.name.toLowerCase().endsWith('.zip')

export async function saveBlob(blob, fileName) {
  // create a URL for the blob
  const url = URL.createObjectURL(blob)
  // create a link to download the blob, and click it
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  // Clean up by revoking the URL object
  URL.revokeObjectURL(url)
}
