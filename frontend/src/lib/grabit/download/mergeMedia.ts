interface MergeMediaParams {
  videoData: Uint8Array | null
  audioData: Uint8Array
  mediaType: string
  audioExt: string
  videoExt: string
  title: string
  outputFormat: string
  ffmpeg: any
  setStatus: (msg: string) => void
  setProgress: (n: number) => void
}

export const mergeMedia = async ({
  videoData,
  audioData,
  mediaType,
  audioExt,
  videoExt,
  title,
  outputFormat,
  ffmpeg,
  setStatus,
  setProgress
}: MergeMediaParams): Promise<{ buffer: Uint8Array; filename: string }> => {
  // ======= Hard Part ========

  setStatus('Writing files.....')

  const writePromises = []
  writePromises.push(ffmpeg.writeFile(`audio.${audioExt}`, audioData))
  if (mediaType === 'video') {
    writePromises.push(ffmpeg.writeFile(`video.${videoExt}`, videoData))
  }
  await Promise.all(writePromises)

  setProgress(97)

  const outputFile = `output.${outputFormat}`

  setStatus('Preparing video and audio....')

  // FFmpeg command depends on media type
  const ffmpegArgs =
    mediaType === 'video'
      ? [
          '-i',
          `video.${videoExt}`,
          '-i',
          `audio.${audioExt}`,
          '-c:v',
          'copy',
          '-c:a',
          'copy',
          '-strict',
          'experimental',
          outputFile,
        ]
      : ['-i', `audio.${audioExt}`, '-c:a', 'mp3', '-strict', 'experimental', outputFile] // For audio, no video input

  await ffmpeg.exec(ffmpegArgs)

  setStatus('File is ready....')

  const buffer = (await ffmpeg.readFile(outputFile)) as any

  setProgress(99)

  // ffmpeg.FS('unlink', outputFile)
  // ffmpeg.FS('unlink', `audio.${audioExt}`)
  // if (mediaType === 'video') ffmpeg.FS('unlink', `video.${videoExt}`)

  return {
    buffer,
    filename: `${title}.${outputFormat}`,
  }
}
