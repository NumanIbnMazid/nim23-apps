import { motion } from 'framer-motion'
import { FadeContainer } from '@/content/FramerMotionVariants'

export default function HowToUseHumanizer({ maxLength, minLength }: { maxLength: number; minLength: number }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={FadeContainer}
      className="max-w-4xl mx-auto mt-20 px-6 py-12 bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-lg"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        How to Use Humanizer AI
      </h2>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            1. Paste Your AI-Generated Text
          </h3>
          <p>
            Start by pasting any robotic or AI-generated text into the input field. Whether it's a draft for a blog,
            email, social media post, or any other content — Humanizer AI is ready to refine it.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Check Word Limit</h3>
          <p>
            Ensure your text meets the minimum and maximum word count requirements. This helps the engine work
            effectively to transform your content into smooth, natural language.
            <br />
            <p className="text-emerald-600">Maximum: {maxLength} words</p>
            <p className="text-emerald-600">Minimum: {minLength} words</p>
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Click Humanize</h3>
          <p>
            Hit the <span className="text-emerald-600">Humanize Text</span> button and let the magic happen. In a few
            seconds, Humanizer AI will rewrite your content in a way that sounds authentic, engaging, and truly human.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Review and Use</h3>
          <p>
            Review the humanized output. If you wish to tweak or regenerate the content, you can do so easily by
            clicking <span className="text-emerald-600">Not Happy? Humanize Again!</span> button. Then, copy and use it
            wherever you need — in emails, blogs, captions, essays, or messages.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          About Humanizer AI
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          <strong>Humanizer AI by NIM23</strong> is a free online tool designed to transform stiff, robotic, or
          AI-generated text into smooth, natural-sounding human language. It's perfect for enhancing the readability
          and warmth of any written content.
        </p>

        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Whether you're drafting a professional email, creating blog posts, writing social media captions, or
          preparing any written material — Humanizer AI makes your text sound authentic, relatable, and engaging
          without losing its original meaning.
        </p>
      </div>
    </motion.section>
  )
}
