import type { Metadata } from "next"
import Link from "next/link"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://www.factverseinsight.com"
const EFFECTIVE_DATE = "1 April 2026"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Factverse Insights — how we collect, use, and protect your data.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
}

const sections = [
  {
    title: "1. Overview",
    content: (
      <p>
        Factverse Insights (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates{" "}
        <a href={SITE_URL} className="text-primary hover:underline">factverseinsight.com</a>.
        This Privacy Policy explains what information we collect, how we use it, and your rights.
        By using our site, you agree to the practices described here.
      </p>
    ),
  },
  {
    title: "2. Information We Collect",
    content: (
      <div className="space-y-3">
        <p>
          <strong className="text-foreground">a) Account data.</strong> Admin users provide an
          email address and password. Passwords are stored as bcrypt hashes — never in plain text.
        </p>
        <p>
          <strong className="text-foreground">b) Server logs.</strong> We collect standard
          request logs — IP address, browser type, referring URL, and pages visited — for security
          monitoring and performance analysis only. This data is never sold or shared with
          advertising networks.
        </p>
        <p>
          <strong className="text-foreground">c) Cookies.</strong> One session cookie (set by
          NextAuth) keeps admin users signed in. Public readers receive no cookies. We use no
          advertising cookies, tracking pixels, or third-party analytics.
        </p>
      </div>
    ),
  },
  {
    title: "3. How We Use Your Data",
    content: (
      <div className="space-y-3">
        <p>We use collected data only to:</p>
        <ul className="space-y-2 pl-1">
          {[
            "Authenticate admin users and maintain secure sessions",
            "Monitor site security and diagnose technical issues",
            "Improve site performance and reliability",
          ].map((item) => (
            <li key={item} className="flex gap-3 items-start">
              <span className="mt-2 size-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>We do not use your data for advertising and do not sell it to third parties.</p>
      </div>
    ),
  },
  {
    title: "4. AI-Generated Content",
    content: (
      <p>
        Articles are generated using Anthropic&rsquo;s Claude AI. Transcripts and source material
        are sent to Anthropic&rsquo;s API to produce article content. See{" "}
        <a
          href="https://www.anthropic.com/privacy"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Anthropic&rsquo;s Privacy Policy
        </a>{" "}
        for how they handle API data. No personal reader data is included in these API calls.
      </p>
    ),
  },
  {
    title: "5. Data Retention",
    content: (
      <p>
        Server logs are kept for up to 30 days. Admin account data is held for as long as the
        account remains active.
      </p>
    ),
  },
  {
    title: "6. Your Rights",
    content: (
      <p>
        Depending on your location, you may have the right to access, correct, or delete personal
        data we hold. We will make reasonable efforts to action such requests within 30 days.
        Email us at{" "}
        <a href="mailto:beast.steam002@gmail.com" className="text-primary hover:underline">
          beast.steam002@gmail.com
        </a>
        .
      </p>
    ),
  },
  {
    title: "7. Third-Party Services",
    content: (
      <div className="space-y-3">
        <p>We use these external services to operate the site:</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: "Anthropic Claude", role: "AI article generation — no reader data sent" },
            { name: "Pexels", role: "Stock photography for article cover images" },
            { name: "YouTube / Google", role: "Video transcripts as source material" },
          ].map((s) => (
            <div key={s.name} className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-border/60 p-4">
              <p className="font-semibold text-sm text-foreground mb-1">{s.name}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{s.role}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "8. Security",
    content: (
      <p>
        We use HTTPS, bcrypt password hashing, and industry-standard database security. No
        system is perfectly secure — if you discover a vulnerability, email us at{" "}
        <a href="mailto:beast.steam002@gmail.com" className="text-primary hover:underline">
          beast.steam002@gmail.com
        </a>.
      </p>
    ),
  },
  {
    title: "9. Changes to This Policy",
    content: (
      <p>
        We may update this policy from time to time. The effective date at the top of this page
        will be updated when changes occur. Continued use of the site constitutes acceptance.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="border-b border-border/60 bg-neutral-50 dark:bg-neutral-900/40">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Legal</p>
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Privacy Policy</h1>
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
