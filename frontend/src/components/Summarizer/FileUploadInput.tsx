import React, { useCallback, useRef, useState } from 'react'

interface FileUploadInputProps {
  onFileSelect: (file: File | null) => void
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files && files[0]) {
        setFileName(files[0].name)
        onFileSelect(files[0])
      }
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files && files[0]) {
        setFileName(files[0].name)
        onFileSelect(files[0])
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleClear = () => {
    setFileName(null)
    onFileSelect(null)
    if (inputRef.current) {
      inputRef.current.value = '' // reset input element
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center mb-4 dark:bg-gray-800"
    >
      <p className="mb-2">Drag and drop a file here, or click to select a file. [Video/Audio/PDF/Word]</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,audio/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        id="fileUpload"
      />
      <label htmlFor="fileUpload" className="cursor-pointer text-blue-500 underline">
        Choose a file
      </label>

      {fileName && (
        <div className="mt-2">
          <p className="text-sm text-green-600">Selected: {fileName}</p>
          <button onClick={handleClear} className="mt-1 text-red-500 underline text-sm">
            Clear file
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploadInput
