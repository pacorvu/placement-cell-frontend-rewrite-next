"use client";
import ThemeToggle from "../components/ThemeToggle";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Deloitte",
    "Goldman Sachs",
    "TCS",
    "Infosys",
    "KPMG",
    "Samsung",
    "IBM",
    "Accenture",
    "Capgemini",
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      company: "Google",
      role: "Software Engineer",
      quote:
        "The placement cell provided excellent guidance and support throughout the process. The mock interviews were invaluable.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Arjun Patel",
      company: "Goldman Sachs",
      role: "Analyst",
      quote:
        "Mock interviews and resume building workshops were game changers. Highly recommend the placement training.",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Sneha Kumar",
      company: "Amazon",
      role: "SDE-2",
      quote:
        "Getting placed at Amazon was a dream come true. The college placement team made it possible with their dedicated support.",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      {/* ================= NAVBAR ================= */}
      <header className="bg-base-100 shadow-sm sticky top-0 z-50">
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
                className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li><Link href="/#home" className="scroll-smooth">Home</Link></li>
                <li><Link href="/#about" className="scroll-smooth">About</Link></li>
                <li><Link href="/#recruiters" className="scroll-smooth">Recruiters</Link></li>
                <li><Link href="/#contact" className="scroll-smooth">Contact</Link></li>
              </ul>
            </div>
            <Link href="/" className="btn btn-ghost text-xl normal-case">
              Placement Cell RVU
            </Link>
          </div>

          {/* Center - Desktop */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li><Link href="/#home" className="scroll-smooth">Home</Link></li>
              <li><Link href="/#about" className="scroll-smooth">About</Link></li>
              <li><Link href="/#recruiters" className="scroll-smooth">Recruiters</Link></li>
              <li><Link href="/#contact" className="scroll-smooth">Contact</Link></li>
            </ul>
          </div>

          {/* Right */}
          <div className="navbar-end gap-2">
            <Link href="/login" className="btn btn-outline btn-primary">
              Login
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 ${mounted ? "animate-fade-in" : "opacity-0"}`}
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Launch Your
                <span className="block bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>
              <p className="text-xl text-base-content/70 leading-relaxed">
                Connect with world-class recruiters and land your dream job at RV University. Get expert guidance, comprehensive training, and exclusive opportunities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="/#recruiters" className="btn btn-outline btn-lg scroll-smooth">
                  View Companies
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-2 gap-6 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="card-body">
                  <div className="text-5xl font-bold">90%+</div>
                  <div className="text-sm opacity-90">Placement Rate</div>
                </div>
              </div>
              <div
                className="card bg-gradient-to-br from-secondary to-secondary-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "100ms" }}
              >
                <div className="card-body">
                  <div className="text-5xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Recruiters</div>
                </div>
              </div>
              <div
                className="card bg-gradient-to-br from-accent to-accent-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "200ms" }}
              >
                <div className="card-body">
                  <div className="text-4xl font-bold">30 LPA</div>
                  <div className="text-sm opacity-90">Highest Package</div>
                </div>
              </div>
              <div
                className="card bg-gradient-to-br from-info to-info-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "300ms" }}
              >
                <div className="card-body">
                  <div className="text-4xl font-bold">8-12 LPA</div>
                  <div className="text-sm opacity-90">Average Package</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">About Placement Cell RVU</h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              The Career Development and Placement Cell at RV University empowers students with tailored career guidance, skill-building workshops, mock interviews, industry networking, and strong recruiter connections to launch successful careers.
            </p>
          </div>
          {/* Add more content, images, or timeline here later */}
        </div>
      </section>

      {/* ================= TOP RECRUITERS ================= */}
      <section id="recruiters" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Top Recruiters
            </h2>
            <p className="text-xl text-base-content/60">
              Our students are trusted by leading companies across tech, finance, consulting, and more.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <div
                key={company}
                className="card bg-base-100 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer h-32 flex items-center justify-center"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h3 className="font-semibold text-lg text-center px-4">
                  {company}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SUCCESS STORIES ================= */}
      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-base-content/60">
              Hear from our alumni who launched their dream careers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="card-body">
                  <div
                    className={`bg-gradient-to-br ${testimonial.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4`}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <p className="text-base-content/70 italic mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="divider my-2"></div>
                  <div>
                    <h3 className="font-bold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-base-content/60">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Have questions about placements, training, or recruitment? Reach out to us!
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Contact Information</h3>
                <ul className="space-y-4 mt-4">
                  <li>
                    <strong>Email:</strong> admissions@rvu.edu.in (for placement inquiries)
                  </li>
                  <li>
                    <strong>Phone:</strong> +91 89511 79896
                  </li>
                  <li>
                    <strong>Address:</strong><br />
                    RV Vidyanikethan Post, 8th Mile, Mysuru Road,<br />
                    Bengaluru – 560 059
                  </li>
                </ul>
              </div>
            </div>
            {/* You can add a form here later */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Quick Message</h3>
                <p className="text-base-content/70 mt-4">
                  For now, please email us directly at admissions@rvu.edu.in. Full contact form coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional CTA - uncomment if wanted */}
      {/* <section className="py-20 bg-gradient-to-br from-primary to-secondary text-primary-content">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of RV University students building bright futures.
          </p>
          <Link href="/login" className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none shadow-2xl gap-2">
            Login to Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section> */}
    </div>
  );
}