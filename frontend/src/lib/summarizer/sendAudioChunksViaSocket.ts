/**
 * Split base64 string into audio chunks and send over WebSocket.
 */
export const sendAudioChunksViaSocket = async (
  fullBase64: string,
  summarizerSocket: any,
  chunkSize: number = 1,
  currentChunkIndex: number = 0,
  // chunkDurationSec: number = 5,
  currentStartTime: number = 0,
  chunkID: string
) => {
  if (!summarizerSocket || summarizerSocket.readyState !== WebSocket.OPEN) {
    console.error('🔴 [Summarizer] WebSocket is not connected')
    throw new Error('🔴 [Summarizer] WebSocket is not connected!')
  }

  // Approximate byte size of 5s audio (e.g. 16kbps mono ≈ 10KB/sec → 50KB base64)
  // const bytesPerSecond = 16000 // adjust based on audio encoding bitrate
  // const estimatedChunkBytes = bytesPerSecond * chunkDurationSec
  // const base64ChunkSize = (estimatedChunkBytes * 4) / 3 // base64 expands 3:4

  // const chunks = fullBase64.match(new RegExp(`.{1,${Math.floor(base64ChunkSize)}}`, 'g')) || []
  const chunks = [fullBase64]

  // log full base64 size and chunk size
  // console.log('🔊 [Summarizer] Full base64 size:', fullBase64.length)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    // console.log(`🔊 [Summarizer] Sending chunk ${currentChunkIndex + 1} of ${chunkSize}...`)
    // console.log(`🔊 start_offset ${currentStartTime}...`);
    
    summarizerSocket.send(
      JSON.stringify({
        type: 'datastream',
        message: {
          type: 'data',
          module: 'summarizer',
          scope: 'audio_chunk',
          message: chunk,
          sender: 'client',
          chunk_index: currentChunkIndex,
          is_last: currentChunkIndex === chunkSize - 1,
          total_length: chunkSize,
          start_offset: currentStartTime,
          chunk_id: chunkID,
        },
      })
    )

    // Optional: add delay to simulate real-time upload (for testing)
    // await new Promise((resolve) => setTimeout(resolve, 200))
  }
}
