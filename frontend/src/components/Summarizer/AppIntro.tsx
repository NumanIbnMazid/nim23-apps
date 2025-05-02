import { FaBrain, FaMicrophone, FaFileAlt, FaVideo } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function AppIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-yellow-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-md mb-10 text-center"
    >
      <div className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-3 text-yellow-600 dark:text-yellow-400">
        <FaBrain className="text-blue-500" />
        Summarizer
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-md md:text-lg leading-relaxed max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2">
          <FaMicrophone /> Got an audio or video clip?
        </span>{' '}
        <span className="inline-flex items-center gap-2">
          <FaFileAlt /> Upload a document or paste text?
        </span>{' '}
        <span className="inline-flex items-center gap-2">
          <FaVideo /> Found a link worth summarizing?
        </span>{' '}
        <br />
        <br />
        <span className="font-medium">Summarizer</span> by NIM23 is your intelligent content companion — built to
        distill <span className="font-semibold text-blue-600">videos</span>,{' '}
        <span className="font-semibold text-green-600">audio</span>,{' '}
        <span className="font-semibold text-purple-600">documents</span>, and{' '}
        <span className="font-semibold text-pink-600">text</span> into clean, clear summaries.
        <br />
        <br />
        Save time. Stay informed. Understand faster.
      </p>
    </motion.div>
  )
}
