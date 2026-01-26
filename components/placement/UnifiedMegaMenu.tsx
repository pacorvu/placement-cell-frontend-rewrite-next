import Link from "next/link";
import NavIcon, { IconKey } from "./NavIcon";

interface MenuItem {
  title: string;
  href: string;
  count?: number | string; // Optional badges/counts if needed
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { title: "Dashboard", href: "/placement/dashboard" },
      { title: "Calendar of Events", href: "/placement/calendar" },
      { title: "Monthly Reports", href: "/placement/reports" },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      { title: "View All Students", href: "/placement/student" },
      { title: "Alumni", href: "/placement/alumni" },
      { title: "User Management", href: "/placement/users" },
    ],
  },
  {
    title: "PLACEMENT",
    items: [
      { title: "Placement Drives", href: "/placement/drives" },
      { title: "Job Offers", href: "/placement/job-offers" },
      { title: "Companies", href: "/placement/companies" },
      { title: "Student Projects", href: "/placement/student-project" },
    ],
  },
];

export default function UnifiedMegaMenu() {
  return (
    <div className="absolute left-0 top-full w-full bg-base-100/95 backdrop-blur-xl border-b border-base-200 shadow-2xl 
                    transform origin-top transition-all duration-300 ease-out
                    invisible opacity-0 -translate-y-4 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0
                    z-50">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest px-2 pb-2 border-b border-base-200">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-base-content hover:bg-primary hover:text-primary-content rounded-lg transition-colors duration-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
