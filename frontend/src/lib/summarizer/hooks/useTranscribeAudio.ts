import { useEffect, useRef } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider' // Adjust path as necessary
import { sendAudioChunksViaSocket } from '@/lib/summarizer/sendAudioChunksViaSocket' // Adjust path as necessary

// Define constants for polling behavior
const POLLING_INTERVAL_MS = 50 // How often to check for the message
const POLLING_TIMEOUT_MS = 60000 // Total time to wait (e.g., 60 seconds)
const MAX_POLLING_ATTEMPTS = POLLING_TIMEOUT_MS / POLLING_INTERVAL_MS // Calculate max attempts

export const useTranscribeAudio = () => {
  // Access summarizerLogs state from the WebSocket provider
  const { summarizerSocket, summarizerLogs } = useWebSocket()

  // Create a ref to hold the *latest* value of summarizerLogs.
  // This circumvents the stale closure issue in the async function.
  const logsRef = useRef(summarizerLogs)

  // Keep the ref updated whenever summarizerLogs changes in the provider's state.
  useEffect(() => {
    logsRef.current = summarizerLogs
    // Optional: Log when the ref updates, useful for debugging state propagation
    // console.log('🔊 logsRef updated. New length:', summarizerLogs.length);
  }, [summarizerLogs]) // Depend on the summarizerLogs array reference

  /**
   * Sends an audio chunk via WebSocket and waits for the corresponding transcription result.
   *
   * This function polls the summarizerLogs state (via a ref) for a message
   * matching the provided chunkID, up to a defined timeout.
   *
   * @param audioBase64 The audio chunk data as a Base64 string.
   * @param totalChunks The total number of chunks the audio file was split into.
   * @param currentChunkIndex The zero-based index of the current chunk being processed.
   * @param currentStartTime The start time in seconds of the current chunk within the original audio.
   * @param chunkID A unique identifier for this specific chunk.
   * @param setStatusMessage A function to set the status message in the parent component.
   * @returns A Promise that resolves with the transcription text for the chunk,
   *          or rejects if the WebSocket is not connected, the message format is invalid,
   *          or the timeout is reached without finding the result.
   */
  const transcribeAudioBase64 = async (
    audioBase64: string,
    totalChunks: number = 1,
    currentChunkIndex: number = 0,
    currentStartTime: number = 0,
    chunkID: string,
    setStatusMessage: (message: string) => void
  ): Promise<string> => {
    if (!summarizerSocket || summarizerSocket.readyState !== WebSocket.OPEN) {
      // Throw an error immediately if socket is not ready
      const error = new Error('🔴 [Summarizer] WebSocket is not connected')
      console.error(error.message)
      throw error
    }

    // Send the audio chunk with metadata
    // setStatusMessage(`🔊 Sending chunk ${currentChunkIndex + 1}/${totalChunks})...`)
    await sendAudioChunksViaSocket(
      audioBase64,
      summarizerSocket,
      totalChunks,
      currentChunkIndex,
      currentStartTime,
      chunkID
    )

    let resultText = ''
    let attempts = 0
    // Use the ref to get the current number of logs *before* we expect the new one
    const initialLogCount = logsRef.current.length
    let foundLog = null

    // setStatusMessage(`🔊 Waiting for transcription result for chunk ${currentChunkIndex + 1}...`)

    // Use a try/catch block to handle potential errors during the waiting process (like timeout)
    try {
      // Poll the logsRef.current until the message is found or timeout is reached
      while (attempts < MAX_POLLING_ATTEMPTS && !foundLog) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS))
        attempts++

        // Use the latest logs from the ref on each iteration
        const currentLogs = logsRef.current
        // Search only the logs that have arrived since we started waiting
        const newLogs = currentLogs.slice(initialLogCount)

        // Find the specific log for this chunkID
        foundLog = newLogs.find(
          (log) =>
            log.type === 'datastream' &&
            log.message?.module === 'summarizer' &&
            log.message?.sender === 'server' &&
            log.message?.type === 'transcription_result' &&
            log.message?.scope === 'full_transcription' &&
            typeof log.message?.message === 'string' &&
            log.message?.chunk_id === chunkID // *** Crucial check ***
        )

        // Optional: Add more specific logging if needed during debugging
        // console.log(`Attempt ${attempts}: checked ${newLogs.length} new logs. Found: ${!!foundLog}`);
      }

      // After the loop, check if a log was found
      if (foundLog) {
        resultText = foundLog.message.message
        setStatusMessage(`🔊 Got transcription result for chunk ${currentChunkIndex + 1}...`) // Log snippet
      } else {
        // If the loop finished but foundLog is still null, it means timeout occurred
        // This should be caught by the try/catch if the timeout throws an error inside the loop
        // However, if the loop could exit for other reasons, handle them here.
        // Given our current loop structure, the only other exit besides finding the log is the timeout.
        // So this 'else' block is primarily for clarity if the timeout logic wasn't throwing.
        // With the timeout check throwing, this else might be redundant if the catch block always runs on timeout.
        // Let's ensure the timeout condition *always* throws.
        const unexpectedError = new Error(
          `🔴 [Summarizer] Polling loop ended unexpectedly for chunk ${currentChunkIndex + 1} (ID: ${chunkID}).`
        )
        console.error(unexpectedError.message)
        throw unexpectedError // Treat unexpected loop exit as an error
      }
    } catch (error: any) {
      // This catch block will run if the timeout is reached or if any other error occurs during the wait
      setStatusMessage(`🔴 Error or timeout waiting for transcription result for chunk ${currentChunkIndex + 1}!`)
      // Re-throw the error so the caller (transcribeAudioFile) can handle it
      throw error
    }

    // If we reach here, it means the transcription result was successfully found and resultText is set.
    return resultText // Return the successfully found text
  }

  return { transcribeAudioBase64 }
}
