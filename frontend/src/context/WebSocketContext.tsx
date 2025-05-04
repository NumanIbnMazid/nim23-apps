'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { WEBSOCKET_URL } from '@/lib/constants'

interface WebSocketContextType {
  logsSocket: WebSocket | null
  summarizerSocket: WebSocket | null
  logs: any | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  logsSocket: null,
  summarizerSocket: null,
  logs: null,
})

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<any | null>(null)
  const logsRef = useRef<WebSocket | null>(null)
  const summarizerRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let reconnectLogsTimeout: NodeJS.Timeout
    let reconnectSummarizerTimeout: NodeJS.Timeout

    const connectLogs = () => {
      const socketUrl = `${WEBSOCKET_URL}/ws/logs/`
      const ws = new WebSocket(socketUrl)
      logsRef.current = ws

      ws.onopen = () => ws.send(JSON.stringify({ type: 'ready' }))
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLogs(data)
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      }
      ws.onclose = (e) => {
        if (!e.wasClean) reconnectLogsTimeout = setTimeout(connectLogs, 1000)
      }
      ws.onerror = (err) => console.warn('🔴 Logs WS error:', err)
    }

    const connectSummarizer = () => {
      const socketUrl = `${WEBSOCKET_URL}/ws/summarizer/`
      const ws = new WebSocket(socketUrl)
      summarizerRef.current = ws

      ws.onopen = () => console.log('✅ Summarizer WebSocket connected')
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📩 Summarizer message:', data)
        // Optional: you can route this to local state or events
      }
      ws.onclose = (e) => {
        if (!e.wasClean) reconnectSummarizerTimeout = setTimeout(connectSummarizer, 1000)
      }
      ws.onerror = (err) => console.warn('🔴 Summarizer WS error:', err)
    }

    connectLogs()
    connectSummarizer()

    return () => {
      logsRef.current?.close()
      summarizerRef.current?.close()
      if (reconnectLogsTimeout) clearTimeout(reconnectLogsTimeout)
      if (reconnectSummarizerTimeout) clearTimeout(reconnectSummarizerTimeout)
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ logsSocket: logsRef.current, summarizerSocket: summarizerRef.current, logs }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)
