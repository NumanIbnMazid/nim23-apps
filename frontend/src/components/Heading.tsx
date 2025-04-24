import { headingFromLeft } from '@/content/FramerMotionVariants'
import AnimatedHeading from '@/components/FramerMotion/AnimatedHeading'

export function HomeHeading({ title }: { title: React.ReactNode | string }) {
  return (
    <AnimatedHeading
      className="w-full my-2 px-4 text-3xl font-bold text-left font-inter flex justify-center items-center"
      variants={headingFromLeft}
    >
      {title}
    </AnimatedHeading>
  )
}
