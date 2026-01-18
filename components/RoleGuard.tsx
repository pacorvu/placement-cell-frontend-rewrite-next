"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useHandleLogout } from "@/components/HandleLogout";

type RoleGuardProps = {
  requiredRole: string;
  children: React.ReactNode;
};

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const handleLogout = useHandleLogout();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/role`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        const data = await res.json();
        setAllowed(data.role_name === requiredRole);
      } catch {
        setAllowed(false);
      }
    };

    checkRole();
  }, [requiredRole]);

  // Loading state
  if (allowed === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );

  // Access Denied state
  if (allowed === false)
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <header
          className="bg-base-100 shadow-sm border-b border-base-300"
          data-theme="light"
        >
          <div className="navbar max-w-7xl mx-auto px-4 lg:px-8">
            <Link href="/" className="btn btn-ghost text-xl normal-case">
              Placement Cell
            </Link>
            <div className="navbar-end gap-2 ml-auto">
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-error btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <p className="text-xl font-semibold text-error">
          Access Denied: You do not have permission to view this page.
        </p>
      </div>
    );

  // Allowed state
  return <>{children}</>;
}
