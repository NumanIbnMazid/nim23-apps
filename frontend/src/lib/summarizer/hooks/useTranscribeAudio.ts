import { useEffect, useRef, useState } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { sendAudioChunksViaSocket } from '@/lib/summarizer/sendAudioChunksViaSocket'

export const useTranscribeAudio = () => {
  // Use the summarizerLogs array as specified
  const { summarizerSocket, summarizerLogs } = useWebSocket()

  // State to indicate if we are currently waiting for a transcription result log
  const [isWaiting, setIsWaiting] = useState(false)

  // Refs to hold the promise resolve function and the component's transcription setter
  // These are needed to communicate the result back to the component that called the hook
  const resolveRef = useRef<(value: string) => void>(undefined)
  const setTranscriptionRef = useRef<(text: string) => void>(undefined)

  // 📍 Track the index in the 'summarizerLogs' array where the *current* task's logs start.
  // This is the key to ignoring logs from previous tasks in the cumulative array.
  // When a new task starts, we set this to summarizerLogs.length.
  const lastProcessedLogIndex = useRef<number>(0)

  // Effect to process new logs from the summarizerLogs array.
  // This effect runs whenever summarizerLogs changes (i.e., a new log arrives).
  useEffect(() => {
    const currentLogsSnapshot = summarizerLogs // Take a snapshot for a stable iteration context

    // We only care about logs added since the last processing step.
    // The 'slice' operation correctly processes only new entries.
    // Because lastProcessedLogIndex is reset on new tasks, this correctly handles cumulative logs.
    const newLogs = currentLogsSnapshot.slice(lastProcessedLogIndex.current)

    // If there are no new logs or we are not waiting for a transcription result, do nothing
    // The `isWaiting` check is crucial here to ensure we only process when actively expecting a result.
    if (newLogs.length === 0 || !isWaiting) {
      // Always update the index even if no new logs match the filter,
      // so we don't reprocess the same empty slice next time.
      // But only if we are not waiting, otherwise wait for a match.
      // Wait, this logic is tricky. The index *must* update after processing, regardless of finding a match
      // for the *current* batch of new logs. Let's move the index update outside the loop.
      if (newLogs.length === 0) {
        // Still update index if no new logs at all
        lastProcessedLogIndex.current = currentLogsSnapshot.length
      }
      return
    }

    // Process the new logs received since the last update
    for (const summarizerLog of newLogs) {
      // Check if this log is the full transcription result we are waiting for
      // Apply filters carefully based on the expected log structure
      if (
        summarizerLog?.type === 'datastream' && // Assuming the top-level type is datastream
        summarizerLog?.message?.module === 'summarizer' &&
        summarizerLog?.message?.sender === 'server' &&
        summarizerLog?.message?.type === 'transcription_result' && // Assuming nested type indicates result
        summarizerLog?.message?.scope === 'full_transcription' &&
        typeof summarizerLog?.message?.message === 'string' // Ensure the message content is a string
      ) {
        // console.log('✅ Received full transcription result log.')
        const transcription = summarizerLog.message.message

        // Use the stored setter and resolver
        setTranscriptionRef.current?.(transcription)
        resolveRef.current?.(transcription)
        setIsWaiting(false)

        // Clear the refs now that the result is handled
        resolveRef.current = undefined
        setTranscriptionRef.current = undefined

        // No need to process further logs for this task once the result is found
        // We can potentially break here if we only expect one final result log per task.
        // If there could be multiple 'full_transcription' logs (unlikely), remove the break.
        // Assuming one final log, break is efficient.
        break
      }
    }

    // Always update lastProcessedLogIndex to the current total length of the snapshot.
    // This ensures that the next time this effect runs, it starts processing from the logs
    // added *after* this current batch.
    lastProcessedLogIndex.current = currentLogsSnapshot.length

    // Depend on summarizerLogs changing (new logs arrive) and isWaiting (so we react when waiting starts)
  }, [summarizerLogs, isWaiting, resolveRef, setTranscriptionRef]) // Include refs in deps if their values are critical for the logic flow

  // Function to initiate a new audio transcription task
  const transcribeAudioBase64 = async (
    audioBase64: string,
    setWhisperTranscription: (text: string) => void, // The component's state setter
    chunkSize: number = 1, // Optional chunk size parameter
    currentChunkIndex: number = 0, // Optional current chunk index parameter
    currentStartTime: number = 0, // Optional current start time parameter
  ): Promise<string> => {
    if (!summarizerSocket || summarizerSocket.readyState !== WebSocket.OPEN) {
      console.error('🔴 [Summarizer] WebSocket is not connected')
      throw new Error('🔴 [Summarizer] WebSocket is not connected')
    }

    // 📍 IMPORTANT: Reset the log processing index BEFORE starting a new task.
    // This captures the current state of the summarizerLogs array.
    // When new logs for THIS task arrive, they will appear *after* this index.
    lastProcessedLogIndex.current = summarizerLogs.length
    // console.log(`Starting new transcription task. Resetting log index to ${lastProcessedLogIndex.current}.`)

    // Store the component's setter and the promise resolver for later use in the useEffect
    setTranscriptionRef.current = setWhisperTranscription
    // Create a new promise and store its resolve function
    const transcriptionPromise = new Promise<string>((resolve) => {
      resolveRef.current = resolve
    })

    // Indicate that we are now waiting for a transcription result
    setIsWaiting(true) // This state change will trigger the useEffect

    // Send the audio data to the server
    try {
      // Assuming sendAudioChunksViaSocket returns a promise that resolves when chunks are sent
      await sendAudioChunksViaSocket(audioBase64, summarizerSocket, chunkSize, currentChunkIndex, currentStartTime)
      // console.log('Audio chunks sent.')
    } catch (error) {
      console.error('Failed to send audio chunks:', error)
      // Reject the promise and clean up if sending fails
      resolveRef.current?.('') // Resolve with empty string or reject with error
      resolveRef.current = undefined
      setTranscriptionRef.current = undefined
      setIsWaiting(false) // Stop waiting
      throw error // Re-throw the error
    }

    // Return the promise. It will be resolved by the useEffect when the corresponding log arrives.
    return transcriptionPromise
  }

  return { transcribeAudioBase64 }
}
