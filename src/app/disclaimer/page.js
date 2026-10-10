export const metadata = {
  title: "Disclaimer | Exam Desk",
  description: "Educational and legal disclaimer for Exam Desk mock test platform.",
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Important Notices</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Disclaimer
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: October 2026
        </p>
      </div>

      <div className="prose prose-slate mt-8 max-w-none space-y-8 text-slate-700 leading-7 text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Educational Purpose Only</h2>
          <p className="mt-2">
            The information, test questions, practice materials, and revision notes provided on Exam Desk are strictly for general educational, self-assessment, and exam-preparation purposes. They are intended solely to help candidates practice time management and evaluate their conceptual understanding.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. No Affiliation with Examination Bodies</h2>
          <p className="mt-2">
            Exam Desk is an independent platform. Any references to specific examination names, certifications, boards, universities, or testing agencies (including but not limited to SAT, GRE, UPSC, JEE, NEET, CompTIA, AWS, NCLEX, etc.) are used purely for identification and nominative fair use.
          </p>
          <p className="mt-2">
            Exam Desk is not sponsored, endorsed by, affiliated with, or officially connected to any government agency, educational testing service, or certification vendor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Accuracy of Content</h2>
          <p className="mt-2">
            While our team and automated processes take every effort to ensure accuracy in question formulation, answer keys, and syllabus relevance, errors or omissions may occasionally occur. Exam Desk does not guarantee that the practice questions will appear on official exams, nor does it guarantee specific passing grades or scores.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. External Links and Advertising</h2>
          <p className="mt-2">
            The website may contain advertisements or links to external websites that are not provided or maintained by or in any way affiliated with Exam Desk. Please note that Exam Desk does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external sites.
          </p>
        </section>
      </div>
    </main>
  );
}
