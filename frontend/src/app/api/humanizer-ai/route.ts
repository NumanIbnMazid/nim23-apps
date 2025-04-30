import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const token = process.env.SECRET_BACKEND_API_TOKEN
  const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/humanizer-ai/humanize/`

  try {
    const { input_text } = await req.json()

    if (!input_text) {
      return NextResponse.json({ success: false, message: 'Missing input_text' }, { status: 400 })
    }

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ input_text }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to humanize text! Please try again.',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      humanized_text: data.data.humanized_text,
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Unexpected error',
      },
      { status: 500 }
    )
  }
}
