import type { Metadata } from "next"
import Link from "next/link"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://www.factverseinsight.com"
const EFFECTIVE_DATE = "1 April 2026"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Factverse Insights — the rules governing your use of the site.",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
}

const sections = [
  {
    title: "1. Acceptance",
    content: (
      <p>
        By accessing or using Factverse Insights (&ldquo;the Site&rdquo;), you agree to be bound
        by these Terms of Service. If you do not agree, please do not use the Site.
      </p>
    ),
  },
  {
    title: "2. AI Content Disclosure",
    content: (
      <div className="space-y-3">
        <p>
          Articles are produced with the assistance of AI (Anthropic&rsquo;s Claude). Every article
          is based on a real source and reviewed before publication, but AI-generated content may
          contain errors, omissions, or oversimplifications.
        </p>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 leading-relaxed">
            Content on this site is for informational purposes only. It does not constitute
            professional advice — legal, financial, medical, or otherwise. Always consult a
            qualified professional before acting on information read here.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "3. Permitted Use",
    content: (
      <div className="space-y-3">
        <p>You may read, share, and link to articles for personal, non-commercial purposes.</p>
        <p>You may <strong className="text-foreground">not</strong>:</p>
        <ul className="space-y-2 pl-1">
          {[
            "Reproduce or republish articles in bulk without written permission",
            "Scrape the Site at a scale that degrades performance for other users",
            "Use Site content to train a competing AI product without permission",
            "Attempt to access the admin area without authorisation",
          ].map((item) => (
            <li key={item} className="flex gap-3 items-start">
              <span className="mt-2 size-1.5 rounded-full bg-destructive/70 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "4. Intellectual Property",
    content: (
      <p>
        Articles, design, logo, and all other content are owned by or licensed to us. Original
        source material (videos, news articles) remains property of its respective copyright
        holders. Our articles are derivative works created for commentary and editorial reporting.
      </p>
    ),
  },
  {
    title: "5. Accuracy",
    content: (
      <p>
        We make reasonable efforts to ensure accuracy. If you spot an error, email{" "}
        <a href="mailto:beast.steam002@gmail.com" className="text-primary hover:underline">
          beast.steam002@gmail.com
        </a>{" "}
        and we will review it promptly.
      </p>
    ),
  },
  {
    title: "6. Limitation of Liability",
    content: (
      <p>
        To the maximum extent permitted by applicable law, Factverse Insights is not liable for
        any direct, indirect, incidental, or consequential damages arising from your use of the
        Site or reliance on any content published here.
      </p>
    ),
  },
  {
    title: "7. External Links",
    content: (
      <p>
        Articles may link to external sites (e.g., YouTube, news sources). We are not responsible
        for their content, privacy practices, or accuracy. Links are provided for reference only.
      </p>
    ),
  },
  {
    title: "8. Modifications",
    content: (
      <p>
        We may update these Terms at any time. Changes take effect when posted with an updated
        effective date. Continued use of the Site constitutes acceptance.
      </p>
    ),
  },
  {
    title: "9. Governing Law",
    content: (
      <p>
        These Terms are governed by applicable laws. Disputes will be resolved in accordance with
        those laws.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="border-b border-border/60 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal</p>
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Terms of Service</h1>
            <p className="text-sm text-neutral-500">Effective date: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        {/* ── Sections ── */}
        <div className="max-w-3xl mx-auto px-6 py-14 space-y-12">
          {sections.map((s, i) => (
            <section key={i} className="grid sm:grid-cols-[200px_1fr] gap-6 sm:gap-10 items-start">
              <h2 className="text-sm font-bold text-foreground pt-0.5 leading-snug">{s.title}</h2>
              <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                {s.content}
              </div>
            </section>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-6 pb-16 border-t border-border/60 pt-8">
          <Link href="/" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
            ← Back to stories
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
