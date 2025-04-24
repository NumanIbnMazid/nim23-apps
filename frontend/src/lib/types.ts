import { Variants } from 'framer-motion'
import React from 'react'
import { IconType } from 'react-icons/lib'

/* Custom Animated Components types */
export type AnimatedTAGProps = {
  variants: Variants
  className?: string
  children: React.ReactNode
  infinity?: boolean
}

export type SocialPlatform = {
  title: string
  Icon: IconType
  url: string
}

export type PageData = {
  title: string
  description: string
  image: string
  keywords: string
}

export type PageMeta = {
  home: PageData
  privacy: PageData
  contact: PageData
  grabit: PageData
  humanizerAI: PageData
  recommendr: PageData
}
