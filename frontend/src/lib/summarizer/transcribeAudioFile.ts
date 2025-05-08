import { convertAudioFileToBase64 } from './convertAudioFileToBase64'

const MAX_AUDIO_DURATION_SEC = 300 // 5 minutes

export const transcribeAudioFile = async (
  audioFile: string,
  ffmpeg: any,
  transcribeAudioBase64: any,
  setStatusMessage: (msg: string) => void,
  setWhisperTranscription: (text: string) => void,
  summarizerSocket: WebSocket | null
): Promise<string> => {
  const outputName = 'output.wav'
  const chunkPrefix = 'chunk'
  const segmentTime = MAX_AUDIO_DURATION_SEC.toString()

  setStatusMessage('# Converting audio to WAV (mono, 16kHz)...')

  const stderrLogs: string[] = []
  ffmpeg.on('log', ({ message }: { message: string }) => {
    stderrLogs.push(message)
  })
  // Convert input audio to WAV format expected by Whisper
  await ffmpeg.exec(['-i', audioFile, '-ac', '1', '-ar', '16000', outputName])

  const logText = stderrLogs.join('\n')
  // Extract duration from FFmpeg logs
  const durationMatch = logText.match(/Duration: (\d+):(\d+):([\d.]+)/)
  let durationSeconds = 0
  if (durationMatch) {
    const [, h, m, s] = durationMatch
    durationSeconds = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
  }

  if (durationSeconds <= MAX_AUDIO_DURATION_SEC) {
    const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array
    const base64 = convertAudioFileToBase64(outputData)
    setStatusMessage('# Transcribing audio...')
    const text = await transcribeAudioBase64(base64, setWhisperTranscription)
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
    return text
  }

  // Split long audio into chunks
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

  const filesAfterSplit = await ffmpeg.listDir('/')
  const chunkFiles = filesAfterSplit.filter(
    (file: { name: string }) => file.name.startsWith(chunkPrefix) && file.name.endsWith('.wav')
  )

  let allText = ''
  let index = 0
  let currentStartTime = 0 // start time in seconds for each chunk

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const chunkName = `${chunkPrefix}_${String(index).padStart(3, '0')}.wav`
    const exists = filesAfterSplit.some((file: { name: string }) => file.name === chunkName)
    if (!exists) {
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
      break
    }

    const stderrTimingLogs: string[] = []
    ffmpeg.on('log', ({ message }: { message: string }) => {
      stderrTimingLogs.push(message)
    })

    // Run to get duration
    await ffmpeg.exec(['-i', chunkName, '-f', 'null', '-'])

    // Extract duration from stderr logs
    const logText = stderrTimingLogs.join('\n')
    const durationMatch = logText.match(/Duration: (\d+):(\d+):([\d.]+)/)
    let chunkDuration = 0
    if (durationMatch) {
      const [, h, m, s] = durationMatch
      chunkDuration = parseInt(h) * 3600 + parseInt(m) * 60 + parseFloat(s)
    }

    const chunkData = (await ffmpeg.readFile(chunkName)) as Uint8Array
    const base64 = convertAudioFileToBase64(chunkData)

    setStatusMessage(`# Transcribing chunk ${index + 1}...`)

    const chunkText = await transcribeAudioBase64(
      base64,
      setWhisperTranscription,
      chunkFiles.length,
      index,

      currentStartTime
    )

    allText += chunkText + '\n\n'
    currentStartTime += chunkDuration
    index++
  }

  return allText.trim()
}
