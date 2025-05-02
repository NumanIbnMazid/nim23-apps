import { FFmpeg } from '@ffmpeg/ffmpeg'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

const getBase64FromArrayBuffer = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export async function processLocalFile(file: File, ffmpeg: FFmpeg): Promise<{ base64Audio?: string; text?: string }> {
  const fileType = file.type

  // === AUDIO FILE ===
  if (fileType.startsWith('audio/')) {
    const buffer = await file.arrayBuffer()
    const base64 = getBase64FromArrayBuffer(buffer)
    return { base64Audio: base64 }
  }

  // === VIDEO FILE ===
  if (fileType.startsWith('video/')) {
    const buffer = await file.arrayBuffer()
    await ffmpeg.writeFile('input.mp4', new Uint8Array(buffer))

    await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', 'output.wav'])

    const audio = await ffmpeg.readFile('output.wav')
    // @ts-ignore
    const base64 = getBase64FromArrayBuffer(audio.buffer)
    return { base64Audio: base64 }
  }

  // === TEXT FILE ===
  if (fileType === 'text/plain') {
    const text = await file.text()
    return { text: text }
  }

  // === PDF FILE ===
  if (fileType === 'application/pdf') {
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
    file.name.endsWith('.docx')
  ) {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return { text: result.value }
  }

  throw new Error('Unsupported file type.')
}
