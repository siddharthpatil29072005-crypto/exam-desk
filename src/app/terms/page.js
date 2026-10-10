export const metadata = {
  title: "Terms of Service | Exam Desk",
  description: "Terms and conditions for using the Exam Desk mock test platform.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Legal Agreement</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: October 2026
        </p>
      </div>

      <div className="prose prose-slate mt-8 max-w-none space-y-8 text-slate-700 leading-7 text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing or using Exam Desk, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Use License & Educational Nature</h2>
          <p className="mt-2">
            Exam Desk grants you a personal, non-exclusive, non-transferable license to view test questions, complete practice tests, and read revision notes solely for personal educational and exam preparation purposes.
          </p>
          <p className="mt-2">
            Under this license, you may not:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Modify or copy the materials for commercial reselling.</li>
            <li>Use automated scripts, bots, or scrapers to extract test questions or answer keys.</li>
            <li>Attempt to decompile or reverse engineer any software contained on Exam Desk.</li>
            <li>Bypass access control measures or administrative gates.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. User Accounts & Security</h2>
          <p className="mt-2">
            When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Disclaimer of Warranties</h2>
          <p className="mt-2">
            All materials on Exam Desk are provided &ldquo;as is&rdquo;. While we strive for accuracy in questions, explanations, and syllabus representation, Exam Desk makes no warranties, expressed or implied, regarding actual examination results, score guarantees, or error-free content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Limitation of Liability</h2>
          <p className="mt-2">
            In no event shall Exam Desk, its creators, or affiliates be liable for any damages arising out of the use or inability to use the materials on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Third-Party Links & Advertisements</h2>
          <p className="mt-2">
            Our platform may display advertisements or links to external websites. We do not endorse or assume responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Changes to Terms</h2>
          <p className="mt-2">
            Exam Desk may revise these Terms of Service at any time without prior notice. By continuing to use this website, you are agreeing to be bound by the current version of these Terms.
          </p>
        </section>
      </div>
    </main>
  );
}
