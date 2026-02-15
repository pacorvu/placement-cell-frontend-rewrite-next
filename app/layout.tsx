import type { Metadata } from "next";
import "./globals.css";
import "../public/output.css";
import { Toaster } from "@/components/ui/sonner";
import { Cantarell } from "next/font/google";
import Providers from "@/lib/query-client";
import Link from "next/link";

const cantarell = Cantarell({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Placement Cell RVU",
  description: "Empowering RV University students with world-class placement opportunities and career guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        </head>
        <body
          className={`antialiased flex min-h-screen flex-col ${cantarell.className}`}
        >
          {/* ================= NAVBAR ================= */}
          {/* (You can move navbar here later if you want it in layout; for now it's in home) */}

          {/* ================= MAIN ================= */}
          <main className="flex-1">{children}</main>

          {/* ================= FOOTER ================= */}
          <footer className="bg-base-200 text-base-content">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 gap-8 md:grid-cols-4">
              {/* Brand — spans 2 columns */}
              <aside className="md:col-span-2">
                <div className="text-2xl font-bold mb-2">Placement Cell RVU</div>
                <p className="text-sm opacity-80 max-w-md">
                  Empowering RV University students to achieve their career goals through world-class placement opportunities, training, and industry connections.
                </p>
              </aside>

              {/* Quick Links */}
              <nav>
                <h6 className="footer-title">Quick Links</h6>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="link link-hover">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/#about" className="link link-hover scroll-smooth">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/#recruiters" className="link link-hover scroll-smooth">
                      Recruiters
                    </Link>
                  </li>
                  <li>
                    <Link href="/#contact" className="link link-hover scroll-smooth">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Contact — using real RV University data */}
              <nav>
                <h6 className="footer-title">Contact</h6>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="mailto:admissions@rvu.edu.in"
                      className="link link-hover"
                    >
                      admissions@rvu.edu.in
                    </a>
                  </li>
                  <li>
                    <a href="tel:+918951179896" className="link link-hover">
                      +91 89511 79896
                    </a>
                  </li>
                  <li>
                    <a href="tel:+916366985882" className="link link-hover">
                      +91 63669 85882 (Admissions)
                    </a>
                  </li>
                  <li className="opacity-80">
                    RV Vidyanikethan Post, 8th Mile, Mysuru Road, Bengaluru – 560 059
                  </li>
                </ul>
              </nav>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-base-300 py-4 text-center text-sm">
              © {new Date().getFullYear()} Placement Cell RVU – Powered by RV University. All rights reserved.
            </div>
          </footer>
          <Toaster />
        </body>
      </html>
    </Providers>
  );
}