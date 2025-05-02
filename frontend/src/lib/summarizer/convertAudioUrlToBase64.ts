import { fetchFileInChunks } from '@/lib/grabit/download/fetchFileInChunks'
import { PUBLIC_SITE_URL } from '@/lib/constants'

export const convertAudioUrlToBase64 = async (audioURL: string, ffmpegInstance: any): Promise<string> => {
  const proxiedURL = `${PUBLIC_SITE_URL}/api/grabit/proxy?url=${encodeURIComponent(audioURL)}`

  // Use your chunked proxy fetch method
  const audioData = await fetchFileInChunks(proxiedURL)

  const inputName = 'input_audio'
  const outputName = 'output.wav'

  await ffmpegInstance.writeFile(inputName, audioData)

  await ffmpegInstance.exec(['-i', inputName, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', outputName])

  const outputData = (await ffmpegInstance.readFile(outputName)) as Uint8Array

  const base64Audio = btoa(outputData.reduce((data, byte) => data + String.fromCharCode(byte), ''))

  return base64Audio
}
