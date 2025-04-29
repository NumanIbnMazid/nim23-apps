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
        How to Use Recommendr
      </h2>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            1. Select Your Mood & Media Type
          </h3>
          <p>
            Start by choosing your current mood and the type of media you're looking for — whether it's a movie, TV
            show, song, documentary, or web-series. Your vibe sets the direction for personalized recommendations.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            2. Customize Your Preferences
          </h3>
          <p>
            Click on <span className="text-emerald-600">Advanced Filters</span> and tailor your experience by selecting
            specific <b>languages, genres, ratings, media age, categories, occasions, and other preferences</b>. You
            can add as many or as few filters as you like — the choice is yours.
            <p>
              You can view your current selected preferences by clicking on{' '}
              <span className="text-emerald-600">Active Preferences</span>. Also you can clear your current selected
              preferences by clicking on <span className="text-emerald-600">Clear Preferences</span> button.
            </p>
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            3. Get Smart Recommendations
          </h3>
          <p>
            Once you're ready, submit your preferences by clicking on{' '}
            <span className="text-emerald-600">Get Recommendation</span>. Recommendr will instantly curate a list of
            movies, music, TV shows, and more that perfectly match your selections and mood.
            <p>
              You are able to modify your preferences by clicking on{' '}
              <span className="text-emerald-600">Modify Preferences</span> if you want or click on{' '}
              <span className="text-emerald-600">Get More</span> to get more recommendations based on current
              preferences.
            </p>
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Explore and Enjoy</h3>
          <p>
            Browse through the personalized suggestions. You can modify your preferences anytime and refresh the
            recommendations to discover even more options suited just for you.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          About Recommendr
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          <strong>Recommendr by NIM23</strong> is an intelligent media recommendation engine designed to help you
          discover the perfect entertainment experience for your current vibe. Powered by smart filtering and
          personalization, Recommendr curates movies, TV shows, songs, web-series, and documentaries that resonate with
          your mood, style, and preferences.
        </p>

        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          Whether you're looking for a cozy drama on a rainy day, a high-energy playlist for your workout, or a
          fascinating documentary to dive into — Recommendr makes the journey effortless and delightful. Let your mood
          guide you to something amazing.
        </p>
      </div>
    </motion.section>
  )
}
