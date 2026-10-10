"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Simulate inquiry submission with immediate success feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 600);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Support & Feedback</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Have feedback on a test question, an inquiry about the platform, or partnership questions? Reach out to us.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        {/* Contact Info */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base font-semibold text-slate-900">Direct Inquiries</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-900">Email Support</span>
                  <p className="text-slate-500">support@examdesk.io</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-900">Response Window</span>
                  <p className="text-slate-500">Usually responds within 24–48 hours on business days.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Frequently Asked</h3>
            <ul className="mt-3 space-y-3 text-xs text-slate-600 leading-relaxed">
              <li>
                <strong>Are the mock tests free?</strong>
                <p className="text-slate-500">Yes, public practice drills and notes can be explored freely by all students.</p>
              </li>
              <li>
                <strong>How can I report an inaccurate answer?</strong>
                <p className="text-slate-500">Use this contact form with the Test Title and Question ID so our academic team can review it.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 md:col-span-3">
          <h2 className="text-lg font-semibold text-slate-900">Send us a Message</h2>

          {submitted && (
            <div className="my-4 flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your message has been received. Our team will review it shortly.</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="name">
                Full Name
              </label>
              <input
                className="mt-1.5 h-11 w-full rounded border border-slate-300 px-3 text-sm text-slate-950 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                id="name"
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Jane Doe"
                required
                type="text"
                value={formState.name}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="email">
                Email Address
              </label>
              <input
                className="mt-1.5 h-11 w-full rounded border border-slate-300 px-3 text-sm text-slate-950 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                id="email"
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                placeholder="jane@example.com"
                required
                type="email"
                value={formState.email}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="subject">
                Subject
              </label>
              <input
                className="mt-1.5 h-11 w-full rounded border border-slate-300 px-3 text-sm text-slate-950 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                id="subject"
                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                placeholder="Question feedback / Platform inquiry"
                required
                type="text"
                value={formState.subject}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="message">
                Your Message
              </label>
              <textarea
                className="mt-1.5 w-full rounded border border-slate-300 p-3 text-sm text-slate-950 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                id="message"
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                placeholder="Describe your inquiry or feedback in detail..."
                required
                rows={4}
                value={formState.message}
              />
            </div>

            <button
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "Sending..." : "Submit Message"}</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
