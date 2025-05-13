export interface SocketLogType {
  type: string
  message: any
  [key: string]: any
}
export interface WebSocketContextType {
  logsSocket: WebSocket | null
  summarizerSocket: WebSocket | null
  whisperSocket: WebSocket | null
  logs: SocketLogType[]
  dispatchLogs: React.Dispatch<{
    type: 'add' | 'clear' | 'clearProcessed'
    payload?: { lastProcessedId: string } | SocketLogType
  }>
  summarizerLogs: SocketLogType[]
  dispatchSummarizerLogs: React.Dispatch<{
    type: 'add' | 'clear' | 'clearProcessed'
    payload?: { lastProcessedId: string } | SocketLogType
  }>
  whisperLogs: SocketLogType[]
  dispatchWhisperLogs: React.Dispatch<{
    type: 'add' | 'clear' | 'clearProcessed'
    payload?: { lastProcessedId: string } | SocketLogType
  }>
  socketSessionID: string | null
  summarizerConnected: boolean
  summarizerRetrying: boolean
}
