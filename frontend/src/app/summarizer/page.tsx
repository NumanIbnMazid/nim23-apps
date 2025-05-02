import SummarizerClient from '@/app/summarizer/SummarizerClient'
import { Suspense } from 'react'
import SkeletonLoader from '@/components/SkeletonLoader'
import { getPageMetadata, pageMeta } from '@/lib/Meta'
import { Metadata } from 'next'
import { PUBLIC_SITE_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// Generate metadata for the landing page
export const metadata: Metadata = getPageMetadata({
  title: pageMeta.summarizer.title,
  description: pageMeta.summarizer.description,
  image: pageMeta.summarizer.image,
  keywords: pageMeta.summarizer.keywords,
  url: PUBLIC_SITE_URL,
})

export default function Page() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <SummarizerClient />
    </Suspense>
  )
}
