import RecommendrClient from '@/app/recommendr/RecommendrClient'
import { Suspense } from 'react'
import SkeletonLoader from '@/components/SkeletonLoader'
import { getPageMetadata, pageMeta } from '@/lib/Meta'
import { Metadata } from 'next'
import { PUBLIC_SITE_URL } from '@/lib/constants'
import { getPreferences } from '@/lib/recommendr/fetchPreferences'

export const metadata: Metadata = getPageMetadata({
  title: pageMeta.recommendr.title,
  description: pageMeta.recommendr.description,
  image: pageMeta.recommendr.image,
  keywords: pageMeta.recommendr.keywords,
  url: PUBLIC_SITE_URL,
})

export default function Page() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <MainPage />
    </Suspense>
  )
}

async function MainPage() {
  const recommenderPreferences = await getPreferences()

  if (recommenderPreferences && Object.keys(recommenderPreferences).length === 0) {
    console.warn('Fallback: Using empty preferences due to fetch error.')
  }

  return <RecommendrClient preferencesChoices={recommenderPreferences} />
}
