import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/summarizer/extract-audio-url/`
    const token = process.env.SECRET_BACKEND_API_TOKEN

    // Call backend
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`, // Knox token passed here
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: error || 'Failed to fetch audio from backend.' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
