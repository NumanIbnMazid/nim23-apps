import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const videoTitle = url.searchParams.get('video_title')
  const mediaType = url.searchParams.get('media_type')
  const mediaFormat = url.searchParams.get('media_format')
  const selectedMediaobject = url.searchParams.get('selected_media_object')
  const bestAudioObject = url.searchParams.get('best_audio_object')
  const downloadPath = url.searchParams.get('download_path')

  if (!videoTitle || !mediaType || !bestAudioObject || !selectedMediaobject) {
    return NextResponse.json({ success: false, error: 'Missing required parameters' })
  }

  try {
    // Parse the raw data for the selected format
    const parsedSelectedObject = JSON.parse(selectedMediaobject)
    const parsedBestAudioObject = JSON.parse(bestAudioObject)

    // Call your backend logic to download the media
    const mediaDownloadData = await downloadMediaInfo(
      videoTitle,
      mediaType,
      mediaFormat || null,
      parsedSelectedObject,
      parsedBestAudioObject,
      downloadPath || ''
    )

    if (mediaDownloadData) {
      return mediaDownloadData
    } else {
      return NextResponse.json({ success: false, error: 'Failed process media download!' })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process media download: ' + (error instanceof Error ? error.message : 'Unknown error'),
    })
  }
}

async function downloadMediaInfo(
  videoTitle: string,
  mediaType: string,
  mediaFormat: string | null,
  selectedMediaobject: any,
  bestAudioObject: any,
  downloadPath: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL
  const token = process.env.SECRET_BACKEND_API_TOKEN

  const params = new URLSearchParams({
    video_title: videoTitle,
    media_type: mediaType,
    media_format: JSON.stringify(mediaFormat),
    selected_media_object: JSON.stringify(selectedMediaobject),
    best_audio_object: JSON.stringify(bestAudioObject),
    download_path: downloadPath,
  })

  const downloadApiUrl = `${baseUrl}/grabit-download/process-media-download?${params.toString()}`

  const response = await fetch(downloadApiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`, // Knox token added
    },
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Download failed: ${errText}`)
  }

  return response
}
