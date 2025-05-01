import { mergeMedia } from './mergeMedia'
import { saveFile } from './saveFile'
import { fetchFileInChunks } from './fetchFileInChunks'
import { formatBytes } from '@/lib/utils/helpers'

export const downloadMedia = async (
  videoUrl: string,
  audioUrl: string,
  title: string,
  outputFormat: string,
  mediaType: string,
  audioExt: string,
  videoExt: string,
  ffmpeg: any,
  setProgress: (n: number) => void,
  setStatus: (s: string) => void
) => {
  try {
    setStatus('Fetching media files...')

    const chunkSize = 1024 * 1024 * 2 // 2MB per chunk

    setProgress(0) // Update progress

    setStatus('Fetching video and audio.....')
    setStatus('Please hold on. This may take a while. Rest of the process will be very quick.')

    // ======= Heavy Part ========
    // const [videoData, audioData] = await Promise.all([fetchFile(videoProxyUrl), fetchFile(audioProxyUrl)])

    let videoProgress = 0
    let audioProgress = 0
    let videoDownloaded = 0
    let audioDownloaded = 0
    let videoTotal = 0
    let audioTotal = 0

    const updateOverallProgress = () => {
      // *** Progress ***
      const totalProgress = (videoProgress + audioProgress) / 2
      // Progress from 0% to 95%
      const progressValue = Math.floor(0 + totalProgress * 95)
      setProgress(progressValue)
      // *** Size ***
      const totalSize = videoTotal + audioTotal
      const downloadedSize = videoDownloaded + audioDownloaded
      const totalSizeFormatted = formatBytes(totalSize)
      const downloadedSizeFormatted = formatBytes(downloadedSize)
      setStatus(`Content Downloaded: ${downloadedSizeFormatted} / ${totalSizeFormatted}`)
    }

    // Dynamically create the promises array based on the mediaType
    const fetchPromises = []
    fetchPromises.push(
      fetchFileInChunks(audioUrl, chunkSize, (p: number, downloaded: number, total: number) => {
        audioProgress = p
        audioDownloaded = downloaded
        audioTotal = total
        updateOverallProgress()
      })
    )
    if (mediaType === 'video') {
      fetchPromises.push(
        fetchFileInChunks(videoUrl, chunkSize, (p: number, downloaded: number, total: number) => {
          videoProgress = p
          videoDownloaded = downloaded
          videoTotal = total
          updateOverallProgress()
        })
      )
    }
    // Await the fetch promises and assign them to variables
    const [audioData, videoData] = await Promise.all(fetchPromises)

    setProgress(96)

    const merged = await mergeMedia({
      videoData,
      audioData,
      mediaType,
      audioExt,
      videoExt,
      title,
      outputFormat,
      ffmpeg,
      setStatus,
      setProgress,
    })

    saveFile(merged.buffer, merged.filename)
    setProgress(100)
    setStatus('Download complete!')
    return true
  } catch (err) {
    console.error('Media download failed:', err)
    setStatus('Failed to process media.')
    return false
  }
}
