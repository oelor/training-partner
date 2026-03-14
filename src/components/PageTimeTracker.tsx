'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageTimeSpent } from '@/lib/analytics'

/**
 * Tracks how long users spend on each page.
 * Fires an event when the user navigates away or closes the tab.
 * This helps identify which pages engage users vs which they bounce from.
 */
export function PageTimeTracker() {
  const pathname = usePathname()
  const startTime = useRef(Date.now())
  const lastPath = useRef(pathname)

  useEffect(() => {
    // On route change, report time on previous page
    if (lastPath.current !== pathname) {
      const timeSpent = Date.now() - startTime.current
      // Only report if they spent more than 1 second (filters out instant navigations)
      if (timeSpent > 1000) {
        trackPageTimeSpent(lastPath.current, timeSpent)
      }
      startTime.current = Date.now()
      lastPath.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    // On tab close / navigate away, report final page time
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime.current
      if (timeSpent > 1000) {
        trackPageTimeSpent(lastPath.current, timeSpent)
      }
    }

    // On tab visibility change (switch tabs = potential abandonment signal)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeSpent = Date.now() - startTime.current
        if (timeSpent > 1000) {
          trackPageTimeSpent(lastPath.current, timeSpent)
        }
      } else {
        // Reset timer when they come back
        startTime.current = Date.now()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null // Invisible component
}

export default PageTimeTracker
