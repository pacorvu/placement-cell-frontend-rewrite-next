"use client";

import Link from "next/link";
import { useState } from "react";
import { mockAlumni } from "@/lib/mock-alumni-data";

export default function AlumniDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Get unique batches and departments
  const batches = Array.from(
    new Set(mockAlumni.map((a) => a.batchYear))
  ).sort((a, b) => b - a);
  const departments = Array.from(
    new Set(mockAlumni.map((a) => a.department))
  ).sort();

  // Filter alumni
  const filteredAlumni = mockAlumni.filter((alumni) => {
    const matchesSearch =
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.currentEmployment.company
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesBatch =
      selectedBatch === "all" || alumni.batchYear.toString() === selectedBatch;

    const matchesDepartment =
      selectedDepartment === "all" || alumni.department === selectedDepartment;

    return matchesSearch && matchesBatch && matchesDepartment;
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span className="label-text font-semibold">Batch Year</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch.toString()}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Department</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4">
              <p className="text-sm text-base-content/60">
                Showing {filteredAlumni.length} of {mockAlumni.length} alumni
              </p>
            </div>
          </div>
        </div>

        {/* Alumni Cards Grid */}
        {filteredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumni) => (
              <Link
                key={alumni.id}
                href={`/alumni/${alumni.usn}`}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="card-body">
                  {/* Header with Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-16">
                        <span className="text-xl">
                          {alumni.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{alumni.name}</h3>
                      <p className="text-sm text-base-content/60">
                        {alumni.usn}
                      </p>
                      <div className="badge badge-sm badge-primary mt-1">
                        {alumni.batch}
                      </div>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  {/* Current Employment */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-primary"
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
                      <p className="text-sm font-medium">
                        {alumni.currentEmployment.company}
                      </p>
                    </div>
                    <p className="text-sm text-base-content/70">
                      {alumni.currentEmployment.designation}
                    </p>
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-base-content/60"
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
                      <p className="text-xs text-base-content/60">
                        {alumni.currentEmployment.location}
                      </p>
                    </div>
                  </div>

                  {/* View Profile Button */}
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
