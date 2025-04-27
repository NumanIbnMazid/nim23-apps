'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'
import { getRecommendations } from '@/lib/recommendr/fetchRecommendations'
import PreferenceForm from '@/components/Recommendr/PreferencesForm/PreferenceForm'
import RecommendationList from '@/components/Recommendr/RecommendationList'
import LoadingRecommendations from '@/components/Recommendr/LoadingRecommendations'
import AppIntro from '@/components/Recommendr/AppIntro'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useClientID } from '@/context/clientIdContext'
import { useWebSocket } from '@/context/WebSocketContext'
import PreferenceControls from '@/components/Recommendr/PreferenceControls'
import Error from '@/components/Recommendr/Error'

export default function RecommendrClient({ preferencesChoices }: { preferencesChoices: any }) {
  const [preferences, setPreferences] = useState<any | null>(null)
  const [userPrefs, setUserPrefs] = useState<any | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [currentPreferences, setCurrentPreferences] = useState<any>(null)
  const { clientID } = useClientID()
  const [modifyPreferencesScrollToPrefs, setModifyPreferencesScrollToPrefs] = useState(false)
  const [loadingRecommendationsScrollTo, setLoadingRecommendationsScrollTo] = useState(false)
  const [recommendationListScrollTo, setRecommendationListScrollTo] = useState(false)
  const { logs } = useWebSocket()
  const [recommendationActiveLog, setRecommendationActiveLog] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [liveFormData, setLiveFormData] = useState<any>({
    mood: '',
    media_type: '',
    language: [],
    occasion: [],
    genres: [],
    media_age: [],
    rating: [],
    categories: [],
    other_preferences: '',
  })

  const clearPreferences = () => {
    const emptyForm = {
      mood: '',
      media_type: '',
      language: [],
      occasion: [],
      genres: [],
      media_age: [],
      rating: [],
      categories: [],
      other_preferences: '',
    }

    setLiveFormData(emptyForm)
    setUserPrefs(emptyForm) // <-- force PreferenceForm to reset
  }

  useEffect(() => {
    setPreferences(preferencesChoices)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (
      logs &&
      logs?.message?.type === 'event' &&
      logs?.message?.module === 'recommendr' &&
      logs?.message?.scope === 'get-recommendation'
    ) {
      setRecommendationActiveLog(logs.message.message)
    }
  }, [logs])

  const handleFormSubmit = async (prefs: any) => {
    setError(null)
    setUserPrefs(prefs)
    setRecommendationActiveLog(null)
    setRecommendationLoading(true)
    setShowForm(false)
    setCurrentPreferences(prefs)
    setLoadingRecommendationsScrollTo(true)

    try {
      const response = await getRecommendations(prefs, clientID)
      setRecommendations(response || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('⚠️ Failed to fetch recommendations. Please try again.')
      setShowForm(true)
    } finally {
      setRecommendationLoading(false)
      setRecommendationListScrollTo(true)
    }
  }

  useEffect(() => {
    if (recommendationLoading && loadingRecommendationsScrollTo) {
      const el = document.getElementById('loading-recommendations')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setLoadingRecommendationsScrollTo(false)
      }
    }
  }, [recommendationLoading, loadingRecommendationsScrollTo])

  useEffect(() => {
    if (!recommendationLoading && recommendationListScrollTo) {
      const el = document.getElementById('content-area')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setRecommendationListScrollTo(false)
      }
    }
  }, [recommendationLoading, recommendationListScrollTo])

  useEffect(() => {
    if (showForm && modifyPreferencesScrollToPrefs) {
      const el = document.getElementById('preference-controls')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setModifyPreferencesScrollToPrefs(false)
      }
    }
  }, [showForm, modifyPreferencesScrollToPrefs])

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={FadeContainer}
      viewport={{ once: true }}
      className="max-w-7xl mx-auto px-4 py-16"
    >
      <AppIntro />

      {loading ? (
        <SkeletonLoader />
      ) : (
        <div>
          {showForm && preferences && (
            <>
              <PreferenceControls formData={liveFormData} onClear={clearPreferences} />
              <PreferenceForm
                preferences={preferences}
                onSubmit={handleFormSubmit}
                initialValues={userPrefs}
                onChange={setLiveFormData}
              />
            </>
          )}
          <div id="content-area"></div>
          {error && <Error error={error} />}
          {recommendationLoading && <LoadingRecommendations recommendationActiveLog={recommendationActiveLog} />}
          {!recommendationLoading && userPrefs && recommendations.length > 0 && (
            <RecommendationList
              results={recommendations}
              currentPreferences={currentPreferences}
              handleSubmit={handleFormSubmit}
              showForm={showForm}
              setShowForm={setShowForm}
              setModifyPreferencesScrollToPrefs={setModifyPreferencesScrollToPrefs}
            />
          )}
        </div>
      )}
    </motion.section>
  )
}
