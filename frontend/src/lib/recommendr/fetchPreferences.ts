import { PUBLIC_SITE_URL } from '@/lib/constants'

export async function getPreferences() {
  try {
    const res = await fetch(`${PUBLIC_SITE_URL}/api/recommendr`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let data = null

    try {
      data = await res.json()
    } catch (jsonErr) {
      throw new Error('Failed to parse response as JSON.')
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Backend returned an error while fetching preferences.')
    }

    return data.data
  } catch (err) {
    console.error('getPreferences error:', err)
    return {} // Gracefully fallback with empty preferences object
  }
}
