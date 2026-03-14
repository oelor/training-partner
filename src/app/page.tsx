import type { Metadata } from 'next'
import LandingPage from './landing-page'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://trainingpartner.app',
  },
}

export default function Page() {
  return <LandingPage />
}
