import React, { useState, useEffect, useRef } from 'react'
import ReactModal from 'react-modal'
import WhisperTranscriptionModal from './WhisperTranscriptionModal'

interface TranscriptionTimelineProps {
  rawTranscription: string | null
  whisperTranscription: string
}

const TranscriptionTimeline: React.FC<TranscriptionTimelineProps> = ({ rawTranscription, whisperTranscription }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      ReactModal.setAppElement('#__app_root')
    }
  }, [])

  // Auto-scroll to bottom when rawTranscription updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [rawTranscription])

  if (!rawTranscription) return null

  return (
    <div className="mt-4 p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">Transcription Timeline</h2>
        {whisperTranscription && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View Full Transcription
          </button>
        )}
      </div>

      <div ref={scrollRef} className="max-h-72 overflow-y-auto space-y-2 font-sans text-sm pr-2">
        {rawTranscription.split('\n').map((line, idx) => {
          const match = line.match(/^(\d+\.\d+s\s->\s\d+\.\d+s:)\s?(.*)$/)
          if (match) {
            const [, timestamp, text] = match
            return (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-[auto_1fr] sm:gap-x-4 items-start">
                <span className="text-cyan-700 dark:text-cyan-300 font-mono">{timestamp}</span>
                <span className="text-gray-800 dark:text-slate-100">{text}</span>
              </div>
            )
          }

          return (
            <div key={idx} className="text-gray-800 dark:text-slate-100">
              {line}
            </div>
          )
        })}
      </div>

      <WhisperTranscriptionModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        whisperTranscription={whisperTranscription}
      />
    </div>
  )
}

export default TranscriptionTimeline
