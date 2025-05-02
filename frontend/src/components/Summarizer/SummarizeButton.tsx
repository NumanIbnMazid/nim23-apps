import React from 'react'

interface SummarizeButtonProps {
  onClick: () => void
  loading: boolean
}

const SummarizeButton: React.FC<SummarizeButtonProps> = ({ onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
    >
      {loading ? 'Summarizing...' : 'Summarize'}
    </button>
  )
}

export default SummarizeButton
