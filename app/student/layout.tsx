"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    } else {
      router.replace("/login");
    }
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwt_token: localStorage.getItem("access_token"),
        }),
      });
    } catch (err) {
      console.error("Logout request failed");
    } finally {
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      localStorage.setItem("theme", theme || "light");

      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="bg-base-100 shadow-sm border-b border-base-300">
        <div className="navbar max-w-7xl mx-auto px-4 lg:px-8">
          {/* ================= LEFT ================= */}
          <div className="navbar-start">
            {/* Mobile Dropdown */}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-56"
              >
                <li>
                  <Link href="/student/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/student/profile">Profile</Link>
                </li>
                <li>
                  <Link href="/student/drives">Placement Drives</Link>
                </li>
                <li>
                  <Link href="/student/offers">Job Offers</Link>
                </li>
                <li>
                  <Link href="/student/events">Events</Link>
                </li>
                <li>
                  <Link href="/student/policy">Policy</Link>
                </li>
              </ul>
            </div>

            {/* Brand */}
            <Link href="/" className="btn btn-ghost text-xl normal-case">
              Placement Cell
            </Link>
          </div>

          {/* ================= CENTER (Desktop) ================= */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/student/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/student/profile">Profile</Link>
              </li>
              <li>
                <Link href="/student/drives">Placement Drives</Link>
              </li>
              <li>
                <Link href="/student/offers">Job Offers</Link>
              </li>
              <li>
                <Link href="/student/events">Events</Link>
              </li>
              <li>
                <Link href="/student/policy">Policy</Link>
              </li>
            </ul>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="navbar-end gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-error btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
