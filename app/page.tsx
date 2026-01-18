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
    "Adobe",
    "Goldman Sachs",
    "JP Morgan",
    "Deloitte",
    "TCS",
    "Infosys",
    "Wipro",
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
    <div className="min-h-screen bg-linear-to-br from-base-100 via-base-200 to-base-100">
      {/* Hero Section */}
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
              Placement Cell RVU
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
          <div className="navbar-end mr-2">
            <a href="/login" className="btn btn-outline btn-primary">
              Login
            </a>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 ${mounted ? "animate-fade-in" : "opacity-0"}`}
            >
              {/* <div className="inline-block">
                <div className="badge badge-primary badge-lg gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Top Placement Record
                </div>
              </div> */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Launch Your
                <span className="block bg-linear-to-br from-primary to-secondary bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>
              <p className="text-xl text-base-content/70 leading-relaxed">
                Connect with world-class recruiters and land your dream job. Get
                expert guidance, comprehensive training, and exclusive
                opportunities.
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
                <Link href="#recruiters" className="btn btn-outline btn-lg">
                  View Companies
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div
              className={`grid grid-cols-2 gap-6 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="card bg-linear-to-br from-primary to-primary-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="card-body">
                  <div className="text-5xl font-bold">95%</div>
                  <div className="text-sm opacity-90">Placement Rate</div>
                </div>
              </div>
              <div
                className="card bg-linear-to-br from-secondary to-secondary-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "100ms" }}
              >
                <div className="card-body">
                  <div className="text-5xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Recruiters</div>
                </div>
              </div>
              <div
                className="card bg-linear-to-br from-accent to-accent-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "200ms" }}
              >
                <div className="card-body">
                  <div className="text-4xl font-bold">45 LPA</div>
                  <div className="text-sm opacity-90">Highest Package</div>
                </div>
              </div>
              <div
                className="card bg-linear-to-br from-info to-info-focus text-primary-content shadow-2xl transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "300ms" }}
              >
                <div className="card-body">
                  <div className="text-4xl font-bold">12 LPA</div>
                  <div className="text-sm opacity-90">Average Package</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Recruiters */}
      <section id="recruiters" className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Top Recruiters
            </h2>
            <p className="text-xl text-base-content/60">
              Trusted by leading companies worldwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <div
                key={company}
                className="card bg-base-100 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer h-32"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="card-body items-center justify-center p-4">
                  <h3 className="font-semibold text-base text-center leading-tight">
                    {company}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-base-content/60">
              Hear from our successful alumni
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
                    className={`bg-linear-to-br ${testimonial.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4`}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <p className="text-base-content/70 italic mb-6">
                    &quot;{testimonial.quote}&quot;
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

      {/* CTA Section
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-content mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-content/90 mb-8">
            Join thousands of students who have successfully launched their
            careers
          </p>
          <Link
            href="/login"
            className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 border-none shadow-2xl gap-2"
          >
            Login to Dashboard
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
        </div>
      </section> */}
    </div>
  );
}
