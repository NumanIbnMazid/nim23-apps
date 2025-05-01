import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'
import FFmpegManager from '@/lib/grabit/ffmpeg/FFmpegManager'
import { fetchMediaDetails } from '@/lib/grabit/fetchMediaDetails'
import { updateFormatOptions } from '@/lib/grabit/updateFormatOptions'
import { processDownload } from '@/lib/grabit/processDownload'
import Concern from '@/components/Grabit/Concern'
import MediaInput from '@/components/Grabit/MediaInput'
import MediaInfo from '@/components/Grabit/MediaInfo'
import MediaType from '@/components/Grabit/MediaType'
import MediaSelect from '@/components/Grabit/MediaSelect'
import MediaFormat from '@/components/Grabit/MediaFormat'
import DownloadButton from '@/components/Grabit/DownloadButton'
import StatusMessage from '@/components/Grabit/StatusMessage'
import ErrorMessage from '@/components/Grabit/ErrorMessage'
import AppIntro from '@/components/Grabit/AppIntro'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import HowToUseGrabit from '@/components/Grabit/HowToUse'
import Loader from '@/components/Loader'

export default function GrabitPage() {
  const [fetchMediaLoading, setFetchMediaLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const [mediaInfoScrollToPrefs, setMediaInfoScrollToPrefs] = useState(false)

  const [error, setError] = useState('')

  const [mediaData, setMediaData] = useState<any>(null)
  const [formats, setFormats] = useState<any[]>([])

  const mediaUrlRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>
  const selectedFormatRef = useRef<HTMLSelectElement>(null) as React.RefObject<HTMLSelectElement>
  const mediaTypeRef = useRef<HTMLSelectElement>(null) as React.RefObject<HTMLSelectElement>
  const mediaFormatRef = useRef<HTMLSelectElement>(null) as React.RefObject<HTMLSelectElement>
  const downloadPathRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>

  const [ffmpegInstance, setFfmpegInstance] = useState<FFmpeg | null>(null)
  const [isFfmpegLoading, setIsFfmpegLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsFfmpegLoading(true)
      try {
        await FFmpegManager.load(setStatusMessage)
        const instance = FFmpegManager.getInstance()
        setFfmpegInstance(instance)
      } catch (error) {
        setError(`FFmpeg failed to load: ${error}`)
      } finally {
        setIsFfmpegLoading(false)
      }
    }
    load()
  }, [])

  // Reset statusMessage
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(''), 50000)
      return () => clearTimeout(timer) // Cleanup timer on unmount or statusMessage change
    }
  }, [statusMessage])

  useEffect(() => {
    if (mediaData && mediaInfoScrollToPrefs) {
      const el = document.getElementById('media-info')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setMediaInfoScrollToPrefs(false)
      }
    }
  }, [mediaData, mediaInfoScrollToPrefs])

  const downloadLoadHandler = async () => {
    setDownloadLoading(true)
    setDownloadProgress(0)
    setStatusMessage('')
    setError('')

    const mediaTitle = mediaData?.title || ''
    const bestAudioObject = mediaData?.formats_filtered?.best_audio || {}

    try {
      if (!ffmpegInstance) {
        setError('FFmpeg is not loaded. Please try again.')
        return
      }
      await processDownload(
        mediaTitle,
        mediaTypeRef,
        mediaFormatRef,
        selectedFormatRef,
        bestAudioObject,
        downloadPathRef,
        ffmpegInstance,
        setDownloadProgress,
        setStatusMessage
      )
      setDownloadLoading(false)
    } catch (error) {
      setDownloadLoading(false)
      setError(`${error}`)
    }
    setDownloadLoading(false)
  }

  const fetchDetails = async () => {
    setMediaData(null)
    setError('')
    setStatusMessage('')
    if (!mediaUrlRef.current) return

    setFetchMediaLoading(true)
    try {
      const mediaDetails = await fetchMediaDetails(mediaUrlRef.current.value, setStatusMessage)
      setMediaData(mediaDetails)
      const formats = updateFormatOptions('video', mediaDetails)
      setFormats(formats)
      setMediaInfoScrollToPrefs(true)
    } catch (error) {
      setStatusMessage('')
      const message = error instanceof Error ? error.message : 'Unknown error!'
      setError(message)
    }
    setFetchMediaLoading(false)
  }

  const handleFormatOptionsUpdate = () => {
    if (mediaData && mediaTypeRef.current) {
      const formats = updateFormatOptions(mediaTypeRef.current.value, mediaData)
      setFormats(formats)
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
          <Concern />

          <div className="items-center my-4 dark:text-gray-300">
            <motion.div initial="hidden" whileInView="visible" variants={FadeContainer} viewport={{ once: true }}>
              <MediaInput mediaUrlRef={mediaUrlRef} fetchMediaDetails={fetchDetails} loading={fetchMediaLoading} />
              {mediaData && (
                <div id="media-info">
                  <MediaInfo mediaInfo={mediaData} videoUrl={mediaUrlRef.current?.value || ''} />
                  <MediaType
                    mediaData={mediaData}
                    mediaTypeRef={mediaTypeRef}
                    updateFormatOptions={handleFormatOptionsUpdate}
                  />
                  <MediaSelect
                    formats={formats}
                    bestAudioObject={mediaData?.formats_filtered?.best_audio || {}}
                    selectedFormatRef={selectedFormatRef}
                  />
                  <MediaFormat mediaTypeRef={mediaTypeRef} mediaFormatRef={mediaFormatRef} />
                  {isFfmpegLoading ? (
                    <Loader />
                  ) : (
                    <DownloadButton
                      downloadMedia={downloadLoadHandler}
                      selectedFormatRef={selectedFormatRef}
                      loading={downloadLoading}
                      progress={downloadProgress}
                    />
                  )}
                </div>
              )}
            </motion.div>
            <StatusMessage statusMessage={statusMessage} />
            <ErrorMessage error={error} />
          </div>
          <hr className="my-16 border-gray-300 dark:border-gray-700" />
          <HowToUseGrabit />
        </section>
      </motion.section>
    </div>
  )
}
