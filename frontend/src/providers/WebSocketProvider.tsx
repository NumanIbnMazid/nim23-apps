'use client'

import React, { useContext, useEffect, useRef, useState, useReducer } from 'react'
import { WebSocketContext } from './websocket/context'
// NOTE: *** Log reducer currently limiting logs to 1000, this won't show logs more than 1000 ***
import { logReducer, summarizerLogReducer, whisperLogReducer } from './websocket/reducers'
import { connectWebSocket } from './websocket/connectWebSocket' // <-- Import the extracted function
export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [summarizerConnected, setSummarizerConnected] = useState(true)
  const [summarizerRetrying, setSummarizerRetrying] = useState(false)
  const summarizerRetryTimeout = useRef<NodeJS.Timeout | null>(null)
  const [logs, dispatchLogs] = useReducer(logReducer, [])

  const [summarizerLogs, dispatchSummarizerLogs] = useReducer(summarizerLogReducer, [])
  const [whisperLogs, dispatchWhisperLogs] = useReducer(whisperLogReducer, [])
  // Keep the session ID state
  // socketSessionID is passed to the connectWebSocket function
  const [socketSessionID] = useState(() => crypto.randomUUID())
  // Use refs to hold the WebSocket instances (standard practice)
  // These refs are passed to the connectWebSocket function
  const logsRef = useRef<WebSocket | null>(null)
  const summarizerRef = useRef<WebSocket | null>(null)
  const whisperRef = useRef<WebSocket | null>(null)
  // Refs for managing timeouts and intervals (standard practice)
  // These refs are passed to the connectWebSocket function
  const reconnectLogsTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const reconnectSummarizerTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const reconnectWhisperTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const logsPingInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const summarizerPingInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const whisperPingInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  // *** NEW: Ref to track if initialization has occurred for this component instance ***
  // This ref persists across renders and its value is not affected by Strict Mode's
  // double effect runs on mount, allowing us to track if the setup logic
  // has executed at least once for this instance.
  const initializedRef = useRef(false)
  // Effect for managing connections
  useEffect(() => {
    // --- Define Cleanup Logic ---
    // This cleanup function will run on unmount, or between runs in Strict Mode development
    const cleanup = () => {
      console.log('🔧 Cleaning up WebSocket connections...')
      // Clear any pending reconnect timeouts
      if (reconnectLogsTimeout.current) {
        clearTimeout(reconnectLogsTimeout.current)
        reconnectLogsTimeout.current = undefined
      }
      if (reconnectSummarizerTimeout.current) {
        clearTimeout(reconnectSummarizerTimeout.current)
        reconnectSummarizerTimeout.current = undefined
      }
      if (reconnectWhisperTimeout.current) {
        clearTimeout(reconnectWhisperTimeout.current)
        reconnectWhisperTimeout.current = undefined
      }
      // Clear any pending ping intervals
      if (logsPingInterval.current) {
        clearInterval(logsPingInterval.current)
        logsPingInterval.current = undefined
      }
      if (summarizerPingInterval.current) {
        clearInterval(summarizerPingInterval.current)
        summarizerPingInterval.current = undefined
      }
      if (whisperPingInterval.current) {
        clearInterval(whisperPingInterval.current)
        whisperPingInterval.current = undefined
      }
      if (summarizerRetryTimeout.current) {
        clearTimeout(summarizerRetryTimeout.current)
        summarizerRetryTimeout.current = null
      }
      // Close sockets if they are open.
      // Use code 1000 for clean closure which tells the onclose handler *not* to reconnect.
      // Check readyState explicitly.
      if (
        logsRef.current &&
        logsRef.current.readyState !== WebSocket.CLOSING &&
        logsRef.current.readyState !== WebSocket.CLOSED
      ) {
        logsRef.current.close(1000, 'Client disconnecting')
      } else {
        // If ref is null or already closing/closed, just ensure ref is null
        logsRef.current = null
      }
      if (
        summarizerRef.current &&
        summarizerRef.current.readyState !== WebSocket.CLOSING &&
        summarizerRef.current.readyState !== WebSocket.CLOSED
      ) {
        summarizerRef.current.close(1000, 'Client disconnecting')
      } else {
        // If ref is null or already closing/closed, just ensure ref is null
        summarizerRef.current = null
      }
      if (
        whisperRef.current &&
        whisperRef.current.readyState !== WebSocket.CLOSING &&
        whisperRef.current.readyState !== WebSocket.CLOSED
      ) {
        whisperRef.current.close(1000, 'Client disconnecting')
      } else {
        // If ref is null or already closing/closed, just ensure ref is null
        whisperRef.current = null
      }
      // IMPORTANT: Do NOT reset initializedRef.current here.
      // The initializedRef is meant to track if the *component instance* has initialized,
      // not if the *effect run* has finished. Resetting it here would defeat its purpose
      // in Strict Mode (the second effect run would see false again).
    }
    // --- Setup Logic ---
    // Use the initializedRef to ensure this block runs ONLY once per component instance
    if (!initializedRef.current) {
      initializedRef.current = true // Mark as initialized
      console.log('📍 Initializing WebSocket connections (first time for this instance)...')
      // Establish connections using the extracted function
      connectWebSocket({
        type: 'logs',
        ref: logsRef,
        dispatch: dispatchLogs,
        reconnectTimeoutRef: reconnectLogsTimeout,
        pingIntervalRef: logsPingInterval,
        socketSessionID,
        // Pass dummy values for summarizer-specific parameters if type is logs
        setSummarizerConnected: () => {},
        setSummarizerRetrying: () => {},
        summarizerRetryTimeout: { current: null }, // Provide a dummy ref
      })
      connectWebSocket({
        type: 'summarizer',
        ref: summarizerRef,
        dispatch: dispatchSummarizerLogs,
        reconnectTimeoutRef: reconnectSummarizerTimeout,
        pingIntervalRef: summarizerPingInterval,
        socketSessionID,
        // Pass actual values for summarizer
        setSummarizerConnected,
        setSummarizerRetrying,
        summarizerRetryTimeout,
      })
      connectWebSocket({
        type: 'whisper',
        ref: whisperRef,
        dispatch: dispatchWhisperLogs,
        reconnectTimeoutRef: reconnectWhisperTimeout,
        pingIntervalRef: whisperPingInterval,
        socketSessionID,
        // Pass dummy values for summarizer-specific parameters if type is whisper
        setSummarizerConnected: () => {},
        setSummarizerRetrying: () => {},
        summarizerRetryTimeout: { current: null }, // Provide a dummy ref
      })
    } else {
      // This block will be hit on the second effect run in Strict Mode development.
      // The initializedRef is true, so we skip the setup.
      // The cleanup function defined above is still returned and available
      // for potential future unmounts.
      console.log('⚡ WebSocket setup skipped (already initialized for this instance)')
    }
    // --- End Setup Logic ---
    // Return the cleanup function. This is returned regardless of whether the setup block ran
    // in this specific effect execution.
    return cleanup
    // We need to include dependencies that *could* change and affect the connection setup.
    // socketSessionID is stable due to useState initializer, so doesn't strictly need to be here.
    // WEBSOCKET_URL is a constant, doesn't need to be here.
    // State setters and ref objects are stable across renders, don't need to be here.
    // dispatch functions are stable across renders, don't need to be here.
    // The effect is designed to run *once* for setup and *once* for cleanup on unmount.
    // The initializedRef handles the Strict Mode double run.
    // An empty dependency array is appropriate here to ensure it only runs on mount/unmount.
  }, []) // Empty dependency array means this effect runs once on mount and cleans up on unmount.
  // The context value should pass the current state of the refs and logs
  return (
    <WebSocketContext.Provider
      value={{
        logsSocket: logsRef.current, // This will be null initially, then the WS instance
        summarizerSocket: summarizerRef.current, // This will be null initially, then the WS instance
        whisperSocket: whisperRef.current, // This will be null initially, then the WS instance
        logs,
        dispatchLogs,
        summarizerLogs,
        dispatchSummarizerLogs,
        whisperLogs,
        dispatchWhisperLogs,
        socketSessionID,
        summarizerConnected,
        summarizerRetrying,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
// Hook to consume the context
export const useWebSocket = () => useContext(WebSocketContext)
