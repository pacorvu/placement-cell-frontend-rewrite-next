import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../public/output.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" data-theme="light">
      <body className="antialiased flex min-h-screen flex-col">
        {/* ================= NAVBAR ================= */}
        <header className="bg-base-100 shadow-sm">
          <div className="navbar max-w-7xl mx-auto px-4 lg:px-8">
            {/* Left */}
            <div className="navbar-start">
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a href="#home">Home</a>
                  </li>
                  <li>
                    <a href="#about">About</a>
                  </li>
                  <li>
                    <a href="#company">Company</a>
                  </li>
                  <li>
                    <a href="#contact">Contact</a>
                  </li>
                </ul>
              </div>
              <a href="/" className="btn btn-ghost text-xl normal-case">
                Paco
              </a>
            </div>

            {/* Center */}
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1">
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#company">Company</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>

            {/* Right */}
            <div className="navbar-end">
              <a href="#login" className="btn btn-primary">
                Login
              </a>
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="bg-base-200 text-base-content">
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <aside>
              <div className="text-2xl font-bold mb-2">CarvU</div>
              <p className="text-sm opacity-80">
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
                    href="mailto:placements@carvu.edu"
                    className="link link-hover"
                  >
                    placements@carvu.edu
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

            {/* Spacer for balance */}
            <div className="hidden md:block" />
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-base-300 py-4 text-center text-sm">
            © 2026 CarvU. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
