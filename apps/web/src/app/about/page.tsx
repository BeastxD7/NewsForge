import type { Metadata } from "next"
import Link from "next/link"
import { Newspaper, Zap, Eye, BookOpen } from "lucide-react"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://www.factverseinsight.com"

export const metadata: Metadata = {
  title: "About Factverse Insights",
  description:
    "Learn about Factverse Insights — our mission to turn long-form video and news into clear, in-depth articles using AI, and our commitment to editorial transparency.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Factverse Insights",
    description:
      "Our mission: turn long-form video and news into clear, in-depth articles using AI.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
}

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE_URL}/about`,
  name: "About Factverse Insights",
  mainEntity: {
    "@type": "Organization",
    name: "Factverse Insights",
    url: SITE_URL,
    description:
      "AI-powered news and analysis platform that transforms YouTube videos, podcasts, and breaking news into in-depth articles.",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 500,
      height: 500,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "beast.steam002@gmail.com",
      contactType: "customer support",
    },
  },
}

const sources = [
  {
    icon: <Zap className="size-5 text-primary" />,
    title: "YouTube Videos & Podcasts",
    description:
      "We process a video's transcript, identify key insights and direct quotes, and transform them into a journalist-style article — written as if a reporter watched the video and distilled it for you.",
  },
  {
    icon: <Newspaper className="size-5 text-primary" />,
    title: "Breaking News & RSS Feeds",
    description:
      "Our pipeline monitors reputable news sources and generates original analysis pieces that go beyond the headline — providing context, background, and broader perspective.",
  },
  {
    icon: <BookOpen className="size-5 text-primary" />,
    title: "Trending Topics",
    description:
      "We track what the world is searching for and produce timely explainer articles so readers always have accurate, up-to-date information on topics that matter.",
  },
]

const values = [
  {
    label: "Transparency",
    body: "We always disclose when an article is AI-assisted. No hidden automation.",
  },
  {
    label: "Accuracy first",
    body: "Every article is based on a real, verifiable source — no fabricated quotes or invented facts.",
  },
  {
    label: "Editorial oversight",
    body: "AI writes the first draft; humans review and approve before publication.",
  },
  {
    label: "Zero ads",
    body: "No advertising, no tracking pixels, no data brokers. Just articles.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="border-b border-border/60 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-6">
              <Eye className="size-7 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground mb-5">
              Making expert knowledge<br className="hidden sm:block" /> accessible to everyone
            </h1>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
              Factverse Insights turns hours of video and dense news coverage into clear,
              well-structured articles you can read in minutes.
            </p>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-[1fr_2fr] gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Our mission</p>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Close the gap between knowledge and time
              </h2>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-4">
              <p>
                Every day, experts share hours of valuable insight on YouTube, in podcasts,
                and across the news. Most people simply don&rsquo;t have time to consume it all.
              </p>
              <p>
                We bridge that gap — transforming dense, long-form content into clear, well-structured
                articles. Whether it&rsquo;s a two-hour interview or a breaking news story,
                we extract what matters and present it in a way that respects your time.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-t border-border/60 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">How it works</p>
            <h2 className="text-2xl font-bold tracking-tight mb-10">Three content streams</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {sources.map((s) => (
                <div key={s.title} className="bg-background rounded-2xl border border-border/60 p-6 space-y-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Transparency ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="grid sm:grid-cols-[1fr_2fr] gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Transparency</p>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                How we produce content
              </h2>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-4">
              <p>
                All articles on Factverse Insights are generated with the assistance of AI
                (Anthropic&rsquo;s Claude). Every article is based on a real underlying source and
                is reviewed by our editorial team before publication.
              </p>
              <p>
                We do not fabricate quotes, invent sources, or publish content that cannot be traced
                back to verifiable material. The AI writes; the humans verify.
              </p>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="border-t border-border/60 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Our values</p>
            <h2 className="text-2xl font-bold tracking-tight mb-10">What we stand for</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div key={v.label} className="flex gap-4">
                  <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">{v.label}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coverage ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="grid sm:grid-cols-[1fr_2fr] gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Coverage</p>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">What we write about</h2>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <p>
                Technology, business, science, world affairs, health, and culture. We focus on
                topics that deserve deeper exploration than a tweet or breaking headline can offer —
                stories where context and analysis make all the difference.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="grid sm:grid-cols-[1fr_2fr] gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Contact</p>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">Get in touch</h2>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-4">
              <p>Have a question, feedback, or a content suggestion?</p>
              <a
                href="mailto:beast.steam002@gmail.com"
                className="inline-block font-semibold text-primary hover:underline"
              >
                beast.steam002@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* ── Back link ── */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <Link href="/" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
            ← Back to stories
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
