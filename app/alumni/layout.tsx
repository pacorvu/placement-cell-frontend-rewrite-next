"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

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
                  <Link href="/alumni/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/alumni/directory">Directory</Link>
                </li>
                <li>
                  <Link href="/alumni/projects">Student Projects</Link>
                </li>
                <li>
                  <Link href="/alumni/referral">Refer HR</Link>
                </li>
                <li>
                  <Link href="/alumni/profile">Profile</Link>
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
                <Link href="/alumni/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/alumni/directory">Directory</Link>
              </li>
              <li>
                <Link href="/alumni/projects">Student Projects</Link>
              </li>
              <li>
                <Link href="/alumni/referral">Refer HR</Link>
              </li>
              <li>
                <Link href="/alumni/profile">Profile</Link>
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
      <main className="flex-1">{children}</main>
    </div>
  );
}
