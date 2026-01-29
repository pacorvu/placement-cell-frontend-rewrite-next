import type { Metadata } from "next";
import "./globals.css";
import "../public/output.css";
import { Toaster } from "@/components/ui/sonner";
import { Cantarell } from "next/font/google";

const cantarell = Cantarell({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "paco frontend",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`antialiased flex min-h-screen flex-col ${cantarell.className}`}
      >
        {/* ================= NAVBAR ================= */}

        {/* ================= MAIN ================= */}
        <main className="flex-1">{children}</main>

        {/* ================= FOOTER ================= */}
        <footer className="bg-base-200 text-base-content">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand — spans 2 columns */}
            <aside className="md:col-span-2">
              <div className="text-2xl font-bold mb-2">Placement Cell RVU</div>
              <p className="text-sm opacity-80 max-w-md">
                Empowering students to achieve their career goals through
                world-class placement opportunities.
              </p>
            </aside>

            {/* Quick Links */}
            <nav>
              <h6 className="footer-title">Quick Links</h6>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="link link-hover">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#placement" className="link link-hover">
                    Placement Process
                  </a>
                </li>
                <li>
                  <a href="#recruiters" className="link link-hover">
                    Recruiters
                  </a>
                </li>
                <li>
                  <a href="#contact" className="link link-hover">
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>

            {/* Contact */}
            <nav>
              <h6 className="footer-title">Contact</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:placements@rvu.edu.in"
                    className="link link-hover"
                  >
                    placements@rvu.edu.in
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="link link-hover">
                    +91 98765 43210
                  </a>
                </li>
                <li className="opacity-80">123 Education Lane, Tech City</li>
              </ul>
            </nav>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-base-300 py-4 text-center text-sm">
            © 2026 Placement Cell RVU. All rights reserved.
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
