import { FFmpeg } from '@ffmpeg/ffmpeg'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'

const getBase64FromArrayBuffer = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export async function processLocalFile(
  file: File,
  ffmpeg: FFmpeg,
  setStatusMessage: any
): Promise<{ base64Audio?: string; text?: string }> {
  const fileType = file.type

  // === AUDIO FILE ===
  if (fileType.startsWith('audio/')) {
    setStatusMessage('Processing audio file...')
    const buffer = await file.arrayBuffer()
    const base64 = getBase64FromArrayBuffer(buffer)
    return { base64Audio: base64 }
  }

  // === VIDEO FILE ===
  if (fileType.startsWith('video/')) {
    setStatusMessage('Processing video file...')
    const buffer = await file.arrayBuffer()
    await ffmpeg.writeFile('input.mp4', new Uint8Array(buffer))

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      '-f',
      'wav',
      'output.wav',
    ])

    const audio = await ffmpeg.readFile('output.wav')
    // @ts-ignore
    const base64 = getBase64FromArrayBuffer(audio.buffer)
    return { base64Audio: base64 }
  }

  // === TEXT FILE ===
  if (fileType === 'text/plain') {
    setStatusMessage('Processing text file...')
    const text = await file.text()
    return { text: text }
  }

  // === MARKDOWN FILE ===
  if (fileType === 'text/markdown' || file.name.endsWith('.md')) {
    setStatusMessage('Processing Markdown file...')
    const text = await file.text()
    return { text }
  }

  // === PDF FILE ===
  if (fileType === 'application/pdf') {
    setStatusMessage('Processing PDF file...')
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n'
    }
    return { text: text }
  }

  // === DOCX FILE ===
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc')
  ) {
    if (fileType === 'application/msword' || file.name.endsWith('.doc')) {
      throw new Error('.doc files are not supported. Please upload a .docx file instead.')
    }
    setStatusMessage('Processing Word file...')

    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return { text: result.value }
  }

  console.log('Unsupported file type:', fileType)

  throw new Error('Unsupported file type.')
}
