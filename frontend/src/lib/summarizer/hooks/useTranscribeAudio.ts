import { useWebSocket } from '@/context/WebSocketContext'
import { sendAudioChunksViaSocket } from '@/lib/summarizer/sendAudioChunksViaSocket'

export const useTranscribeAudio = () => {
  const { summarizerSocket } = useWebSocket()

  const transcribeAudioBase64 = async (
    audioBase64: string,
    setWhisperTranscription: (text: string) => void
  ): Promise<string> => {
    if (!summarizerSocket || summarizerSocket.readyState !== WebSocket.OPEN) {
      throw new Error('🔴 [Summarizer] WebSocket is not connected')
    }

    await sendAudioChunksViaSocket(audioBase64, summarizerSocket, 5)

    return new Promise<string>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (
          data?.type === 'datastream' &&
          data?.message?.module === 'summarizer' &&
          data?.message?.sender === 'server' &&
          data?.message?.type === 'transcription_result' &&
          data?.message?.scope === 'full_transcription'
        ) {
          const transcription = data.message?.message || ''
          setWhisperTranscription(transcription)
          summarizerSocket.removeEventListener('message', onMessage)
          resolve(transcription)
        }
      }
      summarizerSocket.addEventListener('message', onMessage)
    })
  }

  return { transcribeAudioBase64 }
}
