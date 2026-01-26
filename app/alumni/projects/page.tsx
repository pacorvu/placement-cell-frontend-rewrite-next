"use client";

import Link from "next/link";
import { useState } from "react";
import { mockAlumniProjects, mockAlumni } from "@/lib/mock-alumni-data";

export default function AlumniProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");

  // Get unique domains
  const domains = Array.from(
    new Set(mockAlumniProjects.map((p) => p.domain))
  ).sort();

  // Filter projects
  const filteredProjects = mockAlumniProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDomain =
      selectedDomain === "all" || project.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  // Get contributor names
  const getContributorNames = (contributorUSNs: string[]) => {
    return contributorUSNs
      .map((usn) => {
        const alumni = mockAlumni.find((a) => a.usn === usn);
        return alumni?.name || usn;
      })
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/placement/alumni"
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
              Back
            </Link>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Student Projects Gallery
          </h1>
          <p className="text-lg text-base-content/70">
            Explore innovative projects from our students
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
                    Search projects
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Search by title, description, or technology..."
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Domain Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Domain</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="all">All Domains</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4">
              <p className="text-sm text-base-content/60">
                Showing {filteredProjects.length} of {mockAlumniProjects.length}{" "}
                projects
              </p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="card-body">
                  {/* Thumbnail Placeholder */}
                  <div className="bg-linear-to-br from-base-300 to-base-content/10 rounded-lg h-40 flex items-center justify-center mb-4">
                    <div className="text-6xl font-bold text-base-content/20">
                      {project.title
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="card-title text-lg mb-2">{project.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <div key={tech} className="badge badge-sm badge-primary">
                        {tech}
                      </div>
                    ))}
                    {project.technologies.length > 3 && (
                      <div className="badge badge-sm badge-outline">
                        +{project.technologies.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Contributors */}
                  <div className="mb-4">
                    <p className="text-xs text-base-content/60 mb-2">
                      By: {getContributorNames(project.contributors)}
                    </p>
                  </div>

                  {/* Domain Badge */}
                  <div className="flex items-center justify-between">
                    <div className="badge badge-secondary badge-sm">
                      {project.domain}
                    </div>
                    <div className="text-xs text-base-content/60">
                      {project.year}
                    </div>
                  </div>

                  {/* View Project Button */}
                  {project.externalLink && (
                    <div className="card-actions justify-end mt-4">
                      <a
                        href={project.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary gap-2"
                      >
                        View Project
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
                    </div>
                  )}
                </div>
              </div>
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
                <h3 className="text-xl font-bold mb-2">No projects found</h3>
                <p className="text-base-content/60">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8">
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
            <span>
              Want to feature your project? Contact the placement cell to submit
              your work!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
