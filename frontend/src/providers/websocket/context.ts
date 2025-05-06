import { createContext } from 'react'
import { WebSocketContextType } from './types'
// Create the context with a default initial value
export const WebSocketContext = createContext<WebSocketContextType>({
  logsSocket: null,
  summarizerSocket: null,
  logs: [],
  summarizerLogs: [],
  socketSessionID: null,
  summarizerConnected: false,
  summarizerRetrying: false,
})