import React from 'react'

interface SummarizeButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

const SummarizeButton: React.FC<SummarizeButtonProps> = ({ onClick, loading, disabled }) => {
  const handleClick = () => {
    if (!loading && !disabled) {
      onClick()
    }
  }

  const isInactive = loading || disabled

  return (
    <div className="relative inline-block mt-4">
      <button
        onClick={handleClick}
        disabled={isInactive}
        className={`relative px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 w-40 h-12 ${
          isInactive ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
    </div>
  )
}

export default SummarizeButton
