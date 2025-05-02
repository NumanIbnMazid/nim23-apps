import { PageMeta } from '@/lib/types'
import type { Metadata } from 'next'
import { PUBLIC_SITE_URL } from '@/lib/constants'

const myImage = 'images/numan.png'
const logoImage = 'images/logo.png'

export const pageMeta: PageMeta = {
  home: {
    title: 'APPS | NIM23',
    description:
      'Discover a range of useful and innovative apps created and offered by NIM23. From productivity tools to creative utilities, each app is built with care to solve real-world problems and enhance your digital experience.',
    image: myImage,
    keywords:
      'nim23 apps, numanibnmazid apps, web apps by nim23, productivity tools, creative apps, useful apps, nim23 tools, react apps, django apps, web development tools, youtube downloader, youtube video downloader, youtube video converter, nim23 grabit, nim23 grabit app, facebook video downloader, facebook video converter, tiktok video downloader, tiktok video converter, instagram video downloader, instagram video converter, twitter video downloader, twitter video converter, video to audio converter, audio converter, youtube 4k video downloader, youtube 8k video downloader, youtube 2k video downloader, youtube 1080p video downloader, youtube 720p video downloader, facebook hd video downloader, facebook 4k video downloader, AI text humanizer, humanize ai text, convert AI to human, rewrite AI content, natural language converter, robotic text to human, GPT humanizer, OpenRouter AI tool, AI detector bypass tool, human-like text generator, rewrite ChatGPT text, make AI text sound human, humanize GPT output, AI content editor, ai rewriter, ai paraphraser, AI text fixer, best ai humanizer 2025, free ai text converter, humanizer app by nim23, ai to human tone adjuster, content tone enhancer, seo friendly humanized text, human-like copywriter, mood-based recommendations, media recommendation engine, personalized movie recommendations, music discovery tool, mood playlists, AI media curator, recommendr app, NIM23 recommendr, smart content suggestions, mood media finder, best recommendation engine 2025, emotion-based recommendations, what to watch, what to listen to, curated content tool, mood AI assistant, entertainment suggester, discover music by mood, show and movie finder, vibe-based content',
  },
  privacy: {
    title: 'Privacy Policy | NIM23',
    description:
      'At nim23.com, we value and respect your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you visit our website.',
    image: logoImage,
    keywords: 'Privacy, Privacy Policies, nim23 privacy policy, numan privacy policy',
  },
  contact: {
    title: 'Contact | NIM23',
    description:
      "Do you have something on your mind that you'd like to discuss? Whether it's work-related or simply a casual conversation, I'm here and eager to lend an ear. Please don't hesitate to get in touch with me at any time.",
    image: logoImage,
    keywords: 'contact, contact page, nim23 contact, contact numan',
  },
  grabit: {
    title: 'Grabit - Download Videos & Audio from Any Platform | NIM23',
    description:
      'Grabit by NIM23 is a powerful video and audio downloader that lets you easily download content from YouTube, Facebook, Instagram, Twitter, TikTok, and many more platforms. Fast, secure, and completely free to use.',
    image: logoImage,
    keywords:
      'video downloader, audio downloader, youtube video downloader, facebook video downloader, instagram video downloader, tiktok downloader, twitter video downloader, yt-dlp downloader, online media downloader, grabit downloader, nim23 grabit, nim23 video tools, download youtube mp3, download mp4, download HD videos, free media downloader, yt-dlp frontend, open source downloader, youtube to mp3, video to audio extractor, best video downloader 2025, grabit app nim23, fast youtube downloader, no ads downloader, privacy-safe downloader, youtube 4k video downloader, youtube 8k video downloader, youtube 2k video downloader, youtube 1080p video downloader, youtube 720p video downloader, facebook hd video downloader, facebook 4k video downloader',
  },
  humanizerAI: {
    title: 'Humanizer AI - Convert AI Text to Human-Like Content | NIM23',
    description:
      'Humanizer AI by NIM23 is a free online tool that transforms robotic or AI-generated text into natural, human-sounding language. Perfect for emails, blogs, captions, and more.',
    image: logoImage,
    keywords:
      'AI text humanizer, humanize ai text, convert AI to human, rewrite AI content, natural language converter, robotic text to human, GPT humanizer, OpenRouter AI tool, AI detector bypass tool, human-like text generator, rewrite ChatGPT text, make AI text sound human, humanize GPT output, AI content editor, ai rewriter, ai paraphraser, AI text fixer, best ai humanizer 2025, free ai text converter, humanizer app by nim23, ai to human tone adjuster, content tone enhancer, seo friendly humanized text, human-like copywriter',
  },
  recommendr: {
    title: 'Recommendr – Best Media Recommendation App | NIM23',
    description:
      'Recommendr by NIM23 is a smart media recommendation engine that curates personalized movies, music, tv-shows, web-series, documentaries etc. based on your mood and vibe. Discover what suits you best, effortlessly.',
    image: logoImage, // Update with actual image path
    keywords:
      'mood-based recommendations, media recommendation engine, personalized movie recommendations, music discovery tool, mood playlists, AI media curator, recommendr app, NIM23 recommendr, smart content suggestions, mood media finder, best recommendation engine 2025, emotion-based recommendations, what to watch, what to listen to, curated content tool, mood AI assistant, entertainment suggester, discover music by mood, show and movie finder, vibe-based content',
  },
  summarizer: {
    title: 'Summarizer – Smart AI-Powered Content Summarization Tool | NIM23',
    description:
      'Summarizer by NIM23 is a powerful AI-driven app that quickly distills audio, video, documents, or text into concise summaries. Upload or paste content, drop files (PDF, DOCX, TXT, Markdown, audio/video), or input any URL to get instant, intelligent summaries.',
    image: '/images/summarizer-cover.png', // Replace with actual image path
    keywords:
      'AI summarizer, content summarization tool, youtube video summarizer, facebook video summarizer, youtube video transcription, facebook video transcription, youtube video to text, video summarizer, audio summarizer, document summarizer, smart summary generator, summarize PDF DOCX TXT Markdown, text to summary, summarize YouTube videos, summarizer app NIM23, intelligent summarization, Whisper transcription, Gemini summarization, text AI assistant, summarization from URL, content distillation, file-based summarizer, quick summaries, AI content processor, multimedia summarizer, smart text reducer',
  },
}

