import React, { useState } from 'react'
import Modal from 'react-modal'
import { FiCopy } from 'react-icons/fi'

interface WhisperTranscriptionModalProps {
  isOpen: boolean
  onRequestClose: () => void
  whisperTranscription: string
}

const WhisperTranscriptionModal: React.FC<WhisperTranscriptionModalProps> = ({
  isOpen,
  onRequestClose,
  whisperTranscription,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (whisperTranscription) {
      navigator.clipboard.writeText(whisperTranscription).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Whisper Transcription"
      className="max-w-3xl mx-auto mt-24 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Full Transcription</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200"
        >
          <FiCopy className="text-base" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-100 max-h-[60vh] overflow-y-auto py-4 px-2 border border-gray-200 dark:border-gray-700 rounded">
        {whisperTranscription || 'No transcription available.'}
      </div>

      <div className="mt-6 text-right">
        <button onClick={onRequestClose} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Close
        </button>
      </div>
    </Modal>
  )
}

export default WhisperTranscriptionModal
