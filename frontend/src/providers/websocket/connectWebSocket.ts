import React from 'react'
import { WEBSOCKET_URL } from '@/lib/constants'
import { SocketLogType } from './types' // Import SocketLogType
interface ConnectWebSocketParams {
  type: 'logs' | 'summarizer'
  ref: React.RefObject<WebSocket | null>
  dispatch: React.Dispatch<{ type: 'add'; payload: SocketLogType }>
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>
  pingIntervalRef: React.RefObject<NodeJS.Timeout | undefined>
  socketSessionID: string | null
  // State setters/refs needed specifically by the summarizer logic within the function
  setSummarizerConnected: React.Dispatch<React.SetStateAction<boolean>>
  setSummarizerRetrying: React.Dispatch<React.SetStateAction<boolean>>
  summarizerRetryTimeout: React.MutableRefObject<NodeJS.Timeout | null>
}
// Function to establish a single WebSocket connection
export const connectWebSocket = ({
  type,
  ref,
  dispatch,
  reconnectTimeoutRef,
  pingIntervalRef,
  socketSessionID,
  setSummarizerConnected,
  setSummarizerRetrying,
  summarizerRetryTimeout,
}: ConnectWebSocketParams) => {
  // Prevent connecting if a connection already exists in the ref and is open
  // This check helps prevent redundant connections if the effect re-runs
  // for reasons other than the initial mount or cleanup. While the initializedRef
  // (used in the effect) handles the Strict Mode double mount specifically, this adds robustness.
  if (ref.current && ref.current.readyState === WebSocket.OPEN) {
    console.log(`[${type.toUpperCase()}] WebSocket already open, skipping connection.`)
    return
  }
  // Also clear any pending reconnect timeout if we are about to connect
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current)
    reconnectTimeoutRef.current = undefined
  }
  // Ensure socketSessionID is available before connecting
  if (!socketSessionID) {
    console.error(`❌ Cannot connect ${type.toUpperCase()} WebSocket: session ID is null.`)
    // Maybe attempt to get a session ID or handle this case appropriately
    // For now, we'll just log and return to prevent connecting without it.
    return
  }
  const socketUrl = `${WEBSOCKET_URL}/ws/${type}/?session_id=${socketSessionID}`
  const ws = new WebSocket(socketUrl)
  ref.current = ws // Assign the new socket instance to the ref
  ws.onopen = () => {
    console.log(`🟢 [${type.toUpperCase()}] WebSocket connected`)
    ws.send(JSON.stringify({ type: 'ready' }))
    if (type === 'summarizer') {
      setSummarizerConnected(true)
      setSummarizerRetrying(false)
      if (summarizerRetryTimeout.current) {
        clearTimeout(summarizerRetryTimeout.current)
        summarizerRetryTimeout.current = null
      }
    }
    // Start ping interval
    // Clear any existing interval before starting a new one
    // if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
    // pingIntervalRef.current = setInterval(() => {
    //   if (ws.readyState === WebSocket.OPEN) {
    //     ws.send(JSON.stringify({ type: 'ping' }))
    //   } else {
    //     // If socket is not open, clear interval to prevent errors
    //     clearInterval(pingIntervalRef.current)
    //     pingIntervalRef.current = undefined
    //   }
    // }, 25000) // Send ping every 25 seconds
  }
  ws.onmessage = (event) => {
    try {
      const data: SocketLogType = JSON.parse(event.data)
      // if (data.type === 'ping' || data.type === 'pong') {
      //   if (data.type === 'ping' && ws.readyState === WebSocket.OPEN) {
      //     ws.send(JSON.stringify({ type: 'pong' })) // Respond to server ping
      //   }
      //   // Do NOT dispatch ping/pong messages as logs
      //   return
      // }
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
    // # TODO: Uncomment this if you want to handle reconnects on unclean closures (For testing)
    // if (!e.wasClean || e.code !== 9999) {
    if (!e.wasClean && e.code !== 1000) {
      console.log(`🛠 Attempting to reconnect ${type.toUpperCase()} WebSocket...`)
      if (type === 'summarizer') {
        setSummarizerConnected(false)
        setSummarizerRetrying(true)
        if (summarizerRetryTimeout.current) clearTimeout(summarizerRetryTimeout.current)
        summarizerRetryTimeout.current = setTimeout(() => {
          setSummarizerRetrying(false) // show fallback banner
        }, 10000) // Show fallback after 10s
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        // Call the connect function again with the same parameters for reconnect
        connectWebSocket({
          type,
          ref,
          dispatch,
          reconnectTimeoutRef,
          pingIntervalRef,
          socketSessionID,
          setSummarizerConnected,
          setSummarizerRetrying,
          summarizerRetryTimeout,
        })
      }, 1000)
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