export const commonMeta: Metadata = {
  title: 'APPS | NIM23',
  description:
    'Applications offered by NIM23. Discover a range of useful and innovative apps created and offered by NIM23. From productivity tools to creative utilities, each app is built with care to solve real-world problems and enhance your digital experience.',
  keywords: [
    'Numan',
    'Numan Ibn Mazid',
    'numanibnmazid',
    'nmn',
    'nim23',
    'nim23.com',
    'numan blog',
    'numan portfolio',
    'nim23 portfolio',
    'nim23 blog',
    'nim23 apps',
    'nim23 tools',
    'nim23 tools and apps',
    'nim23 web apps',
    'nim23 web tools',
    'youtube downloader',
    'youtube video downloader',
    'youtube video converter',
    'nim23 grabit',
    'nim23 grabit app',
    'facebook video downloader',
    'facebook video converter',
    'tiktok video downloader',
    'tiktok video converter',
    'instagram video downloader',
    'instagram video converter',
    'twitter video downloader',
    'twitter video converter',
    'video to audio converter',
    'audio converter',
    'youtube 4k video downloader',
    'youtube 8k video downloader',
    'youtube 2k video downloader',
    'youtube 1080p video downloader',
    'youtube 720p video downloader',
    'facebook hd video downloader',
    'facebook 4k video downloader',
    'AI text humanizer',
    'humanize ai text',
    'convert AI to human',
    'rewrite AI content',
    'natural language converter',
    'robotic text to human',
    'GPT humanizer',
    'OpenRouter AI tool',
    'AI detector bypass tool',
    'human-like text generator',
    'rewrite ChatGPT text',
    'make AI text sound human',
    'humanize GPT output',
    'AI content editor',
    'ai rewriter',
    'ai paraphraser',
    'AI text fixer',
    'best ai humanizer 2025',
    'free ai text converter',
    'humanizer app by nim23',
    'ai to human tone adjuster',
    'content tone enhancer',
    'seo friendly humanized text',
    'human-like copywriter',
    'mood-based recommendations',
    'media recommendation engine',
    'personalized movie recommendations',
    'music discovery tool',
    'mood playlists',
    'AI media curator',
    'recommendr app',
    'NIM23 recommendr',
    'smart content suggestions',
    'mood media finder',
    'best recommendation engine 2025',
    'emotion-based recommendations',
    'what to watch',
    'what to listen to',
    'curated content tool',
    'mood AI assistant',
    'entertainment suggester',
    'discover music by mood',
    'show and movie finder',
    'vibe-based content',
  ].join(', '),
  metadataBase: new URL(PUBLIC_SITE_URL),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-dark.ico',
    apple: '/icons/icon-192x192.png',
  },
  generator: 'NIM23',
  applicationName: 'NIM23',
  authors: [{ name: 'Numan Ibn Mazid', url: 'https://www.linkedin.com/in/numanibnmazid/' }],
  referrer: 'origin-when-cross-origin',
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  // },
  // themeColor: 'black',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'APPS | NIM23',
    description:
      'Applications offered by NIM23. Discover a range of useful and innovative apps created and offered by NIM23. From productivity tools to creative utilities, each app is built with care to solve real-world problems and enhance your digital experience.',
    url: new URL(PUBLIC_SITE_URL),
    siteName: 'APPS | NIM23',
    authors: ['Numan Ibn Mazid'],
    images: [
      {
        url: logoImage,
        alt: 'APPS offered by NIM23',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APPS | NIM23',
    description:
      'Applications offered by NIM23. Discover a range of useful and innovative apps created and offered by NIM23. From productivity tools to creative utilities, each app is built with care to solve real-world problems and enhance your digital experience.',
    creator: '@NumanIbnMazid',
    images: [
      {
        url: logoImage,
        alt: 'APPS offered by NIM23',
      },
    ],
  },
}

