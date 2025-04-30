import { NextResponse } from 'next/server'

export async function GET() {
  const apiURL = `${process.env.SECRET_BACKEND_API_BASE_URL}/recommendr/preferences/`
  const token = process.env.SECRET_BACKEND_API_TOKEN

  try {
    const res = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to fetch preferences. Please try again later.',
        },
        { status: res.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: data.data,
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
