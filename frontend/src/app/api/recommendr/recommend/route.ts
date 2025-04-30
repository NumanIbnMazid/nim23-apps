import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const token = process.env.SECRET_BACKEND_API_TOKEN
  const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/recommendr/recommend/`

  try {
    const preferences = await req.json()

    if (!preferences?.client_id) {
      return NextResponse.json({ success: false, message: 'Client ID is required' }, { status: 400 })
    }

    const res = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(preferences),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to fetch recommendations. Please try again later.',
        },
        { status: res.status }
      )
    }

    return NextResponse.json({
      success: true,
      recommendations: data?.data?.recommendations || [],
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
