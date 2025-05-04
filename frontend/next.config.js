// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv')

dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const runtimeCaching = require('next-pwa/cache')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/], // ✅ Prevents slow initial navigation
  publicExcludes: ['!robots.txt', '!sitemap.xml', '!workbox-*.js', '!sw.js'],
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  output: 'standalone',
  experimental: {},
  generateBuildId: async () => {
    return 'nim23-apps-build'
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows images from any external host
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MODE: process.env.NEXT_PUBLIC_MODE,
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    NEXT_PUBLIC_BACKEND_DOMAIN: process.env.NEXT_PUBLIC_BACKEND_DOMAIN,
    NEXT_PUBLIC_BACKEND_API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL,
    NEXT_PUBLIC_EMAIL_JS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID,
    NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY,
    NEXT_PUBLIC_PORTFOLIO_SITE_URL: process.env.NEXT_PUBLIC_PORTFOLIO_SITE_URL,
    NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS: process.env.NEXT_PUBLIC_HUMANIZER_AI_MAX_WORDS,
    NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS: process.env.NEXT_PUBLIC_HUMANIZER_AI_MIN_WORDS,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      }
    }
    config.resolve.alias.canvas = false
    return config
  },
})

module.exports = nextConfig
