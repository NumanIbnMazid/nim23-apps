export interface SocketLogType {
  type: string
  message: any
  [key: string]: any
}
export interface WebSocketContextType {
  logsSocket: WebSocket | null
  summarizerSocket: WebSocket | null
  logs: SocketLogType[]
  summarizerLogs: SocketLogType[]
  socketSessionID: string | null
  summarizerConnected: boolean
  summarizerRetrying: boolean
}
