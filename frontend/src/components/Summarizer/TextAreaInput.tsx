import React, { useState, useEffect } from 'react'

interface TextAreaInputProps {
  text: string
  setText: (text: string) => void
  maxWords: number
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ text, setText, maxWords }) => {
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }, [text])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value
    const words = newText.trim().split(/\s+/).filter(Boolean)
    if (words.length <= maxWords) {
      setText(newText)
    }
  }

  return (
    <div className="mt-4">
      <textarea
        value={text}
        onChange={handleChange}
        rows={10}
        className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
        placeholder="Enter text here..."
      />
      <p className="text-sm text-gray-500">
        Word count: {wordCount}/{maxWords}
      </p>
    </div>
  )
}

export default TextAreaInput
