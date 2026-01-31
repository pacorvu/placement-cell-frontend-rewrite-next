"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: AlumniData[];
}

export default function AlumniDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const limit = 50;

  // Fetch alumni data
  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/all?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch alumni data");
        }

        const data: ApiResponse = await response.json();
        setAlumni(data.data);
        setTotalAlumni(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [currentPage]);

  // Get unique batches from fetched data
  const batches = Array.from(
    new Set(
      alumni
        .map((a) => a.graduation_year)
        .filter((year): year is number => year !== null),
    ),
  ).sort((a, b) => b - a);

  // Filter alumni
  const filteredAlumni = alumni.filter((alumniItem) => {
    const matchesSearch =
      alumniItem.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alumniItem.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (alumniItem.current_company
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);

    const matchesBatch =
      selectedBatch === "all" ||
      alumniItem.graduation_year?.toString() === selectedBatch;

    return matchesSearch && matchesBatch;
  });

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/alumni/dashboard"
              className="btn btn-ghost btn-sm gap-2"
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
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Alumni Directory
          </h1>
          <p className="text-lg text-base-content/70">
            Connect with fellow alumni
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Search alumni by name, USN, or company
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Batch Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Graduation Year
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="all">All Years</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch.toString()}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4">
              <p className="text-sm text-base-content/60">
                Showing {filteredAlumni.length} of {totalAlumni} alumni
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error shadow-lg mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Alumni Cards Grid */}
        {!loading && !error && filteredAlumni.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map((alumniItem) => (
                <Link
                  key={alumniItem.id}
                  href={`/alumni/${alumniItem.user_id}`}
                  className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
                >
                  <div className="card-body flex flex-col h-full">
                    {/* CONTENT (grows) */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-16 h-16 flex items-center justify-center">
                            <span className="text-xl font-semibold">
                              {alumniItem.full_name
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((word) => word[0]?.toUpperCase())
                                .join("")}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg line-clamp-1">
                            {alumniItem.full_name}
                          </h3>

                          {alumniItem.usn && (
                            <p className="text-sm text-base-content/60 line-clamp-1">
                              {alumniItem.usn}
                            </p>
                          )}

                          {alumniItem.graduation_year && (
                            <div className="badge badge-sm badge-primary mt-1">
                              Class of {alumniItem.graduation_year}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="divider my-2" />

                      {/* Employment Info */}
                      <div className="space-y-2">
                        {alumniItem.current_company && (
                          <div className="flex items-center gap-2 min-w-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-primary shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <p className="text-sm font-medium line-clamp-1">
                              {alumniItem.current_company}
                            </p>
                          </div>
                        )}

                        {alumniItem.current_designation && (
                          <p className="text-sm text-base-content/70 line-clamp-2">
                            {alumniItem.current_designation}
                          </p>
                        )}

                        {alumniItem.current_work_location && (
                          <div className="flex items-center gap-2 min-w-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-base-content/60 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <p className="text-xs text-base-content/60 line-clamp-1">
                              {alumniItem.current_work_location}
                            </p>
                          </div>
                        )}

                        {!alumniItem.current_company &&
                          !alumniItem.current_designation &&
                          !alumniItem.current_work_location && (
                            <p className="text-sm text-base-content/60 italic line-clamp-2">
                              No employment information available
                            </p>
                          )}
                      </div>
                    </div>

                    {/* FOOTER (fixed at bottom) */}
                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-sm btn-primary gap-2">
                        View Profile
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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button className="join-item btn">
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="join-item btn"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          !loading &&
          !error && (
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div className="text-center py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-base-content/30 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">No alumni found</h3>
                  <p className="text-base-content/60">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
