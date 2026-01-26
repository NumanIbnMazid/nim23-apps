'use client' // ✅ Ensure Client Component

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation' // ✅ Correct Hook
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { Toaster } from 'sonner' // ✅ Import Toaster here
import { useDarkMode } from '@/providers/DarkModeProvider' // ✅ Now works in Client Component

NProgress.configure({
  easing: 'ease',
  speed: 800,
  showSpinner: false,
})

const CONSTRUCTION_NOTICE_KEY = "construction_notice_dismissed";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() // ✅ Detects navigation changes
  const { isDarkMode } = useDarkMode() // ✅ Now works

  const [showNotice, setShowNotice] = useState(false);

  /* Check localStorage on first load */
  useEffect(() => {
    const dismissed = localStorage.getItem(CONSTRUCTION_NOTICE_KEY);
    if (!dismissed) {
      setShowNotice(true);
    }
  }, []);

  const dismissNotice = () => {
    localStorage.setItem(CONSTRUCTION_NOTICE_KEY, "true");
    setShowNotice(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      NProgress.start()
      const timer = setTimeout(() => {
        NProgress.done()
      }, 500)

      return () => {
        clearTimeout(timer)
        NProgress.done()
      }
    }
  }, [pathname])

  return (
    <>
      {process.env.NODE_ENV === 'production' && <GoogleAnalytics strategy="lazyOnload" />}

      <div id='__app_root'>

        {/* 🚧 Under Construction Notice */}
        {showNotice && (
          <div className="relative z-40 bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-start gap-3">

              {/* Icon */}
              <div className="mt-0.5 text-amber-600 dark:text-amber-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.516 11.586c.75 1.334-.213 2.995-1.742 2.995H3.483c-1.53 0-2.492-1.66-1.743-2.995L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 7v4a1 1 0 001.993.117L11 11V7a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                <strong className="font-medium">Notice:</strong>{" "}
                This site is currently under development. Some features may be
                incomplete or behave inconsistently.
              </div>

              {/* Dismiss Button */}
              <button
                onClick={dismissNotice}
                aria-label="Dismiss notification"
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ============= MAIN CONTENT GOES HERE ============= */}

        {children}
      </div>

      {/* ✅ Add the Sonner Toaster */}
      <Toaster
        position="top-right"
        closeButton={true}
        offset={{ top: '60px', right: '10px' }}
        richColors
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </>
  )
}
