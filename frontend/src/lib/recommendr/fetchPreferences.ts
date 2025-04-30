import { PUBLIC_SITE_URL } from '@/lib/constants'

export async function getPreferences() {
  const res = await fetch(`${PUBLIC_SITE_URL}/api/recommendr`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch preferences!')
  }

  return data.data
}
