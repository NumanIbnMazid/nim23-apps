import React, { useState, useRef, useEffect } from 'react'
import { FiCopy } from 'react-icons/fi'

interface WhisperTranscriptionProps {
  whisperTranscription: string | null
  finalTextToSummarize?: string | ''
}

const WhisperTranscription: React.FC<WhisperTranscriptionProps> = ({ whisperTranscription, finalTextToSummarize }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (whisperTranscription) {
      navigator.clipboard.writeText(whisperTranscription).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
      })
    }
  }

  // Auto-scroll to bottom when whisperTranscription updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [whisperTranscription])

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          Full Transcription
          {finalTextToSummarize === '' && (
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200"
        >
          <FiCopy className="text-base" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div ref={scrollRef} className="max-h-72 overflow-y-auto space-y-2 font-sans text-sm pr-2">
        <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-100 py-4 px-2 border border-gray-200 dark:border-gray-700 rounded">
          {whisperTranscription || 'No transcription available.'}
        </div>
      </div>
    </div>
  )
}

export default WhisperTranscription
