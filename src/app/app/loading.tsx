import { Loader2 } from 'lucide-react'

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center py-20" role="status">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
