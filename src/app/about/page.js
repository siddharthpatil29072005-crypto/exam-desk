import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Award, Users, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Us | Exam Desk",
  description: "Learn about Exam Desk, our mission, and our exam preparation platform.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Our Story & Purpose</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          About Exam Desk
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Empowering students and job aspirants with realistic, structured, and distraction-free exam practice.
        </p>
      </div>

      <div className="mt-8 space-y-10 text-slate-700 leading-7 text-sm sm:text-base">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Our Mission</h2>
          <p className="mt-3">
            Preparing for competitive entrance tests, university exams, and professional certifications can be overwhelming. Many existing test portals are cluttered, slow, or hide essential practice behind excessive paywalls.
          </p>
          <p className="mt-3">
            <strong>Exam Desk</strong> was created with a clear objective: provide students with a fast, modern, and accessible testing environment. We offer timed practice drills, full-length simulations, and comprehensive revision notes designed to build real confidence on exam day.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <Award className="h-6 w-6 text-blue-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Realistic Simulations</h3>
            <p className="mt-1 text-xs text-slate-500 leading-5">
              Timed mock tests with authentic question distributions and negative marking rubrics.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <Sparkles className="h-6 w-6 text-blue-700" />
            <h3 className="mt-3 font-semibold text-slate-900">AI-Assisted Quality</h3>
            <p className="mt-1 text-xs text-slate-500 leading-5">
              Carefully generated and curated questions designed to assess conceptual mastery.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <Users className="h-6 w-6 text-blue-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Student First</h3>
            <p className="mt-1 text-xs text-slate-500 leading-5">
              Clear score analytics and detailed answer keys so you learn from every mistake.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">What We Offer</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Topic-Wise Practice Drills:</strong> Target your specific weaknesses in Math, Science, Reasoning, or Aptitude.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Full-Length Timed Mocks:</strong> Experience real test pressure with strict timers and instant score breakdown.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Revision Notes:</strong> High-yield formulas, core principles, and topic summaries for last-minute revision.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Progress Dashboard:</strong> Review previous attempts and monitor score improvements over time.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Get in Touch</h2>
          <p className="mt-2 text-sm text-slate-600">
            Have questions, feedback on a question, or suggestions for new exams to include? We are continuously updating our question repository.
          </p>
          <div className="mt-4">
            <Link
              className="inline-flex items-center gap-2 rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              href="/contact"
            >
              Contact Our Team
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
