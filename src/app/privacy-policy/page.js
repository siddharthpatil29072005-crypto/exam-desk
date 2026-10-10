export const metadata = {
  title: "Privacy Policy | Exam Desk",
  description: "Privacy policy, cookies disclosure, and information practices for Exam Desk.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Legal & Transparency</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: October 2026
        </p>
      </div>

      <div className="prose prose-slate mt-8 max-w-none space-y-8 text-slate-700 leading-7 text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
          <p className="mt-2">
            Welcome to Exam Desk (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and protect your information when you visit our website, take practice tests, view study notes, and use our educational tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
          <p className="mt-2">
            We collect information that you provide voluntarily when creating an account, signing in, or completing tests:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong>Account details:</strong> Name, email address, and encrypted credentials.</li>
            <li><strong>Test performance data:</strong> Mock test scores, submission timestamps, answer selections, and completion history.</li>
            <li><strong>Log and usage data:</strong> Browser type, operating system, IP address, and pages visited to ensure platform stability and security.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Cookies and Web Beacons</h2>
          <p className="mt-2">
            Exam Desk uses &ldquo;cookies&rdquo; to store session authentication and track user preferences. You can choose to disable cookies through your individual browser options, though some features like saving test results may not function properly.
          </p>
        </section>

        <section className="rounded-lg border border-blue-200 bg-blue-50/50 p-6">
          <h2 className="text-xl font-semibold text-blue-950">4. Google AdSense & DoubleClick DART Cookies</h2>
          <p className="mt-2 text-blue-900">
            Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve advertisements to our site visitors based upon their visit to this site and other sites on the internet.
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-blue-900">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to Exam Desk and/or other sites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{" "}
              <a
                className="font-medium text-blue-800 underline hover:text-blue-950"
                href="https://www.google.com/settings/ads"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google Ads Settings
              </a>{" "}
              or by visiting{" "}
              <a
                className="font-medium text-blue-800 underline hover:text-blue-950"
                href="https://www.aboutads.info"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.aboutads.info
              </a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Third-Party Advertising Partners</h2>
          <p className="mt-2">
            Some of our advertising partners may use cookies and web beacons on our site. These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on Exam Desk. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize advertising content.
          </p>
          <p className="mt-2">
            Note that Exam Desk has no access to or control over these cookies that are used by third-party advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p className="mt-2">
            Under the California Consumer Privacy Act (CCPA), California consumers have the right to request that a business disclose the categories and specific pieces of personal data collected, delete personal data, and not sell the consumer&apos;s personal data. If you make a request, we will respond within one month.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. GDPR Data Protection Rights</h2>
          <p className="mt-2">
            Under the General Data Protection Regulation (GDPR), every user is entitled to the rights of access, rectification, erasure, restriction of processing, objection to processing, and data portability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">8. Children&apos;s Online Privacy Protection (COPPA)</h2>
          <p className="mt-2">
            Protecting the privacy of young children is especially important. Exam Desk does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child provided this kind of information on our website, please contact us immediately and we will promptly remove it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">9. Contact Us</h2>
          <p className="mt-2">
            If you have questions or suggestions about our Privacy Policy, do not hesitate to contact us at{" "}
            <a className="font-semibold text-blue-700 underline" href="/contact">
              our Contact Page
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
