import "./globals.css";
import AppNavigation from "@/components/AppNavigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import Providers from "@/components/Providers";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://examdesk.io"),
  title: {
    default: "Exam Desk | Free Mock Tests & Practice Drills",
    template: "%s | Exam Desk",
  },
  description:
    "Prepare for competitive exams with timed mock tests, comprehensive revision notes, performance analytics, and topic-wise practice drills.",
  keywords: [
    "mock tests",
    "practice exams",
    "exam preparation",
    "timed drills",
    "study notes",
    "test analytics",
  ],
  authors: [{ name: "Exam Desk Team" }],
  creator: "Exam Desk",
  publisher: "Exam Desk",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Exam Desk",
    title: "Exam Desk | Free Mock Tests & Practice Drills",
    description:
      "Prepare for competitive exams with timed mock tests, comprehensive revision notes, performance analytics, and topic-wise practice drills.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Desk | Free Mock Tests & Practice Drills",
    description: "Timed practice tests and revision notes to accelerate your exam readiness.",
  },
};

export default function RootLayout({ children }) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html className="h-full antialiased" lang="en">
      <head>
        {adsenseClientId && (
          <Script
            async
            crossOrigin="anonymous"
            src={`https://page2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <Providers>
          <AppNavigation />
          <div className="flex-1">{children}</div>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}