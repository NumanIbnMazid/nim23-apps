'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'
import HumanizerInput from '@/components/HumanizerAI/HumanizerInput'
import RegenerateButton from '@/components/HumanizerAI/RegenerateButton'
import HumanizedOutput from '@/components/HumanizerAI/HumanizedOutput'
import AppIntro from '@/components/HumanizerAI/AppIntro'
import ErrorMessage from '@/components/HumanizerAI/ErrorMessage'
import { fetchHumanizedText } from '@/lib/humanizerAI/fetchHumanizedText'
import HowToUseHumanizer from '@/components/HumanizerAI/HowToUse'

export default function HumanizerAiClient() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const maxLength = Number(process.env.NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS) || 300 // Words
  const minLength = Number(process.env.NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS) || 20 // Words

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to humanize.')
      return
    }

    const wordCount = countWords(inputText)
    if (wordCount > maxLength) {
      setError(`Input exceeds ${maxLength} words. Current: ${wordCount}`)
      return
    }
    if (wordCount < minLength) {
      setError(`Input must be at least ${minLength} words. Current: ${wordCount}`)
      return
    }

    setLoading(true)
    setError('')
    setOutputText('')

    try {
      const result = await fetchHumanizedText(inputText)
      setOutputText(result)
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
    }

    setLoading(false)
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  return (
    <div className="dark:bg-darkPrimary dark:text-gray-100">
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={FadeContainer}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto py-16"
      >
        <div className="px-4">
          <AppIntro />
          <div className="mt-8">
            <HumanizerInput
              inputText={inputText}
              maxLength={maxLength}
              minLength={minLength}
              setInputText={setInputText}
              onSubmit={handleSubmit}
              loading={loading}
            />
            {error && <ErrorMessage error={error} />}
            {outputText && <HumanizedOutput output={outputText} />}
            {outputText && (
              <div className="flex justify-end mt-4">
                <RegenerateButton onClick={handleSubmit} isLoading={loading} />
              </div>
            )}
          </div>
          <hr className="my-16 border-gray-300 dark:border-gray-700" />
          <HowToUseHumanizer maxLength={maxLength} minLength={minLength} />
        </div>
      </motion.section>
    </div>
  )
}
