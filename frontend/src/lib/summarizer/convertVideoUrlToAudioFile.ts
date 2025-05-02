import { fetchFileInChunks } from '@/lib/grabit/download/fetchFileInChunks'

/**
 * Converts a video URL to raw audio using FFmpeg.wasm.
 * Returns the audio file (Uint8Array).
 */
export const convertVideoUrlToAudio = async (videoUrl: string, ffmpegInstance: any): Promise<Uint8Array> => {
  const videoData = await fetchFileInChunks(videoUrl)

  const inputName = 'input.mp4'
  const outputName = 'output.wav'

  await ffmpegInstance.writeFile(inputName, videoData)

  await ffmpegInstance.exec(['-i', inputName, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', outputName])

  const audioData = await ffmpegInstance.readFile(outputName)
  return audioData as Uint8Array
}
