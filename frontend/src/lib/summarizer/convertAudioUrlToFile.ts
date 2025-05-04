import { fetchFileInChunks } from '@/lib/grabit/download/fetchFileInChunks'
import { formatBytes } from '@/lib/utils/helpers'

export const convertAudioUrlToFile = async (
  audioURL: string,
  ffmpegInstance: any,
  setStatusMessage: any = () => {}
): Promise<Uint8Array> => {
  const chunkSize = 1024 * 1024 * 2 // 2MB per chunk
  let totalProgress = 0
  let downloadedData = 0
  let totalData = 0

  const updateOverallProgress = () => {
    // *** Progress ***
    // Progress from 0% to 100%
    const progressValue = Math.floor(0 + totalProgress * 100)
    // *** Size ***
    const totalSize = totalData
    const downloadedSize = downloadedData
    const totalSizeFormatted = formatBytes(totalSize)
    const downloadedSizeFormatted = formatBytes(downloadedSize)
    setStatusMessage(
      `Content Downloaded: ${downloadedSizeFormatted} / ${totalSizeFormatted}. (Progress: ${progressValue}%)`
    )
  }

  // Use chunked proxy fetch method
  const audioData = await fetchFileInChunks(audioURL, chunkSize, (p: number, downloaded: number, total: number) => {
    totalProgress = p
    downloadedData = downloaded
    totalData = total
    updateOverallProgress()
  })

  const inputName = 'input_audio'
  const outputName = 'output.wav'

  await ffmpegInstance.writeFile(inputName, audioData)

  await ffmpegInstance.exec([
    '-i',
    inputName,
    '-vn',
    '-acodec',
    'pcm_s16le',
    '-ar',
    '16000',
    '-ac',
    '1',
    '-f',
    'wav',
    outputName,
  ])

  const outputData = await ffmpegInstance.readFile(outputName)
  return outputData as Uint8Array
}
