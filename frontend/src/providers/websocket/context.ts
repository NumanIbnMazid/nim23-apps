import { createContext } from 'react'
import { WebSocketContextType } from './types'
// Create the context with a default initial value
export const WebSocketContext = createContext<WebSocketContextType>({
  logsSocket: null,
  summarizerSocket: null,
  whisperSocket: null,
  logs: [],
  dispatchLogs: () => {},
  summarizerLogs: [],
  dispatchSummarizerLogs: () => {},
  whisperLogs: [],
  dispatchWhisperLogs: () => {},
  socketSessionID: null,
  summarizerConnected: false,
  summarizerRetrying: false,
})
