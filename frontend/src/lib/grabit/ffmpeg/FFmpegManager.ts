import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

class FFmpegManager {
  private static instance: FFmpeg
  private static loadingPromise: Promise<void> | null = null

  static getInstance(): FFmpeg {
    if (!FFmpegManager.instance) {
      FFmpegManager.instance = new FFmpeg()
    }
    return FFmpegManager.instance
  }

  static async load(setStatusMessage?: (msg: string) => void): Promise<void> {
    if (FFmpegManager.loadingPromise) return FFmpegManager.loadingPromise
    const ffmpeg = FFmpegManager.getInstance()

    ffmpeg.on('progress', ({ progress }) => {
      setStatusMessage?.(`Please wait. Processing... ${Math.round(progress * 100)}%`)
    })

    FFmpegManager.loadingPromise = ffmpeg.load({
      coreURL: await toBlobURL('/scripts/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/scripts/ffmpeg-core.wasm', 'application/wasm'),
      workerURL: await toBlobURL('/scripts/ffmpeg-core.worker.js', 'text/javascript'),
    }).then(() => {})

    return FFmpegManager.loadingPromise
  }}

export default FFmpegManager