// ✅ Reusable function to generate dynamic metadata
export function getPageMetadata({
  title,
  description,
  image,
  keywords,
  url,
}: {
  title?: string
  description?: string
  image?: string
  keywords?: string | string[]
  url?: string
}): Metadata {
  return {
    title: title || commonMeta.title,
    description: description || commonMeta.description,
    keywords: keywords ? (Array.isArray(keywords) ? keywords.join(', ') : keywords) : commonMeta.keywords,
    metadataBase: new URL(PUBLIC_SITE_URL),
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-dark.ico',
      apple: '/icons/icon-192x192.png',
    },
    generator: 'NIM23',
    applicationName: 'NIM23',
    authors: [{ name: 'Numan Ibn Mazid', url: 'https://www.linkedin.com/in/numanibnmazid/' }],
    referrer: 'origin-when-cross-origin',
    manifest: '/manifest.json',
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: title || commonMeta.openGraph?.title,
      description: description || commonMeta.openGraph?.description,
      url: url || commonMeta.openGraph?.url,
      siteName: 'NIM23',
      images: [
        {
          url: image || myImage,
          alt: title || 'NIM23 - Portfolio',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || commonMeta.twitter?.title,
      description: description || commonMeta.twitter?.description,
      images: [
        {
          url: image || myImage,
          alt: title || 'NIM23 - Portfolio',
        },
      ],
    },
  }
}

// ✅ Export viewport separately as required by Next.js 14+
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ✅ Export themeColor separately as required by Next.js 14+
export const themeColor = 'black'
