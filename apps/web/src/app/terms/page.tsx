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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-500 mb-14">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Factverse Insights (&ldquo;the Site&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;), you agree to be bound by these Terms of Service. If you do not
              agree, please do not use the Site.
            </p>
          </Section>

          <Section title="2. AI-Generated Content Disclosure">
            <p>
              Articles published on Factverse Insights are produced with the assistance of
              artificial intelligence (Anthropic&rsquo;s Claude AI). While every article is based
              on a real source (YouTube video, news article, or publicly available information)
              and is reviewed before publication, AI-generated content may contain errors,
              omissions, or oversimplifications.
            </p>
            <p>
              <strong>
                Content on this site is for informational purposes only. It does not constitute
                professional advice of any kind — including legal, financial, medical, or
                investment advice. Always consult a qualified professional before making decisions
                based on information you read here.
              </strong>
            </p>
          </Section>

          <Section title="3. Permitted Use">
            <p>You may read, share, and link to articles on the Site for personal, non-commercial purposes. You may not:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Reproduce or republish articles in bulk without written permission</li>
              <li>Use automated tools to scrape the Site at a scale that degrades performance</li>
              <li>Use the Site&rsquo;s content to train a competing AI product without permission</li>
              <li>Attempt to access the admin area without authorisation</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            <p>
              The articles, design, logo, and all other content on Factverse Insights are owned by
              or licensed to us. Original source material (YouTube videos, news articles) remains
              the property of its respective copyright holders. Our articles are derivative works
              created for the purpose of commentary and editorial reporting.
            </p>
          </Section>

          <Section title="5. Accuracy and Corrections">
            <p>
              We make reasonable efforts to ensure articles are accurate and up to date. If you
              spot an error or inaccuracy, please let us know via the About page and we will
              review and correct it promptly.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Factverse Insights is not liable
              for any direct, indirect, incidental, or consequential damages arising from your use
              of the Site or reliance on any content published here.
            </p>
          </Section>

          <Section title="7. External Links">
            <p>
              Articles may contain links to external websites (e.g., YouTube videos, news sources).
              We are not responsible for the content, privacy practices, or accuracy of external
              sites. These links are provided for reference only.
            </p>
          </Section>

          <Section title="8. Modifications">
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on
              this page with an updated effective date. Continued use of the Site after any changes
              constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              These Terms are governed by applicable laws. Any disputes will be resolved in
              accordance with those laws.
            </p>
          </Section>
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
