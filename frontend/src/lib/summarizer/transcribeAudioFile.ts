import { convertAudioFileToBase64 } from './convertAudioFileToBase64'
// Assuming useTranscribeAudio is imported correctly elsewhere and its transcribeAudioBase64 function is passed in
// import { useTranscribeAudio } from './useTranscribeAudio'; // If not passed as arg

const MAX_AUDIO_DURATION_SEC = 180 // 3 minutes

export const transcribeAudioFile = async (
  audioFile: string,
  ffmpeg: any,
  transcribeAudioBase64: any, // Now expects only chunk text return
  setStatusMessage: (msg: string) => void,
  setWhisperTranscription: (text: string) => void, // This will update the cumulative text
  summarizerSocket: WebSocket | null
): Promise<string> => {
  const outputName = 'output.wav'
  const chunkPrefix = 'chunk'
  const segmentTime = MAX_AUDIO_DURATION_SEC.toString()

  setStatusMessage('# Converting audio to WAV (mono, 16kHz)...')

  const stderrLogs: string[] = []
  // Need to re-register log listener or handle it differently if ffmpeg instance is reused
  // Or clear the logs before each exec if needed, but getting duration is the main use here
  ffmpeg.on('log', ({ message }: { message: string }) => {
    stderrLogs.push(message)
  })

  // Clear previous logs for new duration calculation
  stderrLogs.length = 0 // Clear array before first exec

  // Convert input audio to WAV format expected by Whisper
  try {
    await ffmpeg.exec(['-i', audioFile, '-ac', '1', '-ar', '16000', outputName])
  } catch (error) {
    console.error('FFmpeg conversion failed:', error)
    setStatusMessage('🔴 FFmpeg conversion failed.')
    throw error // Re-throw to stop execution
  }

  const logText = stderrLogs.join('\n')
  // Extract duration from FFmpeg logs
  const durationMatch = logText.match(/Duration: (\d+):(\d+):([\d.]+)/)
  let durationSeconds = 0
  if (durationMatch) {
    const [, h, m, s] = durationMatch
    durationSeconds = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
  } else {
    console.warn('🔴 Could not extract duration from FFmpeg logs:', logText)
    // Handle case where duration cannot be determined - potentially proceed assuming it's short or use a default
    // For robustness, you might add error handling or estimation here
  }

  let allText = '' // Accumulator for full text

  if (durationSeconds > 0 && durationSeconds <= MAX_AUDIO_DURATION_SEC) {
    // Also check duration > 0
    const chunkID = crypto.randomUUID()
    const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array
    const base64 = convertAudioFileToBase64(outputData)
    setStatusMessage('# Transcribing audio...')

    // Call transcribeAudioBase64 for the whole file (as one chunk)
    const text = await transcribeAudioBase64(base64, 1, 0, 0, chunkID, setStatusMessage) // Use totalChunks=1, index=0, startTime=0

    allText = text // For short files, allText is just the single result
    setWhisperTranscription(allText) // Update UI with final text immediately

    // Send END_CHUNK signal AFTER successful processing
    summarizerSocket?.send(
      JSON.stringify({
        type: 'datastream',
        message: {
          type: 'signal',
          module: 'summarizer',
          scope: 'audio_chunk', // Or perhaps a more general 'audio_processing' scope?
          message: 'END_CHUNK',
          sender: 'client',
        },
      })
    )
    return allText // Return final text
  } else if (durationSeconds === 0 || durationSeconds > MAX_AUDIO_DURATION_SEC) {
    // Proceed to chunking if long or duration unknown/zero
    // Split long audio into chunks
    setStatusMessage(`# Audio too long (${durationSeconds.toFixed(1)}s), splitting into ${segmentTime}s chunks...`)

    // Clear logs for the splitting exec
    stderrLogs.length = 0
    try {
      await ffmpeg.exec([
        '-i',
        outputName,
        '-f',
        'segment',
        '-segment_time',
        segmentTime,
        '-c:a',
        'pcm_s16le',
        '-ar',
        '16000',
        '-ac',
        '1',
        `${chunkPrefix}_%03d.wav`,
      ])
    } catch (error) {
      console.error('FFmpeg splitting failed:', error)
      setStatusMessage('🔴 FFmpeg splitting failed.')
      throw error // Re-throw to stop execution
    }

    const filesAfterSplit = await ffmpeg.listDir('/')
    const chunkFiles = filesAfterSplit
      .filter((file: { name: string }) => file.name.startsWith(chunkPrefix) && file.name.endsWith('.wav'))
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)) // Sort files correctly

    if (chunkFiles.length === 0) {
      console.error('FFmpeg splitting failed - no chunks created.')
      setStatusMessage('🔴 FFmpeg splitting failed - no chunks created.')
      // Send END_CHUNK even if no chunks? Depends on desired behavior.
      summarizerSocket?.send(
        JSON.stringify({
          type: 'datastream',
          message: {
            type: 'signal',
            module: 'summarizer',
            scope: 'audio_chunk',
            message: 'END_CHUNK',
            sender: 'client',
          },
        })
      )
      return '' // Return empty or throw error
    }

    let index = 0
    let currentStartTime = 0 // start time in seconds for each chunk

    // Use chunkFiles.length to loop explicitly
    while (index < chunkFiles.length) {
      const chunkID = crypto.randomUUID()
      const chunkFile = chunkFiles[index]
      const chunkName = chunkFile.name // Use the name from the sorted list

      // --- Get chunk duration (optional but good for timing) ---
      // Clear logs for the duration exec
      stderrLogs.length = 0
      let chunkDuration = parseFloat(segmentTime) // Default to segment time if duration extraction fails

      try {
        // Run FFmpeg exec to get duration for the current chunk
        // Use '-f null -' to avoid creating an output file, just get info
        await ffmpeg.exec(['-i', chunkName, '-f', 'null', '-'])

        // Extract duration from stderr logs for THIS exec
        const chunkLogText = stderrLogs.join('\n')
        const chunkDurationMatch = chunkLogText.match(/Duration: (\d+):(\d+):([\d.]+)/)
        if (chunkDurationMatch) {
          const [, h, m, s] = chunkDurationMatch
          chunkDuration = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
        } else {
          console.warn(`Could not extract duration for chunk ${chunkName}, using segment time ${segmentTime}s.`)
        }
      } catch (error) {
        console.warn(`FFmpeg duration check failed for chunk ${chunkName}:`, error)
        // Keep default chunkDuration = parseFloat(segmentTime)
      }
      // ----------------------------------------------------------

      try {
        const chunkData = (await ffmpeg.readFile(chunkName)) as Uint8Array
        const base64 = convertAudioFileToBase64(chunkData)

        setStatusMessage(`# Transcribing chunk ${index + 1}/${chunkFiles.length}...`)

        // Call transcribeAudioBase64 for the current chunk
        const chunkText = await transcribeAudioBase64(
          base64,
          chunkFiles.length, // totalChunks
          index, // currentChunkIndex
          currentStartTime, // currentStartTime
          chunkID,
          setStatusMessage
        )

        allText += chunkText + ' ' // Append chunk text with space
        setWhisperTranscription(allText) // Update UI with cumulative text *after each chunk*

        // console.log(`🔊 [Summarizer] Transcribed chunk ${index + 1}: ${chunkText.substring(0, 100)}...`) // Log snippet

        currentStartTime += chunkDuration // Update start time for the next chunk
        index++

        // You might want a small delay here between sending chunks to avoid overwhelming the backend
        // await new Promise(resolve => setTimeout(resolve, 100)); // Optional delay
      } catch (error) {
        console.error(`🔴 Error processing or transcribing chunk ${index + 1}:`, error)
        // Decide how to handle a chunk error: skip it, stop, etc.
        // For now, we'll append an error message and continue
        allText += `[Error transcribing chunk ${index + 1}]\n\n`
        setWhisperTranscription(allText)
        currentStartTime += chunkDuration // Still update time
        index++ // Still move to next chunk
      }
    }

    // Send END_CHUNK signal AFTER the loop finishes (all chunks processed or attempted)
    setStatusMessage('# Transcription complete. Finalizing...')
    summarizerSocket?.send(
      JSON.stringify({
        type: 'datastream',
        message: {
          type: 'signal',
          module: 'summarizer',
          scope: 'audio_chunk', // Or general 'audio_processing'
          message: 'END_CHUNK',
          sender: 'client',
        },
      })
    )

    return allText.trim() // Return final combined text
  } else {
    // Handle case where durationSeconds is 0 or negative unexpectedly
    console.error('Invalid audio duration obtained:', durationSeconds)
    setStatusMessage('🔴 Could not process audio file.')
    summarizerSocket?.send(
      // Send END_CHUNK even on error? Depends on backend
      JSON.stringify({
        type: 'datastream',
        message: {
          type: 'signal',
          module: 'summarizer',
          scope: 'audio_chunk',
          message: 'END_CHUNK',
          sender: 'client',
        },
      })
    )
    throw new Error('🔴 Invalid audio duration.') // Stop processing
  }
}
