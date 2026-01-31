"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

interface AlumniProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface AlumniData {
  id: number;
  usn: string | null;
  full_name: string;
  graduation_year: number | null;
  current_company: string | null;
  current_designation: string | null;
  current_work_location: string | null;
  phone_number: string | null;
  other_links: any;
  personal_email: string | null;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  refered_by: string | null;
}

// Helper function to detect link type and return appropriate icon
const getLinkIcon = (url: string) => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("linkedin.com")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-blue-600"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }

  if (lowerUrl.includes("github.com")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }

  if (lowerUrl.includes("instagram.com")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-pink-600"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    );
  }

  // Default globe icon for other links
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-base-content/60"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>
  );
};

// Helper function to get link name
const getLinkName = (url: string, key?: string) => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("linkedin.com")) return "LinkedIn";
  if (lowerUrl.includes("github.com")) return "GitHub";
  if (lowerUrl.includes("instagram.com")) return "Instagram";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
    return "Twitter/X";

  // Extract domain name for other links
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    // If can't extract domain and we have a key, capitalize it
    if (key) {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return "Website";
  }
};

export default function AlumniProfilePage({ params }: AlumniProfilePageProps) {
  const { id } = use(params);
  const [alumni, setAlumni] = useState<AlumniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlumniProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch alumni profile");
        }

        const data: AlumniData = await response.json();
        setAlumni(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniProfile();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                {error ? "Error Loading Profile" : "Alumni not found"}
              </h2>
              <p className="text-base-content/60 mb-6">
                {error ||
                  "The alumni profile you're looking for doesn't exist."}
              </p>
              <Link href="/alumni/directory" className="btn btn-primary">
                Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse other_links if it exists
  const otherLinks = alumni.other_links || {};
  const socialLinksArray = Object.entries(otherLinks).filter(
    ([key, value]) => value && typeof value === "string" && value.trim() !== "",
  );

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            href="/alumni/directory"
            className="btn btn-ghost btn-sm gap-2 mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to List
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Contact & Social */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div className="flex flex-col items-center text-center">
                  <div className="avatar placeholder mb-4">
                    <div className="bg-primary text-primary-content rounded-full w-24">
                      <span className="text-3xl">
                        {alumni.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-1">
                    {alumni.full_name}
                  </h1>
                  <div className="flex flex-col gap-1">
                    {alumni.usn && (
                      <p className="text-sm text-base-content/60">
                        {alumni.usn}
                      </p>
                    )}
                    {alumni.graduation_year && (
                      <p className="text-sm text-base-content/60">
                        Class of {alumni.graduation_year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
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
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact
                </h2>
                <div className="space-y-3">
                  {alumni.personal_email && (
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${alumni.personal_email}`}
                        className="text-sm link link-hover break-all"
                      >
                        {alumni.personal_email}
                      </a>
                    </div>
                  )}
                  {alumni.phone_number && (
                    <div className="flex items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-base-content/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-sm">{alumni.phone_number}</span>
                    </div>
                  )}
                  {!alumni.personal_email && !alumni.phone_number && (
                    <p className="text-sm text-base-content/60 italic">
                      No contact information available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            {socialLinksArray.length > 0 && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-4">
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
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Links
                  </h2>
                  <div className="space-y-3">
                    {socialLinksArray.map(([key, url]) => (
                      <a
                        key={key}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm link link-hover"
                      >
                        {getLinkIcon(url as string)}
                        <span className="flex-1">
                          {getLinkName(url as string, key)}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Referred By Card */}
            {alumni.refered_by && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-2">
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
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Referred By
                  </h2>
                  <p className="text-sm">{alumni.refered_by}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Employment */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Current Employment</h2>
                {alumni.current_company ||
                alumni.current_designation ||
                alumni.current_work_location ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {alumni.current_company && (
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">
                          Company
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {alumni.current_company}
                        </p>
                      </div>
                    )}
                    {alumni.current_designation && (
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">
                          Designation
                        </p>
                        <p className="text-lg font-bold">
                          {alumni.current_designation}
                        </p>
                      </div>
                    )}
                    {alumni.current_work_location && (
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">
                          Work Location
                        </p>
                        <p className="text-lg font-semibold">
                          {alumni.current_work_location}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>No employment information available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
