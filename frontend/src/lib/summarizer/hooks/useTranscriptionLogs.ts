import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider'

// Use a function reference exposed globally (within this module) to signal the hook to reset its state.
// This is a common pattern to allow external triggers for hook state updates when dependencies aren't suitable.
let signalTimelineReset: (() => void) | null = null

/**
 * Hook to track and aggregate transcription timeline logs specifically from the summarizer WebSocket channel,
 * assuming these logs are routed to the general '/ws/logs/' endpoint and appear in the 'logs' context state.
 * Its internal state (the displayed timeline string) can be reset by calling the exported `resetTranscriptionLogs` function.
 */
export const useTranscriptionLogs = () => {
  const [transcriptionTimeline, setTranscriptionTimeline] = useState('')

  // Use the general 'logs' array from the context, as specified by the user.
  const { logs } = useWebSocket()

  // Ref to track the last processed index *within the cumulative 'logs' array* overall.
  // This is used to efficiently process only newly added logs on each update.
  // It also marks the starting point for processing logs of the *current* task after a reset.
  const lastProcessedLogIndex = useRef<number>(0)

  // Effect to set up the external reset signal handler.
  // This allows the `resetTranscriptionLogs` function called from the component
  // to trigger a state update inside this specific hook instance.
  useEffect(() => {
    signalTimelineReset = () => {
      // console.log('External reset signal received, clearing transcription timeline state.');
      // When resetting, capture the *current* length of the 'logs' array.
      // The next task's logs will start arriving *after* this index.
      lastProcessedLogIndex.current = logs.length // <-- CORRECT RESET POINT
      // Clear the displayed timeline state.
      setTranscriptionTimeline('')
    }

    // Cleanup this handler when the hook unmounts.
    return () => {
      signalTimelineReset = null
    }
  }, [logs]) // Dependency on 'logs' is needed here to get the correct length at the time of reset signal.

  // Effect to process new logs and update the timeline display.
  // This effect runs whenever the 'logs' array from the context updates.
  useEffect(() => {
    const currentLogsSnapshot = logs // Take a snapshot for a stable iteration context

    // We only care about logs added since the last processing step.
    // The 'slice' operation naturally handles the cumulative nature of 'logs'
    // as long as lastProcessedLogIndex is correctly maintained.
    const newLogs = currentLogsSnapshot.slice(lastProcessedLogIndex.current)

    // If there are no new logs since last processing, do nothing.
    if (newLogs.length === 0) return

    const newLines: string[] = []
    newLogs.forEach((log: any) => {
      // Filter for specific whisper event logs from the summarizer module within the general 'logs' array
      // Ensure log structure matches expectations before accessing properties
      if (
        log?.message?.type === 'event' &&
        log.message.module === 'summarizer' &&
        log.message.scope === 'whisper' &&
        typeof log.message.message === 'string' // Ensure message is a string before trimming
      ) {
        const newLine = log.message.message.trim()
        // Add the line to our temporary array if it's not empty
        if (newLine) {
          newLines.push(newLine)
        }
      }
    })

    // If we found new lines to add from the *current* processing batch...
    if (newLines.length > 0) {
      // Check if we need to add a newline before appending, unless it's the very first line
      setTranscriptionTimeline((prev) => (prev ? `${prev}\n${newLines.join('\n')}` : newLines.join('\n')))
    }

    // Always update lastProcessedLogIndex to the *current* total length of the 'logs' array snapshot.
    // The next time this effect runs, it will slice from this new index.
    lastProcessedLogIndex.current = currentLogsSnapshot.length

    // This effect depends on 'logs' changing.
  }, [logs])

  // Return the aggregated transcription timeline string
  return transcriptionTimeline
}

/**
 * Exports a function that signals the useTranscriptionLogs hook instance
 * (if mounted) to reset its state. This is called by components (like the page)
 * when the timeline display needs to be cleared (e.g., on new task start or form reset).
 */
export const resetTranscriptionLogs = () => {
  // console.log('Calling resetTranscriptionLogs (external signal)');
  if (signalTimelineReset) {
    signalTimelineReset() // Call the function exposed by the hook instance
  } else {
    // This might happen if the component using the hook hasn't mounted yet
    // when reset is called, or if the component is not currently rendered.
    // console.warn('resetTranscriptionLogs called before useTranscriptionLogs hook was initialized or mounted.');
  }
}

// Removed the complex globalReset and logsToClear logic as per user request.
// The focus is now solely on resetting the *display state* managed by the hook,
// not on clearing logs from the global WebSocket context.
