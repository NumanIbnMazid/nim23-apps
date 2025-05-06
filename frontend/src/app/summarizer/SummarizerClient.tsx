'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'
import Loader from '@/components/Loader'
import AppIntro from '@/components/Summarizer/AppIntro'
import HowToUse from '@/components/Summarizer/HowToUse'
import URLInput from '@/components/Summarizer/URLInput'
import FileUploadInput from '@/components/Summarizer/FileUploadInput'
import TextAreaInput from '@/components/Summarizer/TextAreaInput'
import SummarizeButton from '@/components/Summarizer/SummarizeButton'
import StatusMessage from '@/components/Summarizer/StatusMessage'
import ErrorMessage from '@/components/Summarizer/ErrorMessage'
import SummaryBlock from '@/components/Summarizer/SummaryBlock'
// Ensure the path to TranscriptionTimeline is correct if it's not under Summarizer
import TranscriptionTimeline from '@/components/Summarizer/TranscriptionTimeline'
import { useSummarization } from '@/lib/summarizer/hooks/useSummarization'
// Import the revised reset function
import { useTranscriptionLogs, resetTranscriptionLogs } from '@/lib/summarizer/hooks/useTranscriptionLogs'
import FFmpegManager from '@/lib/grabit/ffmpeg/FFmpegManager'

const SummarizerClient: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [selectedInputType, setSelectedInputType] = useState<'file' | 'url' | 'text' | null>(null)
  const [ffmpegInstance, setFfmpegInstance] = useState<any>(null) // Consider a more specific type if possible
  const [isFfmpegLoading, setIsFfmpegLoading] = useState(true)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [uploadKey, setUploadKey] = useState(0) // Used to reset FileUploadInput
  const [urlError, setUrlError] = useState('')

  // Use the updated hook - it doesn't need 'loading' as a parameter anymore
  const transcriptionTimeline = useTranscriptionLogs()
  const { summary, whisperTranscription, statusMessage, errorMessage, loading, handleSummarize, reset } =
    useSummarization()

  const resetForm = () => {
    // console.log('Resetting form...')
    setSelectedFile(null)
    setUploadKey((prev) => prev + 1) // Increment key to force re-render/reset FileUploadInput
    setTextInput('')
    setMediaUrl('')
    setUrlError('')
    setSelectedInputType(null)
    // Call the external reset function to clear the timeline display
    resetTranscriptionLogs()
    // Call the summarization hook's reset to clear summary, status, error, etc.
    reset()
  }

  const handleUrlChange = (url: string) => {
    setMediaUrl(url)
    // Automatically select URL input type if URL is not empty
    setSelectedInputType(url ? 'url' : null)
    // Clear other inputs
    setSelectedFile(null)
    setTextInput('')
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    // Automatically select File input type if file is selected
    setSelectedInputType(file ? 'file' : null)
    // Clear other inputs
    setMediaUrl('')
    setTextInput('')
  }

  const handleTextChange = (text: string) => {
    setTextInput(text)
    // Automatically select Text input type if text is not empty
    setSelectedInputType(text ? 'text' : null)
    // Clear other inputs
    setSelectedFile(null)
    setMediaUrl('')
  }

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      setIsFfmpegLoading(true)
      try {
        await FFmpegManager.load()
        const instance = FFmpegManager.getInstance()
        setFfmpegInstance(instance)
      } catch (error) {
        console.error('FFmpeg failed to load', error)
        // Handle FFmpeg loading error if necessary
      } finally {
        setIsFfmpegLoading(false)
      }
    }
    loadFFmpeg()
  }, []) // Empty dependency array means this runs only once on mount

  return (
    <div className="dark:bg-darkPrimary dark:text-gray-100">
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={FadeContainer}
        className="max-w-6xl mx-auto py-16"
      >
        <section className="mx-auto px-5">
          <AppIntro />
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Summarizer</h1>
            {/* Render input fields based on selectedInputType or if none is selected */}
            {(selectedInputType === 'url' || selectedInputType === null) && (
              <URLInput
                url={mediaUrl}
                setUrl={handleUrlChange}
                setIsValidUrl={setIsValidUrl}
                setUrlError={setUrlError}
                urlError={urlError}
              />
            )}
            {(selectedInputType === 'file' || selectedInputType === null) && (
              // Use key to reset component state when file is selected or form is reset
              <FileUploadInput key={uploadKey} onFileSelect={handleFileSelect} />
            )}
            {(selectedInputType === 'text' || selectedInputType === null) && (
              <TextAreaInput text={textInput} setText={handleTextChange} maxWords={5000} />
            )}

            {/* Show loader while FFmpeg is loading (needed for file/url processing) */}
            {isFfmpegLoading ? (
              <div className="flex items-center justify-center mt-4">
                <Loader /> <span className="ml-2 text-sm">Loading necessary components...</span>
              </div>
            ) : (
              // Show buttons only after FFmpeg is loaded
              <div className="flex items-center gap-4 mt-4">
                {/* Summarize Button - enabled only if conditions are met */}
                {(isValidUrl || selectedFile !== null || textInput !== '') && (
                  <SummarizeButton
                    onClick={() => {
                      // IMPORTANT: Reset the timeline display state BEFORE starting a new process
                      resetTranscriptionLogs()
                      // Then call the handleSummarize logic
                      handleSummarize(selectedFile, mediaUrl, textInput, ffmpegInstance)
                    }}
                    loading={loading}
                  />
                )}
                {/* Reset Button - shown if any input type is selected */}
                {selectedInputType !== null && (
                  <button
                    onClick={resetForm}
                    className="mt-4 px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 dark:bg-darkSecondary dark:text-white hover:bg-gray-200 dark:hover:bg-darkTertiary transition"
                    disabled={loading} // Disable reset while summarizing
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Display status and error messages */}
            <StatusMessage message={statusMessage} />
            <ErrorMessage error={errorMessage} />

            {/* Display the final summary */}
            {summary && <SummaryBlock summary={summary} />}

            {/* Display the transcription timeline if there is content or if loading is true
                (to show the area while logs are coming in) */}
            {(transcriptionTimeline || loading) && (
              <TranscriptionTimeline
                rawTranscription={transcriptionTimeline}
                whisperTranscription={whisperTranscription} // Assuming whisperTranscription is the final one from useSummarization
              />
            )}
          </div>

          <hr className="my-16 border-gray-300 dark:border-gray-700" />
          <HowToUse />
        </section>
      </motion.section>
    </div>
  )
}

export default SummarizerClient
