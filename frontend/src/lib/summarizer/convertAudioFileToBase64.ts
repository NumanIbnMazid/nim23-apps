// export const convertAudioFileToBase64 = async (audioData: Uint8Array): Promise<string> => {
//   const blob = new Blob([audioData], { type: 'audio/wav' })
//   const base64 = await new Promise<string>((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onloadend = () => {
//       const result = reader.result as string
//       resolve(result) // ← keep full string
//     }
//     reader.onerror = reject
//     reader.readAsDataURL(blob)
//   })
//   return base64
// }

export const convertAudioFileToBase64 = (audioData: Uint8Array): string => {
  return btoa(audioData.reduce((data, byte) => data + String.fromCharCode(byte), ''))
}
