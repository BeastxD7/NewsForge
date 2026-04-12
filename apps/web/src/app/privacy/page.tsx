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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-14">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10">
          <Section title="1. Overview">
            <p>
              Factverse Insights (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates
              the website{" "}
              <a href={SITE_URL} className="text-primary hover:underline">
                factverseinsight.com
              </a>
              . This Privacy Policy explains what information we collect, how we use it, and your
              rights in relation to it. By using our site, you agree to the practices described here.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>
              <strong>a) Information you provide.</strong> If you create an account (admin users
              only), we collect your email address and a hashed password. We never store plain-text
              passwords.
            </p>
            <p>
              <strong>b) Usage data.</strong> We automatically collect standard server logs when
              you visit our site — your IP address, browser type, referring URL, and pages visited.
              This data is used solely for security monitoring and site performance analysis. It is
              not sold or shared with advertising networks.
            </p>
            <p>
              <strong>c) Cookies.</strong> We use a single session cookie (set by NextAuth) to
              keep admin users signed in. Public readers are not tracked with cookies. We do not
              use advertising cookies, tracking pixels, or third-party analytics scripts.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the data we collect to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Authenticate admin users and keep sessions secure</li>
              <li>Monitor and protect the security of the site</li>
              <li>Improve site performance and diagnose technical issues</li>
              <li>Respond to enquiries sent to us directly by email</li>
            </ul>
            <p>We do not use your data for advertising or sell it to third parties.</p>
          </Section>

          <Section title="4. AI-Generated Content">
            <p>
              Articles on this site are generated with the assistance of AI (Anthropic&rsquo;s
              Claude). Transcripts and source material processed by our pipeline are sent to
              Anthropic&rsquo;s API in order to generate article content. Please review{" "}
              <a
                href="https://www.anthropic.com/privacy"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic&rsquo;s Privacy Policy
              </a>{" "}
              for how they handle API data.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Server logs are retained for up to 30 days. Admin account data is retained for as
              long as the account is active. You may request deletion of your account at any time
              by contacting us.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>
              Depending on your location, you may have the right to access, correct, or delete
              personal data we hold about you. To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:hello@factverseinsight.com"
                className="text-primary hover:underline"
              >
                hello@factverseinsight.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="7. Third-Party Services">
            <p>We use the following third-party services to operate the site:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Anthropic Claude</strong> — AI article generation (API calls only; no
                personal reader data is sent)
              </li>
              <li>
                <strong>Pexels</strong> — Stock photography for article cover images
              </li>
              <li>
                <strong>YouTube / Google</strong> — Video transcripts for source content
              </li>
            </ul>
          </Section>

          <Section title="8. Security">
            <p>
              We use HTTPS, hashed passwords (bcrypt), and industry-standard database security
              practices. No system is perfectly secure; if you discover a vulnerability, please
              report it to{" "}
              <a
                href="mailto:hello@factverseinsight.com"
                className="text-primary hover:underline"
              >
                hello@factverseinsight.com
              </a>
              .
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. When we do, we will update the effective
              date at the top of this page. Continued use of the site after changes constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about this policy? Email us at{" "}
              <a
                href="mailto:hello@factverseinsight.com"
                className="text-primary hover:underline font-medium"
              >
                hello@factverseinsight.com
              </a>
              .
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
