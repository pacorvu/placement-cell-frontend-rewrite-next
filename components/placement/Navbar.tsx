"use client";

import Link from "next/link";
import MegaMenu from "./MegaMenu";
import ThemeToggle from "../ThemeToggle";
import { usePathname } from "next/navigation";

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  // Highlight active link if needed, or stick to simple nav
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full bg-base-100/80 backdrop-blur-md border-b border-base-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">

        {/* LEFT: Branding */}
        <div className="flex items-center gap-4">
          <Link href="/placement/dashboard" className="flex items-center gap-2 group">
            {/* Logo placeholder - replace with actual Image if available */}
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-content font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              PC
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight">Placement Cell</span>
              <span className="text-xs text-base-content/60 font-medium tracking-widest uppercase">RV University</span>
            </div>
          </Link>
        </div>

        {/* CENTER: Mega Navigation */}
        <nav className="hidden lg:flex items-stretch h-full">
          <Link href="/placement/dashboard" className="btn btn-ghost rounded-none h-full px-6 text-sm font-medium uppercase tracking-wide opacity-80 hover:opacity-100 transition-opacity flex items-center">
            Dashboard
          </Link>

          <MegaMenu
            title="People"
            items={[
              { title: "Students", href: "/placement/student", description: "Manage student profiles and data.", icon: "Student" },
              { title: "Alumni", href: "/placement/alumni", description: "Alumni network and connections.", icon: "Alumni" },
              { title: "User Management", href: "/placement/users", description: "Admin access and roles.", icon: "Users" },
            ]}
          />

          <MegaMenu
            title="Recruitment"
            items={[
              { title: "Placement Drives", href: "/placement/drives", description: "Ongoing and past drives.", icon: "Company" },
              { title: "Job Offers", href: "/placement/job-offers", description: "Manage offers and acceptances.", icon: "Job" },
              { title: "Companies", href: "/placement/companies", description: "Recruiter database.", icon: "Company" },
              { title: "Student Projects", href: "/placement/student-projects", description: "Track academic projects.", icon: "Project" },
            ]}
          />

          <MegaMenu
            title="Operations"
            items={[
              { title: "Calendar", href: "/placement/calendar", description: "Schedule and events.", icon: "Calendar" },
              { title: "Reports", href: "/placement/reports", description: "Analytics and exports.", icon: "Report" },
            ]}
          />
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="h-8 w-px bg-base-300 mx-1"></div>
          <button
            onClick={onLogout}
            className="btn btn-sm btn-error btn-outline hover:btn-active transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
