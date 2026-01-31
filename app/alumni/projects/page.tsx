"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface ProjectData {
  id: number;
  title: string;
  description: string | null;
  skills: string[];
  project_link: string | null;
  mentor_name: string | null;
  usn: string;
  user_id: number | null;
  snaps: string[];
  snaps_signed_urls: string[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: ProjectData[];
}

export default function AlumniProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const limit = 50;

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/all?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch projects data");
        }

        const data: ApiResponse = await response.json();
        setProjects(data.data);
        setTotalProjects(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      project.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesSearch;
  });

  // Close modal when clicking outside
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedProject(null);
      setCurrentImageIndex(0);
    }
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
        {/* Search */}
        <div className="card bg-base-200 shadow-lg mb-8">
          <div className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Search projects
                </span>
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or skills..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Results Count */}
            <div className="mt-4">
              <p className="text-sm text-base-content/60">
                Showing {filteredProjects.length} of {totalProjects} projects
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

        {/* Projects Grid */}
        {!loading && !error && filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentImageIndex(0);
                  }}
                >
                  <div className="card-body flex flex-col p-4">
                    {/* Project Image/Thumbnail */}
                    {project.snaps_signed_urls &&
                    project.snaps_signed_urls.length > 0 ? (
                      <figure className="rounded-lg mb-4 h-48 overflow-hidden relative">
                        <img
                          src={project.snaps_signed_urls[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        {project.snaps_signed_urls.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-base-100/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {project.snaps_signed_urls.length}
                          </div>
                        )}
                      </figure>
                    ) : (
                      <div className="bg-linear-to-br from-primary/20 to-secondary/20 rounded-lg h-48 flex items-center justify-center mb-4">
                        <div className="text-6xl font-bold text-base-content/30">
                          {project.title
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="card-title text-lg mb-2 line-clamp-2 min-h-14">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <div className="grow mb-3">
                      {project.description ? (
                        <p className="text-sm text-base-content/70 line-clamp-3">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-sm text-base-content/50 italic">
                          No description available
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4 min-h-8">
                      {project.skills.slice(0, 3).map((skill, index) => (
                        <div
                          key={index}
                          className="badge badge-sm badge-primary"
                        >
                          {skill}
                        </div>
                      ))}
                      {project.skills.length > 3 && (
                        <div className="badge badge-sm badge-outline">
                          +{project.skills.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Metadata - Fixed at bottom */}
                    <div className="mt-auto pt-3 border-t border-base-300 space-y-3">
                      <div className="space-y-1.5">
                        {project.usn && (
                          <p className="text-xs text-base-content/60 flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="truncate">{project.usn}</span>
                          </p>
                        )}
                        {project.mentor_name && (
                          <p className="text-xs text-base-content/60 flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <span className="truncate">
                              {project.mentor_name}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* View Details Button - Always at bottom */}
                      <button className="btn btn-sm btn-primary w-full gap-2">
                        View Details
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                  <h3 className="text-xl font-bold mb-2">No projects found</h3>
                  <p className="text-base-content/60">
                    Try adjusting your search criteria
                  </p>
                </div>
              </div>
            </div>
          )
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleModalClick}
        >
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 flex items-start justify-between z-10">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedProject.title}
                </h2>
                {selectedProject.usn && (
                  <p className="text-sm text-base-content/60">
                    By {selectedProject.usn}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setCurrentImageIndex(0);
                }}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              {selectedProject.snaps_signed_urls &&
                selectedProject.snaps_signed_urls.length > 0 && (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-base-300">
                      <img
                        src={
                          selectedProject.snaps_signed_urls[currentImageIndex]
                        }
                        alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-auto max-h-96 object-contain mx-auto"
                      />

                      {/* Image Navigation */}
                      {selectedProject.snaps_signed_urls.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) =>
                                prev === 0
                                  ? selectedProject.snaps_signed_urls.length - 1
                                  : prev - 1,
                              );
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm"
                          >
                            ❮
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((prev) =>
                                prev ===
                                selectedProject.snaps_signed_urls.length - 1
                                  ? 0
                                  : prev + 1,
                              );
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm"
                          >
                            ❯
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-base-100/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                            {currentImageIndex + 1} /{" "}
                            {selectedProject.snaps_signed_urls.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {selectedProject.snaps_signed_urls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedProject.snaps_signed_urls.map((url, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index
                                ? "border-primary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
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
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description
                </h3>
                <p className="text-base-content/80">
                  {selectedProject.description ||
                    "No description provided for this project."}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skills.map((skill, index) => (
                    <div key={index} className="badge badge-lg badge-primary">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProject.mentor_name && (
                  <div className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">Mentor</p>
                          <p className="font-semibold">
                            {selectedProject.mentor_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProject.usn && (
                  <div className="card bg-base-200">
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/60">
                            Student
                          </p>
                          <p className="font-semibold">{selectedProject.usn}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Link */}
              {selectedProject.project_link && (
                <div>
                  <a
                    href={
                      selectedProject.project_link.startsWith("http")
                        ? selectedProject.project_link
                        : `https://${selectedProject.project_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full gap-2"
                    onClick={(e) => e.stopPropagation()}
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
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Visit Project
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
