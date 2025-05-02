import React from 'react'

interface StatusMessageProps {
  message: string
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  return message ? <p className="mt-6 text-sky-500">{message}</p> : null
}

export default StatusMessage