import { useEffect, useRef, useState } from 'react'
import { useWebSocket } from '@/context/WebSocketContext'
import { sendAudioChunksViaSocket } from '@/lib/summarizer/sendAudioChunksViaSocket'

export const useTranscribeAudio = () => {
  const { summarizerSocket, summarizerLogs } = useWebSocket()
  const [isWaiting, setIsWaiting] = useState(false)
  const resolveRef = useRef<(value: string) => void>(undefined)
  const setTranscriptionRef = useRef<(text: string) => void>(undefined)

  useEffect(() => {
    if (
      !isWaiting ||
      !summarizerLogs ||
      summarizerLogs?.type !== 'datastream' ||
      summarizerLogs?.message?.module !== 'summarizer' ||
      summarizerLogs?.message?.sender !== 'server' ||
      summarizerLogs?.message?.type !== 'transcription_result' ||
      summarizerLogs?.message?.scope !== 'full_transcription'
    ) {
      return
    }

    const transcription = summarizerLogs.message?.message || ''
    setTranscriptionRef.current?.(transcription)
    resolveRef.current?.(transcription)

    // Clear references
    resolveRef.current = undefined
    setTranscriptionRef.current = undefined
    setIsWaiting(false)
  }, [summarizerLogs, isWaiting])

  const transcribeAudioBase64 = async (
    audioBase64: string,
    setWhisperTranscription: (text: string) => void
  ): Promise<string> => {
    if (!summarizerSocket || summarizerSocket.readyState !== WebSocket.OPEN) {
      throw new Error('🔴 [Summarizer] WebSocket is not connected')
    }

    await sendAudioChunksViaSocket(audioBase64, summarizerSocket, 5)

    return new Promise<string>((resolve) => {
      resolveRef.current = resolve
      setTranscriptionRef.current = setWhisperTranscription
      setIsWaiting(true)
    })
  }

  return { transcribeAudioBase64 }
}
