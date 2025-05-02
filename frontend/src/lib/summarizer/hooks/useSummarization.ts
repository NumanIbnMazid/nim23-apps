import { useState } from 'react'
import { processLocalFile } from '@/lib/summarizer/processLocalFile'
import { convertAudioUrlToFile } from '@/lib/summarizer/convertAudioUrlToFile'
import { convertVideoUrlToAudio } from '@/lib/summarizer/convertVideoUrlToAudioFile'
import { convertAudioFileToBase64 } from '@/lib/summarizer/convertAudioFileToBase64'
import { PUBLIC_SITE_URL } from '@/lib/constants'

/**
 * Transcribes base64 audio by calling the backend API
 */
const transcribeAudioBase64 = async (
  audioBase64: string,
  setWhisperTranscription: (text: string) => void
): Promise<string> => {
  const transcriptionRes = await fetch(`${PUBLIC_SITE_URL}/api/summarizer/transcribe-bs64-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_b64: audioBase64 }),
  })

  if (!transcriptionRes.ok) {
    const err = await transcriptionRes.json()
    throw new Error(err.error || 'Failed to transcribe audio.')
  }

  const transcriptionData = await transcriptionRes.json()
  const transcription = transcriptionData.data.transcription
  setWhisperTranscription(transcription)
  return transcription
}

export const useSummarization = () => {
  const [summary, setSummary] = useState('')
  const [whisperTranscription, setWhisperTranscription] = useState('')
  const [transcriptionTimeline, setTranscriptionTimeline] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setSummary('')
    setWhisperTranscription('')
    setTranscriptionTimeline('')
    setStatusMessage('')
    setErrorMessage('')
  }

  const handleSummarize = async (
    selectedFile: File | null,
    mediaUrl: string,
    textInput: string,
    ffmpegInstance: any
  ) => {
    setLoading(true)
    reset()

    try {
      let textToSummarize = ''
      let audioBase64 = ''

      // ### Case: Local file upload
      if (selectedFile) {
        const result = await processLocalFile(selectedFile, ffmpegInstance)
        if (result.base64Audio) {
          setStatusMessage('Audio file processed successfully.')
          audioBase64 = result.base64Audio
          textToSummarize = await transcribeAudioBase64(audioBase64, setWhisperTranscription)
        }
        if (result.text) {
          textToSummarize = result.text
        }
      }
      // ### Case: Media URL
      else if (mediaUrl) {
        setStatusMessage('Fetching and processing media from URL...')
        const isDirectMedia = /\.(mp3|mp4|m4a|mov|wav|webm|ogg)$/i.test(mediaUrl)
        const isVideo = /\.(mp4|mov|webm)$/i.test(mediaUrl)
        const isAudio = /\.(mp3|m4a|wav|ogg)$/i.test(mediaUrl)

        let audioData = null

        if (!isDirectMedia) {
          // Use backend to extract downloadable audio URL
          const res = await fetch(`${PUBLIC_SITE_URL}/api/summarizer/get-audio-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: mediaUrl }),
          })

          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Failed to process media URL.')
          }

          const result = await res.json()
          // *** Assign Audio Data  ***
          const extractedAudio = result.data.extracted_audio_url
          audioData = await convertAudioUrlToFile(extractedAudio, ffmpegInstance)
        }

        // Now audioUrl is a direct link (either provided directly or via backend)
        else if (isVideo || (!isAudio && isDirectMedia)) {
          // *** Assign Audio Data  ***
          audioData = await convertVideoUrlToAudio(mediaUrl, ffmpegInstance)
        } else if (isAudio || (!isVideo && isDirectMedia)) {
          // *** Assign Audio Data  ***
          audioData = await convertAudioUrlToFile(mediaUrl, ffmpegInstance)
        } else {
          throw new Error('Unsupported media type in URL.')
        }

        audioBase64 = await convertAudioFileToBase64(audioData)
        textToSummarize = await transcribeAudioBase64(audioBase64, setWhisperTranscription)
      }
      // ### Case: Plain text input
      else if (textInput) {
        setStatusMessage('Using provided text for summarization.')
        textToSummarize = textInput
      } else {
        throw new Error('No valid input provided for summarization.')
      }

      if (!textToSummarize) {
        throw new Error('No text available for summarization.')
      }

      // Summarization API call
      const response = await fetch(`${PUBLIC_SITE_URL}/api/summarizer/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSummarize, audio_b64: audioBase64 }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to summarize the text.')
      }

      const data = await response.json()
      setSummary(data.data.summary)
      setStatusMessage('Summarization completed successfully.')
    } catch (error: any) {
      // console.error('Summarization error:', error)

      const fallback = 'Something went wrong while processing your input.'
      let errorText = fallback

      try {
        // Try to parse JSON string inside error.message
        if (typeof error?.message === 'string' && error.message.startsWith('{')) {
          const parsed = JSON.parse(error.message)
          errorText = parsed?.error?.error_details || parsed?.message || parsed?.error || fallback
        } else {
          errorText = error?.message || fallback
        }
      } catch (jsonErr) {
        console.warn('Failed to parse error.message as JSON', jsonErr)
        errorText = error?.message || fallback
      }

      setErrorMessage(errorText)
      setStatusMessage('')
    } finally {
      setLoading(false)
    }
  }
  return {
    summary,
    whisperTranscription,
    transcriptionTimeline,
    statusMessage,
    errorMessage,
    loading,
    handleSummarize,
    reset,
  }
}
