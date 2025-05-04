import { PUBLIC_SITE_URL } from '@/lib/constants'

export const fetchFileInChunks = async (
  url: string,
  chunkSize: number = 1024 * 1024 * 2, // 2MB per chunk,
  onProgress?: (percent: number, downloaded: number, total: number) => void
): Promise<Uint8Array> => {
  const decodedUrl = decodeURIComponent(url)
  const isAlreadyProxied = decodedUrl.includes('/api/grabit/proxy')

  const targetUrl = isAlreadyProxied ? url : `${PUBLIC_SITE_URL}/api/grabit/proxy?url=${encodeURIComponent(url)}`

  const headRes = await fetch(targetUrl, { method: 'HEAD' })
  const contentLength = parseInt(headRes.headers.get('Content-Length') || '0', 10)
  const chunks: Uint8Array[] = []

  let received = 0
  let start = 0
  let end = 0

  // if (!contentLength || isNaN(contentLength)) {
  //   throw new Error('Invalid Content-Length header from proxy.')
  // }

  while (start < contentLength) {
    end = Math.min(start + chunkSize - 1, contentLength - 1)

    const chunkRes = await fetch(targetUrl, {
      headers: { Range: `bytes=${start}-${end}` },
    })

    const arrayBuffer = await chunkRes.arrayBuffer()
    chunks.push(new Uint8Array(arrayBuffer))

    received += arrayBuffer.byteLength
    onProgress?.(received / contentLength, received, contentLength)

    start = end + 1
  }

  const result = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}
