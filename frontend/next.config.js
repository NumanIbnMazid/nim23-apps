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
  buildExcludes: ['.next/static/chunks/pages/*.js'], // ✅ Prevents slow initial navigation
  publicExcludes: ['!robots.txt', '!sitemap.xml', '!workbox-*.js', '!sw.js'],
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  output: 'standalone',
  experimental: {
    // turbo: {}, // ✅ Ensure Turbopack is enabled correctly
    serverActions: {}, // ✅ Ensure Server Actions are enabled correctly,
    workerThreads: false, // ✅ Ensure service worker updates
  },
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
    SECRET_BACKEND_API_TOKEN: process.env.SECRET_BACKEND_API_TOKEN,
    NEXT_PUBLIC_EMAIL_JS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID,
    NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID,
    NEXT_PUBLIC_EMAIL_JS_COMMENT_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAIL_JS_COMMENT_TEMPLATE_ID,
    NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_GA_PROPERTY_ID: process.env.NEXT_PUBLIC_GA_PROPERTY_ID,
    NEXT_PUBLIC_GA_PROJECT_ID: process.env.NEXT_PUBLIC_GA_PROJECT_ID,
    NEXT_PUBLIC_GA_CLIENT_EMAIL: process.env.NEXT_PUBLIC_GA_CLIENT_EMAIL,
    NEXT_PUBLIC_GA_PRIVATE_KEY: process.env.NEXT_PUBLIC_GA_PRIVATE_KEY,
    DARKSTAR_GOOGLE_API_KEY: process.env.DARKSTAR_GOOGLE_API_KEY,
    NEXT_PUBLIC_PORTFOLIO_URL: process.env.NEXT_PUBLIC_PORTFOLIO_URL,
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
