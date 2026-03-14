import Link from 'next/link'

export function ModerationDisclaimer() {
  return (
    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
      Uploaded images are screened by AI to maintain community safety.
      This system is imperfect and may make mistakes. Flagged content
      is queued for human review. By uploading, you agree to our{' '}
      <Link href="/terms" className="text-primary hover:underline">
        Terms of Service
      </Link>.
    </p>
  )
}
