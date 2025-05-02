import React from 'react'

interface URLInputProps {
  url: string
  setUrl: (url: string) => void
}

const URLInput: React.FC<URLInputProps> = ({ url, setUrl }) => {
  return (
    <div className="mb-4">
      <label htmlFor="mediaUrl" className="block font-medium mb-1">
        Media URL (YouTube, Podcast, etc.)
      </label>
      <input
        id="mediaUrl"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/media"
        className="w-full border border-gray-300 p-2 rounded-md dark:bg-darkSecondary dark:text-white"
      />
    </div>
  )
}

export default URLInput
