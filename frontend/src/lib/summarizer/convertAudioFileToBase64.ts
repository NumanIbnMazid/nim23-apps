export const convertAudioFileToBase64 = (audioData: Uint8Array): string => {
  return btoa(audioData.reduce((data, byte) => data + String.fromCharCode(byte), ''))
}
