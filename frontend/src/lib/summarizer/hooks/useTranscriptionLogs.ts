// useTranscriptionLogs.ts
import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '@/context/WebSocketContext'

let globalReset: (() => void) | null = null

export const useTranscriptionLogs = () => {
  const [transcriptionTimeline, setTranscriptionTimeline] = useState('')
  const lastLogRef = useRef<string>('')

  const { logs } = useWebSocket()

  useEffect(() => {
    globalReset = () => {
      lastLogRef.current = ''
      setTranscriptionTimeline('')
    }
  }, [])

  useEffect(() => {
    if (
      logs &&
      logs?.message?.type === 'event' &&
      logs?.message?.module === 'summarizer' &&
      logs?.message?.scope === 'whisper'
    ) {
      const newLine = logs.message.message.trim()
      if (newLine !== lastLogRef.current) {
        lastLogRef.current = newLine
        setTranscriptionTimeline((prev) => (prev ? `${prev}\n${newLine}` : newLine))
      }
    }
  }, [logs])

  return transcriptionTimeline
}

export const resetTranscriptionLogs = () => {
  if (globalReset) globalReset()
}
