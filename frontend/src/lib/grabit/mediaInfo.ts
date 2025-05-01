import { create as createYoutubeDl } from 'youtube-dl-exec'

export type Format = {
  format_id: string
  ext: string
  format_note?: string
  quality?: string
  tbr?: number
  bitrate?: number
  has_audio?: boolean
  is_dash?: boolean
  filesize?: number
  filesize_approx?: number
  resolution?: string
  audio_channels?: number
  is_dash_periods?: boolean
  url: string
  video_ext?: string
  audio_ext?: string
  vcodec?: string
  acodec?: string
  format: string
  original_data?: any
}

export type MediaInfo = {
  title?: string
  description?: string
  author?: string
  upload_date?: string
  duration?: number
  resolution?: string
  thumbnail?: string
  categories?: string[]
  channel?: string
  tags?: string[]
  view_count?: number
  average_rating?: number
  source?: string
  formats_filtered: {
    best_video?: Format | null
    best_audio?: Format | null
    videos_with_audio: Format[]
    video_formats: Format[]
    audio_formats: Format[]
  }
}

function getFormatInfo(stream: any, formatType: string, detailed = false): Format | null {
  if (!stream) return null

  const data: Format = {
    format: formatType,
    format_id: stream.format_id,
    ext: stream.ext,
    quality: stream.format_note,
    bitrate: stream.tbr,
    filesize: stream.filesize || stream.filesize_approx,
    resolution: stream.resolution,
    has_audio: !!stream.audio_channels,
    is_dash: stream.is_dash_periods,
    url: stream.url,
  }

  if (detailed) {
    data.original_data = stream
  }

  return data
}

const ytDlpPath = process.env.NEXT_PUBLIC_YT_DLP_PATH || '/usr/local/bin/yt-dlp'
const youtubedl = createYoutubeDl(ytDlpPath)

export async function fetchMediaInfoYtDlp(mediaUrl: string, detailed = false): Promise<MediaInfo> {
  const info: any = await youtubedl(mediaUrl, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
  })

  const formats = (info.formats || []).reverse()

  const bestVideo = formats.find((f: any) => f.vcodec !== 'none' && f.acodec === 'none' && f.ext === 'mp4')
  const bestAudio = formats.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none')

  return {
    title: info.title,
    description: info.description,
    author: info.uploader,
    upload_date: info.upload_date,
    duration: info.duration || 0,
    resolution: info.resolution,
    thumbnail: info.thumbnail,
    categories: info.categories || [],
    channel: info.channel,
    tags: info.tags || [],
    view_count: info.view_count || 0,
    average_rating: info.average_rating || 0,
    source: info.extractor_key || 'Unknown',
    formats_filtered: {
      best_video: getFormatInfo(bestVideo, 'video', detailed),
      best_audio: getFormatInfo(bestAudio, 'audio', detailed),
      videos_with_audio: formats
        .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none')
        .map((f: any) => getFormatInfo(f, 'video', detailed)!),
      video_formats: formats
        .filter(
          (f: any) => f.video_ext !== 'none' && f.vcodec !== 'none' && f.format_note && !f.format_id.includes('sb')
        )
        .map((f: any) => getFormatInfo(f, 'video', detailed)!),
      audio_formats: formats
        .filter(
          (f: any) =>
            f.audio_ext !== 'none' &&
            f.acodec !== 'none' &&
            f.format_note &&
            f.audio_channels &&
            !f.format_id.includes('sb')
        )
        .map((f: any) => getFormatInfo(f, 'audio', detailed)!),
    },
  }
}
