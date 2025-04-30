import { PUBLIC_SITE_URL } from '@/lib/constants'

export async function fetchHumanizedText(inputText: string): Promise<string> {
  const res = await fetch(`${PUBLIC_SITE_URL}/api/humanizer-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input_text: inputText }),
  })

  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to humanize text.')
  }

  return data.humanized_text
}
