import "./globals.css";
import AppNavigation from "@/components/AppNavigation";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Exam Desk | Mock Tests",
  description: "Practice exams and track your progress.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}