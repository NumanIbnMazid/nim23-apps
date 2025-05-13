import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '@/providers/WebSocketProvider'

let signalTimelineReset: (() => void) | null = null

export const useTranscriptionLogs = () => {
  const [transcriptionTimeline, setTranscriptionTimeline] = useState('')
  const { whisperLogs, dispatchWhisperLogs } = useWebSocket()
  const lastProcessedId = useRef<string | null>(null)  

  useEffect(() => {
    signalTimelineReset = () => {
      lastProcessedId.current = whisperLogs.at(-1)?.id ?? null
      setTranscriptionTimeline('')
    }
    return () => {
      signalTimelineReset = null
    }
  }, [whisperLogs])

  useEffect(() => {
    const newLogs = lastProcessedId.current
      ? whisperLogs.slice(whisperLogs.findIndex((log) => log.id === lastProcessedId.current) + 1)
      : whisperLogs

    if (newLogs.length === 0) return

    const newLines: string[] = []
    newLogs.forEach((log: any) => {
      if (
        log?.message?.type === 'event' &&
        log.message.module === 'whisper_api' &&
        log.message.scope === 'whisper' &&
        typeof log.message.message === 'string'
      ) {
        const newLine = log.message.message.trim()
        if (newLine) {
          newLines.push(newLine)
        }
      }
    })

    if (newLines.length > 0) {
      setTranscriptionTimeline((prev) => {
        const prevLines = prev ? prev.split('\n') : []
        const indexedLines = newLines.map((line, i) => {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const index = prevLines.length + i + 1
          return `${line}`
        })
        return prev ? `${prev}\n${indexedLines.join('\n')}` : indexedLines.join('\n')
      })
    }

    // Update last processed id
    const last = newLogs.at(-1)
    if (last?.id) {
      lastProcessedId.current = last.id
      dispatchWhisperLogs?.({ type: 'clearProcessed', payload: { lastProcessedId: last.id } })
    }
  }, [whisperLogs])

  return transcriptionTimeline
}

export const resetTranscriptionLogs = () => {
  if (signalTimelineReset) signalTimelineReset()
}
