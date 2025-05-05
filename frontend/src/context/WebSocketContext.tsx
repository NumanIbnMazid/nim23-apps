'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { WEBSOCKET_URL } from '@/lib/constants'

interface WebSocketContextType {
  logsSocket: WebSocket | null
  summarizerSocket: WebSocket | null
  logs: any | null
  summarizerLogs: any | null
  socketSessionID: string | null
}

const WebSocketContext = createContext<WebSocketContextType>({
  logsSocket: null,
  summarizerSocket: null,
  logs: null,
  summarizerLogs: null,
  socketSessionID: null,
})

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<any | null>(null)
  const [summarizerLogs, setSummarizerLogs] = useState<any | null>(null)
  const [socketSessionID] = useState(() => crypto.randomUUID()) // 🔑 sessionID is stable per tab

  const logsRef = useRef<WebSocket | null>(null)
  const summarizerRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let reconnectLogsTimeout: NodeJS.Timeout
    let reconnectSummarizerTimeout: NodeJS.Timeout

    let logsPingInterval: NodeJS.Timeout
    let summarizerPingInterval: NodeJS.Timeout

    const connectLogs = () => {
      const socketUrl = `${WEBSOCKET_URL}/ws/logs/?session_id=${socketSessionID}`
      const ws = new WebSocket(socketUrl)
      logsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'ready' }))

        // ⏱️ Ping every 25 seconds
        logsPingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000) // 25 seconds
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLogs(data)
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      }

      ws.onclose = (e) => {
        clearInterval(logsPingInterval)
        if (!e.wasClean) reconnectLogsTimeout = setTimeout(connectLogs, 1000)
      }

      ws.onerror = (err) => console.warn('🔴 Logs WS error:', err)
    }

    const connectSummarizer = () => {
      const socketUrl = `${WEBSOCKET_URL}/ws/summarizer/?session_id=${socketSessionID}`
      const ws = new WebSocket(socketUrl)
      summarizerRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'ready' }))

        // ⏱️ Ping every 25 seconds
        summarizerPingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 25000) // 25 seconds
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setSummarizerLogs(data)
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
        }
      }

      ws.onclose = (e) => {
        clearInterval(summarizerPingInterval)
        if (!e.wasClean) reconnectSummarizerTimeout = setTimeout(connectSummarizer, 1000)
      }

      ws.onerror = (err) => console.warn('🔴 Summarizer WS error:', err)
    }

    connectLogs()
    connectSummarizer()

    return () => {
      logsRef.current?.close()
      summarizerRef.current?.close()
      clearTimeout(reconnectLogsTimeout)
      clearTimeout(reconnectSummarizerTimeout)
      clearInterval(logsPingInterval)
      clearInterval(summarizerPingInterval)
    }
  }, [socketSessionID])

  return (
    <WebSocketContext.Provider
      value={{
        logsSocket: logsRef.current,
        summarizerSocket: summarizerRef.current,
        logs,
        summarizerLogs,
        socketSessionID,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)
