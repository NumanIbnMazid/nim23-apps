import { SocketLogType } from './types'

export const logReducer = (
  state: SocketLogType[],
  action: { type: 'add' | 'clear' | 'clearProcessed'; payload?: { lastProcessedId: string } | SocketLogType }
) => {
  if (action.type === 'add') {
    const MAX_LOGS = 1000
    return [...state.slice(-MAX_LOGS + 1), action.payload as SocketLogType]
  } else if (action.type === 'clear') {
    // usage: dispatchLogs({ type: 'clear' })
    return []
  } else if (action.type === 'clearProcessed') {
    const { lastProcessedId } = action.payload as { lastProcessedId: string }
    const index = state.findIndex((log) => log.id === lastProcessedId)
    return index >= 0 ? state.slice(index + 1) : state
  }
  return state
}

export const summarizerLogReducer = (
  state: SocketLogType[],
  action: { type: 'add' | 'clear' | 'clearProcessed'; payload?: { lastProcessedId: string } | SocketLogType }
) => {
  if (action.type === 'add') {
    const MAX_LOGS = 1000
    return [...state.slice(-MAX_LOGS + 1), action.payload as SocketLogType]
  } else if (action.type === 'clear') {
    // usage: dispatchLogs({ type: 'clear' })
    return []
  } else if (action.type === 'clearProcessed') {
    const { lastProcessedId } = action.payload as { lastProcessedId: string }
    const index = state.findIndex((log) => log.id === lastProcessedId)
    return index >= 0 ? state.slice(index + 1) : state
  }
  return state
}

export const whisperLogReducer = (
  state: SocketLogType[],
  action: { type: 'add' | 'clear' | 'clearProcessed'; payload?: { lastProcessedId: string } | SocketLogType }
) => {
  if (action.type === 'add') {
    const MAX_LOGS = 1000
    return [...state.slice(-MAX_LOGS + 1), action.payload as SocketLogType]
  } else if (action.type === 'clear') {
    // usage: dispatchLogs({ type: 'clear' })
    return []
  } else if (action.type === 'clearProcessed') {
    const { lastProcessedId } = action.payload as { lastProcessedId: string }
    const index = state.findIndex((log) => log.id === lastProcessedId)
    return index >= 0 ? state.slice(index + 1) : state
  }
  return state
}
