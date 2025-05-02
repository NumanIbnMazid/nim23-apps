import React from 'react'

interface URLInputProps {
  url: string
  setUrl: (url: string) => void
  setIsValidUrl: (isValid: boolean) => void
  setUrlError: (error: string) => void
  urlError: string
}

const URLInput: React.FC<URLInputProps> = ({ url, setUrl, setIsValidUrl, setUrlError, urlError }) => {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)

    // URL validation regex pattern
    const urlPattern =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(:\d+)?(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;%=]*)?$/i

    // If the URL is invalid, set the error message, else clear it and set validity
    if (!urlPattern.test(newUrl) && newUrl.trim() !== '') {
      setUrlError('Please enter a valid URL.')
      setIsValidUrl(false) // Set invalid
    } else {
      setUrlError('')
      setIsValidUrl(true) // Set valid
    }
  }

  return (
    <div className="mb-4">
      <label htmlFor="mediaUrl" className="block font-medium mb-1">
        Media URL (YouTube, Podcast, etc.)
      </label>
      <input
        id="mediaUrl"
        type="url"
        value={url}
        onChange={handleUrlChange}
        placeholder="https://example.com/media"
        className="w-full border border-gray-300 p-2 rounded-md dark:bg-darkSecondary dark:text-white"
      />
      {urlError && <p className="text-red-500 mt-2 text-sm">{urlError}</p>}
    </div>
  )
}

export default URLInput
