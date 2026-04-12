import type { Metadata } from "next"
import Link from "next/link"
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
      "Learn about Factverse Insights — our mission to turn long-form video and news into clear, in-depth articles using AI.",
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
    sameAs: ["https://twitter.com/factverseinsights"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@factverseinsight.com",
      contactType: "customer support",
    },
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
        />

        <h1 className="text-4xl font-black tracking-tight mb-4">About Factverse Insights</h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed mb-14">
          Making expert knowledge accessible — one article at a time.
        </p>

        <div className="space-y-12 text-neutral-700 dark:text-neutral-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our Mission</h2>
            <p>
              Factverse Insights exists to close the gap between long-form knowledge and the people
              who need it. Every day, experts share hours of valuable insight on YouTube, in podcasts,
              and across the news — but most people simply don&rsquo;t have the time to consume it
              all. We bridge that gap by transforming dense, long-form content into clear, well-structured
              articles you can read in minutes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="mb-5">
              Our platform combines AI processing with editorial oversight to produce high-quality
              articles from multiple content sources:
            </p>
            <ul className="space-y-4">
              {([
                [
                  "YouTube Videos & Podcasts",
                  "We process the transcript of a video, identify key insights, direct quotes, and arguments, and transform them into a journalist-style article — written as if a reporter watched the video and distilled it for the reader.",
                ],
                [
                  "Breaking News & RSS Feeds",
                  "Our pipeline monitors reputable news sources and generates original analysis pieces that go beyond the headline to provide context, background, and broader perspective.",
                ],
                [
                  "Trending Topics",
                  "We track what the world is searching for and produce timely explainer articles so readers always have access to accurate, up-to-date information on topics that matter.",
                ],
              ] as [string, string][]).map(([title, desc]) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">{title} — </span>
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our Commitment to Transparency</h2>
            <p>
              We believe in full transparency about how our content is produced. All articles on
              Factverse Insights are generated with the assistance of AI (Anthropic&rsquo;s Claude).
              Every article is reviewed by our editorial team before publication. We do not fabricate
              quotes, invent sources, or publish content without a real underlying source. The AI
              writes; the humans verify.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">What We Cover</h2>
            <p>
              Factverse Insights covers technology, business, science, world affairs, health, and
              culture. We focus on topics that deserve deeper exploration than a tweet or a
              breaking-news headline can offer — stories where context and analysis make all the
              difference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact Us</h2>
            <p>
              Have a question, feedback, or a content suggestion? We&rsquo;d love to hear from you.
              Reach us at{" "}
              <a
                href="mailto:hello@factverseinsight.com"
                className="text-primary hover:underline font-medium"
              >
                hello@factverseinsight.com
              </a>{" "}
              or follow us on{" "}
              <a
                href="https://twitter.com/factverseinsights"
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                X (Twitter)
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link href="/" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
            ← Back to stories
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
