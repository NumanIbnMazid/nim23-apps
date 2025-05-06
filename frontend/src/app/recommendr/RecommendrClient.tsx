'use client'

import { useEffect, useState, useRef } from 'react'
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
import HowToUse from '@/components/Recommendr/HowToUse'

export default function RecommendrClient({ preferencesChoices }: { preferencesChoices: any }) {
  const [preferences, setPreferences] = useState<any | null>(null)
  const [userPrefs, setUserPrefs] = useState<any | null>(null) // State to hold submitted preferences
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true) // Initial loading for choices
  const [recommendationLoading, setRecommendationLoading] = useState(false) // Loading for recommendations
  const [showForm, setShowForm] = useState(true) // Control form visibility
  const [currentPreferences, setCurrentPreferences] = useState<any>(null) // Preferences used for the current recommendation list
  const { clientID } = useClientID() // Assuming clientID is needed for API calls
  const [modifyPreferencesScrollToPrefs, setModifyPreferencesScrollToPrefs] = useState(false)
  const [loadingRecommendationsScrollTo, setLoadingRecommendationsScrollTo] = useState(false)
  const [recommendationListScrollTo, setRecommendationListScrollTo] = useState(false)

  // Access the logs array from the context
  const { logs, socketSessionID } = useWebSocket()

  const [recommendationActiveLog, setRecommendationActiveLog] = useState<string | null>(null)
  // 📍 Track the index in the 'logs' array where the *current* task's logs start
  const currentTaskLogStartIndex = useRef<number>(0)
  // 📍 Track the last processed index *within the cumulative 'logs' array* overall.
  const lastProcessedLogIndex = useRef<number>(0)

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

  // Function to reset the form and associated states
  const clearPreferences = () => {
    // console.log('Clearing preferences...')
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

    setLiveFormData(emptyForm) // Reset the live form data
    setUserPrefs(emptyForm) // Reset the submitted preferences

    setRecommendations([]) // Clear previous recommendations
    setCurrentPreferences(null) // Clear the preferences used for the list
    setError(null) // Clear any error messages
    setShowForm(true) // Ensure the form is visible

    // 📍 IMPORTANT: Reset the log processing index
    // Set the starting point for the next task's logs to the current end of the logs array.
    currentTaskLogStartIndex.current = logs.length
    lastProcessedLogIndex.current = logs.length // Also update the processing index

    setRecommendationActiveLog(null) // Clear the active log message
  }

  // Effect to load initial preferences choices
  useEffect(() => {
    setPreferences(preferencesChoices)
    setLoading(false)
  }, [preferencesChoices]) // Dependency on preferencesChoices

  // Effect to process new logs for the active recommendation task
  useEffect(() => {
    const currentLogsSnapshot = logs // Snapshot the logs array

    // Process logs added since the last update
    const newLogs = currentLogsSnapshot.slice(lastProcessedLogIndex.current)

    newLogs.forEach((log) => {
      // Only process logs related to the current task (those after the reset point)
      if (
        log &&
        log?.message?.type === 'event' &&
        log?.message?.module === 'recommendr' &&
        log?.message?.scope === 'get-recommendation' &&
        typeof log?.message?.message === 'string' // Ensure message is a string
      ) {
        const message = log.message.message.trim()
        if (message) {
          // Assuming recommendationActiveLog should only show the LATEST message
          setRecommendationActiveLog(message)
        }
      }
    })

    // Always update the last processed index to the current total length of the snapshot.
    // The next time this effect runs, it will slice from this new index.
    lastProcessedLogIndex.current = currentLogsSnapshot.length

    // Dependency is the logs array itself
  }, [logs]) // React to the logs array changing

  // Handler for form submission
  const handleFormSubmit = async (prefs: any) => {
    // console.log('Submitting form...')
    setError(null) // Clear previous errors
    setUserPrefs(prefs) // Store the submitted preferences
    setCurrentPreferences(prefs) // Set preferences for the list display

    // 📍 IMPORTANT: Reset the log processing index BEFORE fetching new recommendations
    // Set the starting point for the new task's logs to the current end of the logs array.
    currentTaskLogStartIndex.current = logs.length
    lastProcessedLogIndex.current = logs.length // Also update the processing index

    setRecommendationActiveLog(null) // Clear any active log from previous tasks
    setRecommendations([]) // Clear previous recommendations list
    setRecommendationLoading(true) // Start loading indicator
    setShowForm(false) // Hide the form while loading
    setLoadingRecommendationsScrollTo(true) // Trigger scroll to loading area

    try {
      // Assuming getRecommendations sends logs to the /ws/logs/ endpoint
      const response = await getRecommendations(prefs, clientID, socketSessionID)
      setRecommendations(response || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('⚠️ Failed to fetch recommendations. Please try again.')
      setShowForm(true) // Show form again on error
    } finally {
      setRecommendationLoading(false) // Stop loading indicator
      setRecommendationListScrollTo(true) // Trigger scroll to the results list
      // Optionally clear the active log here if it should disappear when loading finishes
      // setRecommendationActiveLog(null); // Uncomment if needed
    }
  }

  // Effects for scrolling behavior
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
              {/* Preference Controls (includes clear button) */}
              <PreferenceControls formData={liveFormData} onClear={clearPreferences} />
              {/* Preference Form */}
              <PreferenceForm
                preferences={preferences}
                onSubmit={handleFormSubmit}
                initialValues={userPrefs}
                onChange={setLiveFormData} // Keep live form data updated
              />
            </>
          )}
          <div id="content-area"></div> {/* Anchor for scrolling */}
          {error && <Error error={error} />} {/* Display errors */}
          {/* Show loading indicator with active log */}
          {recommendationLoading && <LoadingRecommendations recommendationActiveLog={recommendationActiveLog} />}
          {/* Show recommendation list when not loading, userPrefs are set, and there are results */}
          {!recommendationLoading && userPrefs && recommendations.length > 0 && (
            <RecommendationList
              results={recommendations}
              currentPreferences={currentPreferences}
              // Pass handlers for interaction (e.g., modify preferences)
              handleSubmit={handleFormSubmit} // Pass submit handler if needed by list items (e.g., retry)
              showForm={showForm} // Current form visibility state
              setShowForm={setShowForm} // Function to change form visibility
              setModifyPreferencesScrollToPrefs={setModifyPreferencesScrollToPrefs} // Scroll trigger
            />
          )}
          <hr className="my-6 border-gray-300 dark:border-gray-700" />
          <HowToUse />
        </div>
      )}
    </motion.section>
  )
}
