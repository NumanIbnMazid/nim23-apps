import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'

export default function HowToUse() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={FadeContainer}
      className="max-w-4xl mx-auto mt-20 px-6 py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-lg"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        How to Use Summarizer
      </h2>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Choose Your Input Type</h3>
          <div>
            You can summarize content by either:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Entering a video/audio URL (e.g., YouTube, Facebook, .mp4 links)</li>
              <li>Uploading a file (video, audio, PDF, DOCX, Markdown, or plain text)</li>
              <li>Typing or pasting text directly into the input area</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Preview and Prepare</h3>
          <p>
            After inputting your content, the app will extract and display basic metadata (like duration, file type,
            etc.). For media files, audio will be extracted automatically in the browser before being sent to the
            backend.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Click “Summarize”</h3>
          <p>
            Once you're ready, click the <span className="text-emerald-600">Summarize</span> button. Summarizer will
            process the content — transcribing media using Whisper and generating a summary using advanced AI models
            like Gemini, Claude, or GPT.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. View Your Summary</h3>
          <p>
            In a few seconds, your concise, human-readable summary will appear. You can copy it, download it, or share
            it as needed. For longer files, the summary will include key points and important segments.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          About Summarizer
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          <strong>Summarizer by NIM23</strong> is an intelligent content simplification tool that helps you quickly
          understand long or complex content from various sources — including videos, audio files, documents, and raw
          text.
        </p>

        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Whether you’re summarizing a lecture, a podcast, a YouTube video, a meeting recording, a long article, or a
          technical report — Summarizer saves you time and boosts your productivity by delivering clear, concise
          summaries with just one click.
        </p>
      </div>
    </motion.section>
  )
}
