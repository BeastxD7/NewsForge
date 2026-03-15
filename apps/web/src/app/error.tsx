"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Factverse Insights" className="size-16 rounded-2xl mb-6 opacity-80" />
      <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">Something went wrong</h1>
      <p className="text-base text-muted-foreground mb-8 max-w-sm">
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
