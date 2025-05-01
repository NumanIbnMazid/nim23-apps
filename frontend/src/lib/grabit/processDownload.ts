import { downloadMedia } from '@/lib/grabit/download/downloadMedia'
import { PUBLIC_SITE_URL } from '@/lib/constants'

export const processDownload = async (
  videoTitle: string,
  mediaTypeRef: React.RefObject<HTMLSelectElement>,
  mediaFormatRef: React.RefObject<HTMLSelectElement>,
  selectedFormatRef: React.RefObject<HTMLSelectElement>,
  bestAudioObject: any,
  downloadPathRef: React.RefObject<HTMLInputElement>,
  ffmpeg: any,
  setDownloadProgress: (n: number) => void,
  setStatusMessage: (s: string) => void
): Promise<boolean> => {
  try {
    setStatusMessage('Fetching media info...')
    setDownloadProgress(0)

    const selectedMediaObject = JSON.parse(selectedFormatRef.current?.value || '{}')
    const mediaType = mediaTypeRef?.current?.value || 'video'
    const selectedMediaFormat = mediaFormatRef?.current?.value || 'mp4'

    const query = new URLSearchParams({
      video_title: videoTitle,
      media_type: mediaType,
      media_format: selectedMediaFormat,
      selected_media_object: JSON.stringify(selectedMediaObject),
      best_audio_object: JSON.stringify(bestAudioObject),
      download_path: downloadPathRef.current?.value || '~/Downloads',
    })

    const res = await fetch(`${PUBLIC_SITE_URL}/api/grabit/media-download?${query}`)
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Server error: ${res.status}. ${errText}`)
    }

    const {
      data: { video_title, video_url, audio_url, audio_ext, video_ext },
    } = await res.json()

    return await downloadMedia(
      video_url,
      audio_url,
      video_title || videoTitle,
      selectedMediaFormat,
      mediaType,
      audio_ext,
      video_ext,
      ffmpeg,
      setDownloadProgress,
      setStatusMessage
    )
  } catch (err) {
    console.error('Download failed:', err)
    setStatusMessage(`Failed to download media. (${err})`)
    return false
  }
}
