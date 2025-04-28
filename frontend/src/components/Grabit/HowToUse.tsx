import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'

export default function HowToUseGrabit() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={FadeContainer}
      className="max-w-6xl mx-auto mt-20 px-6 py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-lg"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        How to Use Grabit
      </h2>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Enter the Video URL</h3>
          <p>
            Paste the URL of the video or audio you want to download into the input field. Grabit supports platforms
            like YouTube, Facebook, Instagram, Twitter, TikTok, and many more.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Fetch Media Details</h3>
          <p>
            Click the <span className="text-emerald-600">Click to Start Download</span> button. Grabit will fetch all
            media metadata and prepare the available formats for you.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Select Media Type</h3>
          <p>
            Choose whether you want to download <span className="text-emerald-600">Video</span> or{' '}
            <span className="text-emerald-600">Audio</span> from the available options.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            4. Choose Source and Target Format
          </h3>
          <p>
            Select the <span className="text-emerald-600">Source Format</span> (such as 1920×1080, 720p, etc.) and then
            pick the <span className="text-emerald-600">Target Format</span> like MP4, MKV, or MP3 based on your needs.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Gear Up and Download</h3>
          <p>
            Once your selections are ready, click the <span className="text-emerald-600">Gear Up to Download</span>{' '}
            button. Grabit will process and automatically download your media securely and quickly.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          About Grabit
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          <strong>Grabit by NIM23</strong> is a powerful, free, and secure media downloader that helps you download
          videos and audio from major platforms like YouTube, Facebook, Instagram, Twitter, TikTok, and many others —
          quickly and hassle-free.
        </p>

        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Whether you want a full HD video or just the audio track, Grabit makes it easy to customize your downloads
          exactly the way you want. With full support for multiple formats, fast processing, and a clean, user-friendly
          interface — Grabit gives you complete control over your media downloads.
        </p>
      </div>
    </motion.section>
  )
}
