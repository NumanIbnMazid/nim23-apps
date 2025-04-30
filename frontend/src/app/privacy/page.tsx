import PrivacyClient from '@/app/privacy/PrivacyClient'
import { Suspense } from 'react'
import SkeletonLoader from '@/components/SkeletonLoader'
import { getPageMetadata, pageMeta } from '@/lib/Meta'
import type { Metadata } from 'next'
import { PUBLIC_NEXT_PUBLIC_SITE_URL } from '@/lib/constants'

// ✅ Generate metadata for Privacy Policy Page
export const metadata: Metadata = getPageMetadata({
  title: pageMeta.privacy.title,
  description: pageMeta.privacy.description,
  image: pageMeta.privacy.image,
  keywords: pageMeta.privacy.keywords,
  url: `${PUBLIC_NEXT_PUBLIC_SITE_URL}/privacy`, // ✅ Privacy Policy page URL
})

export default function Page() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <MainPrivacyPage />
    </Suspense>
  )
}

async function MainPrivacyPage() {
  return <PrivacyClient />
}
