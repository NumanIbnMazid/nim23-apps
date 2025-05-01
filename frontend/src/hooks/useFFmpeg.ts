import { useEffect, useState } from 'react'
import FFmpegManager from '@/lib/grabit/ffmpeg/FFmpegManager'

export const useFFmpeg = (setStatusMessage: (msg: string) => void) => {
  const [ffmpegReady, setFfmpegReady] = useState(false)

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await FFmpegManager.load(setStatusMessage)
        setFfmpegReady(true)
      } catch (err) {
        console.error('FFmpeg load failed:', err)
        setStatusMessage('Failed to load FFmpeg.')
      }
    }

    loadFFmpeg()
  }, [setStatusMessage])

  return {
    ffmpeg: FFmpegManager.getInstance(),
    ready: ffmpegReady,
  }
}
