import React from 'react'

interface ErrorMessageProps {
  error: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return error ? <p className="mt-6 text-red-600">{error}</p> : null
}

export default ErrorMessage
