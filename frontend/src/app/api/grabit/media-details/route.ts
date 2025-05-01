import { NextResponse } from 'next/server'
import { fetchMediaInfoYtDlp } from '@/lib/grabit/mediaInfo'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mediaUrl = url.searchParams.get('media_url')

  if (!mediaUrl) {
    return NextResponse.json({ success: false, error: 'Missing media_url parameter' }, { status: 400 })
  }

  try {
    const mediaInfo = await fetchMediaInfoYtDlp(mediaUrl)

    return NextResponse.json({
      success: true,
      data: { media_info: mediaInfo },
    })
  } catch (error) {
    console.error('Error fetching media info:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching media details: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}

// async function fetchMediaInfo(mediaUrl: string) {
//   const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL
//   const token = process.env.SECRET_BACKEND_API_TOKEN

//   const apiUrl = `${baseUrl}/grabit-fetch-media-info/details/`
//   const query = `?media_url=${encodeURIComponent(mediaUrl)}`

//   const response = await fetch(apiUrl + query, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Token ${token}`, // Knox token passed here
//     },
//   })
//   const result = await response
//   return result
// }
