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
import TranscriptionTimeline from '@/components/Summarizer/TranscriptionTimeline'
import { useSummarization } from '@/lib/summarizer/hooks/useSummarization'
import { useTranscriptionLogs, resetTranscriptionLogs } from '@/lib/summarizer/hooks/useTranscriptionLogs'
import FFmpegManager from '@/lib/grabit/ffmpeg/FFmpegManager'

const SummarizerClient: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [selectedInputType, setSelectedInputType] = useState<'file' | 'url' | 'text' | null>(null)
  const [ffmpegInstance, setFfmpegInstance] = useState<any>(null)
  const [isFfmpegLoading, setIsFfmpegLoading] = useState(true)
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)
  const [urlError, setUrlError] = useState('')

  const transcriptionTimeline = useTranscriptionLogs()
  const { summary, whisperTranscription, statusMessage, errorMessage, loading, handleSummarize, reset } =
    useSummarization()

  const resetForm = () => {
    setSelectedFile(null)
    setUploadKey((prev) => prev + 1)
    setTextInput('')
    setMediaUrl('')
    setUrlError('')
    setSelectedInputType(null)
    resetTranscriptionLogs()
    reset()
  }

  const handleUrlChange = (url: string) => {
    setMediaUrl(url)
    setSelectedInputType(url ? 'url' : null)
    setSelectedFile(null)
    setTextInput('')
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    setSelectedInputType(file ? 'file' : null)
    setMediaUrl('')
    setTextInput('')
  }

  const handleTextChange = (text: string) => {
    setTextInput(text)
    setSelectedInputType(text ? 'text' : null)
    setSelectedFile(null)
    setMediaUrl('')
  }

  useEffect(() => {
    const loadFFmpeg = async () => {
      setIsFfmpegLoading(true)
      try {
        await FFmpegManager.load()
        const instance = FFmpegManager.getInstance()
        setFfmpegInstance(instance)
      } catch (error) {
        console.error('FFmpeg failed to load', error)
      } finally {
        setIsFfmpegLoading(false)
      }
    }
    loadFFmpeg()
  }, [])

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
            {selectedInputType !== 'file' && selectedInputType !== 'text' && (
              <URLInput
                url={mediaUrl}
                setUrl={handleUrlChange}
                setIsValidUrl={setIsValidUrl}
                setUrlError={setUrlError}
                urlError={urlError}
              />
            )}
            {selectedInputType !== 'url' && selectedInputType !== 'text' && (
              <FileUploadInput key={uploadKey} onFileSelect={handleFileSelect} />
            )}
            {selectedInputType !== 'url' && selectedInputType !== 'file' && (
              <TextAreaInput text={textInput} setText={handleTextChange} maxWords={5000} />
            )}
            {isFfmpegLoading ? (
              <Loader />
            ) : (
              <div className="flex items-center gap-4 mt-4">
                {(isValidUrl || selectedFile !== null || textInput !== '') && (
                  <SummarizeButton
                    onClick={() => {
                      resetTranscriptionLogs()
                      handleSummarize(selectedFile, mediaUrl, textInput, ffmpegInstance)
                    }}
                    loading={loading}
                  />
                )}
                {selectedInputType !== null && (
                  <button
                    onClick={resetForm}
                    className="mt-4 px-4 py-2 border rounded-md text-sm font-medium bg-gray-100 dark:bg-darkSecondary dark:text-white hover:bg-gray-200 dark:hover:bg-darkTertiary transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            <StatusMessage message={statusMessage} />
            <ErrorMessage error={errorMessage} />
            {summary && <SummaryBlock summary={summary} />}
            {transcriptionTimeline && (
              <TranscriptionTimeline
                rawTranscription={transcriptionTimeline}
                whisperTranscription={whisperTranscription}
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
