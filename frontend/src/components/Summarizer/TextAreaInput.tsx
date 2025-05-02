import React, { useState, useEffect } from 'react'
import { FaPaste, FaTrash } from 'react-icons/fa'

interface TextAreaInputProps {
  text: string
  setText: (text: string) => void
  maxWords: number
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ text, setText, maxWords }) => {
  const [wordCount, setWordCount] = useState(0)
  const [showLimitNotice, setShowLimitNotice] = useState(false)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }, [text])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value
    const words = newText.trim().split(/\s+/).filter(Boolean)

    if (words.length > maxWords) {
      let wordCounter = 0
      let cutoffIndex = newText.length
      let insideWord = false

      for (let i = 0; i < newText.length; i++) {
        const char = newText[i]
        if (/\S/.test(char)) {
          if (!insideWord) {
            wordCounter++
            insideWord = true
          }
        } else {
          insideWord = false
        }

        if (wordCounter > maxWords) {
          cutoffIndex = i
          break
        }
      }

      const truncated = newText.slice(0, cutoffIndex).trimEnd()
      setText(truncated)
      setShowLimitNotice(true)
    } else {
      setText(newText)
      setShowLimitNotice(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>)
    } catch (error) {
      console.error('Failed to paste from clipboard:', error)
    }
  }

  const handleClearText = () => {
    setText('')
    setShowLimitNotice(false)
  }

  return (
    <div className="mt-4 relative">
      <textarea
        value={text}
        onChange={handleChange}
        rows={10}
        className="w-full p-4 pr-20 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text here..."
      />

      {/* Paste button (only when empty) */}
      {text.trim() === '' && (
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="absolute left-3 top-12 px-3 py-1.5 mt-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
        >
          <FaPaste size={14} />
          Paste
        </button>
      )}

      {/* Delete button (only when not empty) */}
      {text.trim() !== '' && (
        <button
          type="button"
          onClick={handleClearText}
          className="absolute right-3 top-3 p-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          <FaTrash size={16} />
        </button>
      )}

      {showLimitNotice && (
        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          Your text exceeded the word limit of {maxWords}. It has been truncated.
        </p>
      )}

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Word count: {wordCount}/{maxWords}
      </p>
    </div>
  )
}

export default TextAreaInput
