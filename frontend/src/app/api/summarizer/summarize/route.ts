import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    // Ensure text is provided
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/summarizer/summarize/`
    const token = process.env.SECRET_BACKEND_API_TOKEN

    // Prepare the body of the request based on provided data
    const requestBody = {
      text: text,
    }

    // Call the backend API
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    // Check if the response from the backend is successful
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: error || 'Failed to summarize input from server.' }, { status: 500 })
    }

    // Parse the response data
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
