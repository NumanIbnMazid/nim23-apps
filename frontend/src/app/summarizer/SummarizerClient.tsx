'use client'

import React, { useState, useEffect } from 'react'
import FileUploadInput from '@/components/Summarizer/FileUploadInput'
import TextAreaInput from '@/components/Summarizer/TextAreaInput'
import SummarizeButton from '@/components/Summarizer/SummarizeButton'
import StatusMessage from '@/components/Summarizer/StatusMessage'
import ErrorMessage from '@/components/Summarizer/ErrorMessage'
import AppIntro from '@/components/Summarizer/AppIntro'
import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'
import Loader from '@/components/Loader'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import FFmpegManager from '@/lib/grabit/ffmpeg/FFmpegManager'
import { processLocalFile } from '@/lib/summarizer/processLocalFile'
import { convertAudioUrlToBase64 } from '@/lib/summarizer/convertAudioUrlToBase64'
import URLInput from '@/components/Summarizer/URLInput'

const SummarizerClient: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  type InputType = 'file' | 'url' | 'text' | null
  const [selectedInputType, setSelectedInputType] = useState<InputType>(null)

  const [ffmpegInstance, setFfmpegInstance] = useState<FFmpeg | null>(null)
  const [isFfmpegLoading, setIsFfmpegLoading] = useState(true)

  const handleUrlChange = (url: string) => {
    setMediaUrl(url)
    if (url) {
      setSelectedInputType('url')
      setSelectedFile(null)
      setTextInput('')
    } else {
      setSelectedInputType(null)
    }
  }

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      setSelectedInputType('file')
      setMediaUrl('')
      setTextInput('')
    } else {
      setSelectedInputType(null)
    }
  }

  const handleTextChange = (text: string) => {
    setTextInput(text)
    if (text) {
      setSelectedInputType('text')
      setSelectedFile(null)
      setMediaUrl('')
    } else {
      setSelectedInputType(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      setIsFfmpegLoading(true)
      try {
        await FFmpegManager.load(setStatusMessage)
        const instance = FFmpegManager.getInstance()
        setFfmpegInstance(instance)
      } catch (error) {
        setErrorMessage(`FFmpeg failed to load: ${error}`)
      } finally {
        setIsFfmpegLoading(false)
      }
    }
    load()
  }, [])

  const handleSummarize = async () => {
    setLoading(true)
    setStatusMessage('')
    setErrorMessage('')
    setSummary('')

    try {
      let textToSummarize = textInput

      if (selectedFile) {
        const result = await processLocalFile(selectedFile, ffmpegInstance!)
        if (result.base64Audio) {
          setStatusMessage('Audio file processed successfully.')
          // TODO: ...
        }
        if (result.text) {
          textToSummarize = result.text
        }
      } else if (mediaUrl) {
        setStatusMessage('Fetching and processing media from URL...')
        const isDirectMedia = /\.(mp3|mp4|m4a|mov|wav|webm|ogg)$/i.test(mediaUrl)
        if (isDirectMedia) {
          // TODO: ...
        } else {
          // Call your own Next.js route that talks to Django
          const res = await fetch('/api/summarizer/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: mediaUrl }),
          })

          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Failed to process media URL.')
          }
          const result = await res.json()
          const audioURL = result.data.extracted_audio_url
          const audioBase64 = await convertAudioUrlToBase64(audioURL, ffmpegInstance!)
          console.log('audioBase64:', audioBase64)

          // TODO: ...
        }
      } else if (textInput) {
        setStatusMessage('Using provided text for summarization.')
        // TODO: ...
      } else {
        throw new Error('No text or file provided for summarization.')
      }

      // console.log('Text to summarize:', textToSummarize);

      if (!textToSummarize) {
        throw new Error('No text available for summarization.')
      }

      // Call your backend API to summarize the text
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSummarize }),
      })

      if (!response.ok) {
        throw new Error('Failed to summarize the text.')
      }

      const data = await response.json()
      setSummary(data.summary)
      setStatusMessage('Summarization completed successfully.')
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark:bg-darkPrimary dark:text-gray-100">
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={FadeContainer}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto py-16"
      >
        <section className="mx-auto px-5">
          <AppIntro />
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Summarizer</h1>
            {selectedInputType !== 'file' && selectedInputType !== 'text' && (
              <URLInput url={mediaUrl} setUrl={handleUrlChange} />
            )}
            {selectedInputType !== 'url' && selectedInputType !== 'text' && (
              <FileUploadInput onFileSelect={handleFileSelect} />
            )}

            {selectedInputType !== 'url' && selectedInputType !== 'file' && (
              <TextAreaInput text={textInput} setText={handleTextChange} maxWords={5000} />
            )}
            {isFfmpegLoading ? <Loader /> : <SummarizeButton onClick={handleSummarize} loading={loading} />}

            <StatusMessage message={statusMessage} />
            <ErrorMessage error={errorMessage} />
            {summary && (
              <div className="mt-4 p-4 border border-gray-300 rounded-md">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </section>
      </motion.section>
    </div>
  )
}

export default SummarizerClient
