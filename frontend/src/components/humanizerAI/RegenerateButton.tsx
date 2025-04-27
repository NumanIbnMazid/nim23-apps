import React from 'react'

interface Props {
  onClick: () => void
  isLoading: boolean
}

const RegenerateButton: React.FC<Props> = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 mt-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Humanizing...' : 'Not Happy? Humanize Again!'}
  </button>
)

export default RegenerateButton
