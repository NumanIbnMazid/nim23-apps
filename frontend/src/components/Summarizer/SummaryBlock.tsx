import React, { useState } from 'react'
import { FiCopy } from 'react-icons/fi'

interface SummaryBlockProps {
  summary: string
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ summary }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!summary) return null

  return (
    <div className="mt-4 p-4 border border-gray-300 dark:border-gray-700 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">Summary</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-200"
        >
          <FiCopy className="text-base" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-gray-800 dark:text-slate-100 whitespace-pre-wrap">{summary}</p>
    </div>
  )
}

export default SummaryBlock
