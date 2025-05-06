import { SocketLogType } from './types'
// Reducers remain the same
export const logReducer = (state: SocketLogType[], action: { type: 'add'; payload: SocketLogType }) => {
  if (action.type === 'add') {
    const MAX_LOGS = 100
    return [...state.slice(-MAX_LOGS + 1), action.payload]
    // return [...state, action.payload] // Original comment retained
  }
  return state
}
export const summarizerLogReducer = (state: SocketLogType[], action: { type: 'add'; payload: SocketLogType }) => {
  if (action.type === 'add') {
    const MAX_LOGS = 100
    return [...state.slice(-MAX_LOGS + 1), action.payload]
    // return [...state, action.payload] // Original comment retained
  }
  return state
}