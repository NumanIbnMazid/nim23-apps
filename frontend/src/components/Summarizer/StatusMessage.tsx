import React from 'react'

interface StatusMessageProps {
  message: string
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  return message ? <p className="mt-2 text-green-600">{message}</p> : null
}

export default StatusMessage