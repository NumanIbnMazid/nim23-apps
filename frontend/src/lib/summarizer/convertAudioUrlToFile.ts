import { fetchFileInChunks } from '@/lib/grabit/download/fetchFileInChunks'

export const convertAudioUrlToFile = async (audioURL: string, ffmpegInstance: any): Promise<Uint8Array> => {
  // Use chunked proxy fetch method
  const audioData = await fetchFileInChunks(audioURL)

  const inputName = 'input_audio'
  const outputName = 'output.wav'

  await ffmpegInstance.writeFile(inputName, audioData)

  await ffmpegInstance.exec(['-i', inputName, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', outputName])

  const outputData = await ffmpegInstance.readFile(outputName)
  return outputData as Uint8Array
}
