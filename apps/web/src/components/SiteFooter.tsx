import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Factverse Insights" className="size-6 rounded-md" />
              <span className="font-black text-white">Factverse Insights</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
              AI-powered news curation. Stay informed, stay ahead.
            </p>
          </div>
          <div className="flex gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-3">Explore</p>
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-neutral-400 hover:text-white transition-colors">Home</Link>
                <Link href="/articles" className="block text-sm text-neutral-400 hover:text-white transition-colors">All Articles</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-neutral-400 hover:text-white transition-colors">About</Link>
                <Link href="/privacy" className="block text-sm text-neutral-400 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="block text-sm text-neutral-400 hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-6 overflow-hidden">
          <p className="text-[4.5rem] sm:text-[7rem] lg:text-[9.5rem] font-black tracking-tighter text-neutral-800 leading-none select-none -mb-3">
            FACTVERSE INSIGHTS
          </p>
        </div>
      </div>
    </footer>
  )
}
