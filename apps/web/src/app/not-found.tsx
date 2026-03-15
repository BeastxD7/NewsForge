import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Factverse Insights" className="size-16 rounded-2xl mb-6 opacity-80" />
      <h1 className="text-5xl font-black tracking-tight text-foreground mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-sm">
        This page doesn&apos;t exist or the article has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Back to home
      </Link>
    </div>
  )
}
