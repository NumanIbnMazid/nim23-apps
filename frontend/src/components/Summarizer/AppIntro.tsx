import { motion } from 'framer-motion'
import { FaSitemap } from 'react-icons/fa'

export default function AppIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-md mb-10 text-center"
    >
      <div className="text-3xl md:text-4xl font-bold mb-4 flex justify-center items-center gap-3 text-blue-600 dark:text-blue-400">
        <FaSitemap className="text-green-500" />
        Summarizer
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-md md:text-lg leading-relaxed max-w-3xl mx-auto">
        <strong>Summarizer</strong> is a powerful tool that helps you quickly and easily summarize any text. Whether
        you need to summarize a video, audio, long document, a research paper, or even a book,{' '}
        <strong>Summarizer</strong> has you covered.
        <br />
        <br />
        <span className="font-semibold">Fast</span>. <span className="font-semibold">Secure</span>.{' '}
        <span className="font-semibold">Completely Free</span>.
        <br />
        <br />
      </p>
    </motion.div>
  )
}
