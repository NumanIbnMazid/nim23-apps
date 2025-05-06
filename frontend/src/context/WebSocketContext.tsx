'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useReducer } from 'react'
import { WEBSOCKET_URL } from '@/lib/constants'

// Types
export interface LogType {
  type: string
  message: any
  [key: string]: any
}

interface WebSocketContextType {
  logsSocket: WebSocket | null
  summarizerSocket: WebSocket | null
  logs: LogType[]
  summarizerLogs: LogType[]
  socketSessionID: string | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  logsSocket: null,
  summarizerSocket: null,
  logs: [],
  summarizerLogs: [],
  socketSessionID: null,
})

// Reducers remain the same
const logReducer = (state: LogType[], action: { type: 'add'; payload: LogType }) => {
  if (action.type === 'add') {
    return [...state, action.payload]
  }
  return state
}

const summarizerLogReducer = (state: LogType[], action: { type: 'add'; payload: LogType }) => {
  if (action.type === 'add') {
    return [...state, action.payload]
  }
  return state
}

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, dispatchLogs] = useReducer(logReducer, [])
  const [summarizerLogs, dispatchSummarizerLogs] = useReducer(summarizerLogReducer, [])
  // Keep the session ID state
  const [socketSessionID] = useState(() => crypto.randomUUID())

  // Use refs to hold the WebSocket instances (standard practice)
  const logsRef = useRef<WebSocket | null>(null)
  const summarizerRef = useRef<WebSocket | null>(null)

  // Refs for managing timeouts and intervals (standard practice)
  const reconnectLogsTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const reconnectSummarizerTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const logsPingInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const summarizerPingInterval = useRef<NodeJS.Timeout | undefined>(undefined)

  // *** NEW: Ref to track if initialization has occurred for this component instance ***
  // This ref persists across renders and its value is not affected by Strict Mode's
  // double effect runs on mount, allowing us to track if the setup logic
  // has executed at least once for this instance.
  const initializedRef = useRef(false)

  // Function to establish a single WebSocket connection (remains mostly the same)
  const connectWebSocket = (
    type: 'logs' | 'summarizer',
    ref: React.RefObject<WebSocket | null>,
    dispatch: React.Dispatch<{ type: 'add'; payload: LogType }>,
    reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>,
    pingIntervalRef: React.RefObject<NodeJS.Timeout | undefined>
  ) => {
    // Prevent connecting if a connection already exists in the ref and is open
    // This check helps prevent redundant connections if the effect re-runs
    // for reasons other than the initial mount or cleanup. While the initializedRef
    // handles the Strict Mode double mount specifically, this adds robustness.
    if (ref.current && ref.current.readyState === WebSocket.OPEN) {
      console.log(`[${type.toUpperCase()}] WebSocket already open, skipping connection.`)
      return
    }
    // Also clear any pending reconnect timeout if we are about to connect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = undefined
    }

    const socketUrl = `${WEBSOCKET_URL}/ws/${type}/?session_id=${socketSessionID}`
    const ws = new WebSocket(socketUrl)
    ref.current = ws // Assign the new socket instance to the ref

    ws.onopen = () => {
      console.log(`🟢 [${type.toUpperCase()}] WebSocket connected`)
      ws.send(JSON.stringify({ type: 'ready' }))

      // Start ping interval
      // Clear any existing interval before starting a new one
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        } else {
          // If socket is not open, clear interval to prevent errors
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = undefined
        }
      }, 25000) // Send ping every 25 seconds
    }

    ws.onmessage = (event) => {
      try {
        const data: LogType = JSON.parse(event.data)
        if (data.type === 'ping' || data.type === 'pong') {
          if (data.type === 'ping' && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' })) // Respond to server ping
          }
          // Do NOT dispatch ping/pong messages as logs
          return
        }
        dispatch({ type: 'add', payload: data })
      } catch (error) {
        console.error(`🔴 Failed to parse ${type.toUpperCase()} WebSocket message:`, error, event.data)
      }
    }

    ws.onclose = (e) => {
      console.warn(`🔴 [${type.toUpperCase()}] WebSocket disconnected (code: ${e.code}, clean: ${e.wasClean})`)
      // Clear the ping interval associated with this socket
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = undefined

      // Nullify the ref ONLY if it still holds THIS specific WebSocket instance
      // This is important if a new connection was attempted before the old one fully closed
      if (ref.current === ws) {
        ref.current = null
      }

      // Attempt reconnect if the close was not clean and not client-initiated clean closure (1000)
      // Check if the component is still mounted (optional, but good practice - requires another ref)
      // For simplicity here, we rely on the cleanup effect to stop reconnects on unmount.
      if (!e.wasClean && e.code !== 1000) {
        // Clear any existing reconnect timeout for this socket type before setting a new one
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)

        console.log(`🛠 Attempting to reconnect ${type.toUpperCase()} WebSocket in 1 second...`)
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(type, ref, dispatch, reconnectTimeoutRef, pingIntervalRef)
        }, 1000) // Reconnect after 1 second
      } else {
        console.log(`[${type.toUpperCase()}] No reconnect attempt after clean close or error.`)
      }
    }

    ws.onerror = (err) => {
      console.error(`❌ [${type.toUpperCase()}] WebSocket error:`, err)
      // Errors typically precede a close event, the onclose handler will manage cleanup and reconnect attempts
      // Calling close here might trigger the onclose handler if it hasn't fired yet.
      // Use the specific socket instance's close method
      ws.close()
    }
  }

  // Effect for managing connections
  useEffect(() => {
    // --- Define Cleanup Logic ---
    // This cleanup function will run on unmount, or between runs in Strict Mode development
    const cleanup = () => {
      console.log('Cleaning up WebSocket connections...')

      // Clear any pending reconnect timeouts
      if (reconnectLogsTimeout.current) {
        clearTimeout(reconnectLogsTimeout.current)
        reconnectLogsTimeout.current = undefined
      }
      if (reconnectSummarizerTimeout.current) {
        clearTimeout(reconnectSummarizerTimeout.current)
        reconnectSummarizerTimeout.current = undefined
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

      // IMPORTANT: Do NOT reset initializedRef.current here.
      // The initializedRef is meant to track if the *component instance* has initialized,
      // not if the *effect run* has finished. Resetting it here would defeat its purpose
      // in Strict Mode (the second effect run would see false again).
    }

    // --- Setup Logic ---
    // Use the initializedRef to ensure this block runs ONLY once per component instance
    if (!initializedRef.current) {
      initializedRef.current = true // Mark as initialized
      console.log('Initializing WebSocket connections (first time for this instance)...')

      // Establish connections
      connectWebSocket('logs', logsRef, dispatchLogs, reconnectLogsTimeout, logsPingInterval)
      connectWebSocket(
        'summarizer',
        summarizerRef,
        dispatchSummarizerLogs,
        reconnectSummarizerTimeout,
        summarizerPingInterval
      )
    } else {
      // This block will be hit on the second effect run in Strict Mode development.
      // The initializedRef is true, so we skip the setup.
      // The cleanup function defined above is still returned and available
      // for potential future unmounts.
      console.log('WebSocket setup skipped (already initialized for this instance)')
    }
    // --- End Setup Logic ---

    // Return the cleanup function. This is returned regardless of whether the setup block ran
    // in this specific effect execution.
    return cleanup
  }, [socketSessionID]) // Depend on socketSessionID if it could theoretically change,
  // otherwise an empty dependency array `[]` is correct if the connections
  // should only be established once per component mount. Given socketSessionID
  // is generated once with useState, `[]` is appropriate. If `WEBSOCKET_URL`
  // could change during the component's life, add it too. Let's assume `[]` for now
  // as socketSessionID doesn't change after initial render.

  // Update: Keeping socketSessionID in dependency array is harmless if it truly doesn't change.
  // It ensures the effect doesn't complain about missing deps if you enable exhaustive-deps lint rule.
  // The `initializedRef` prevents the double connection issue anyway.
  // So, let's keep `[socketSessionID]`.

  // The context value should pass the current state of the refs and logs
  return (
    <WebSocketContext.Provider
      value={{
        logsSocket: logsRef.current, // This will be null initially, then the WS instance
        summarizerSocket: summarizerRef.current, // This will be null initially, then the WS instance
        logs,
        summarizerLogs,
        socketSessionID,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

// Hook to consume the context
export const useWebSocket = () => useContext(WebSocketContext)
