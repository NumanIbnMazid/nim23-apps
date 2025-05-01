import { PUBLIC_SITE_URL } from '@/lib/constants'

export const fetchMediaDetails = async (url: string, setStatusMessage: any) => {
  // Replace YouTube domain with yewtu.be if matched
  const transformedUrl = url.replace(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)/, 'https://id.420129.xyz')

  const apiUrl = `${PUBLIC_SITE_URL}/api/grabit/media-details`
  const response = await fetch(`${apiUrl}?media_url=${encodeURIComponent(transformedUrl)}`)

  if (!response.ok) {
    let errorMsg = `Failed to fetch media details (HTTP ${response.status})`
    try {
      const errorData = await response.json()
      errorMsg = errorData.message || errorMsg
    } catch (e) {
      errorMsg = `Failed to fetch media details! (${response.statusText})`
    }
    throw new Error(errorMsg)
  }

  const result = await response.json()
  setStatusMessage('Please choose your desired media format to download')
  return result.success ? result.data.media_info : null
}
