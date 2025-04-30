export async function getPreferences() {
  const apiURL = `${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}/recommendr/preferences/`
  const token = process.env.NEXT_PUBLIC_BACKEND_API_TOKEN
  const res = await fetch(apiURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    },
  })

  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch preferences!')
  }

  return data.data
}
