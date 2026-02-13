"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface ProjectData {
  id: number;
  title: string;
  description: string | null;
  skills: string[] | null;
  project_link: string | null;
  mentor_name: string | null;
  usn: string;
  user_id: number | null;
  snaps: string[] | null;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const limit = 50;

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/all?page=${currentPage}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!response.ok) throw new Error("Failed to fetch projects");

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

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false) ||
        (project.skills?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ??
          false);

      return matchesSearch;
    });

    // Sort by date
    filtered.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return filtered;
  }, [projects, searchQuery, sortBy]);

  // Get initials for avatar
  const getInitials = (usn: string) => {
    return usn.slice(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header - SQUARE */}
      <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 shadow-md ">
        <div className="max-w-450 mx-auto px-6 py-5">
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects, skills, descriptions..."
                  className="input input-bordered w-full pl-12 pr-4 focus:outline-offset-0 focus:outline-primary rounded-none h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40"
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
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-square min-h-0 h-6 w-6"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("newest")}
                className={`btn btn-sm rounded-none ${sortBy === "newest" ? "btn-neutral" : "btn-ghost"}`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`btn btn-sm rounded-none ${sortBy === "oldest" ? "btn-neutral" : "btn-ghost"}`}
              >
                Oldest
              </button>
              <div className="h-8 w-px bg-base-300 mx-2"></div>
              <div className="bg-base-200 px-4 py-2 text-sm font-medium">
                <span className="font-bold text-primary">{totalProjects}</span>
                <span className="text-base-content/60 ml-1.5">
                  total projects
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-450 mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-base-300 mb-3"></div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-base-300 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300 w-3/4"></div>
                    <div className="h-3 bg-base-300 w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-error rounded-none">
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
        ) : filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentImageIndex(0);
                  }}
                >
                  {/* Thumbnail - SQUARE */}
                  <div className="relative aspect-video overflow-hidden bg-base-300 mb-3 shadow-lg">
                    {project.snaps_signed_urls &&
                    project.snaps_signed_urls.length > 0 ? (
                      <>
                        <img
                          src={project.snaps_signed_urls[0]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/80">
                          {getInitials(project.usn)}
                        </span>
                      </div>
                    )}

                    {/* Badges - SQUARE */}
                    <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-bold px-2 py-1">
                      {project.skills?.length || 0} skills
                    </div>

                    {project.snaps_signed_urls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/90 text-white text-xs font-bold px-2 py-1 flex items-center gap-1">
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
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-base-content/60 mb-1">
                      {project.usn}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <span>{formatDate(project.created_at)}</span>
                      {project.mentor_name && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            Mentor: {project.mentor_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-12">
                <div className="text-sm text-base-content/60">
                  Page {currentPage} of {totalPages} ({totalProjects} total
                  projects)
                </div>
                <div className="join shadow-lg">
                  <button
                    className="join-item btn rounded-none"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button
                    className="join-item btn rounded-none"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ‹ Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`join-item btn rounded-none ${currentPage === pageNum ? "btn-active" : ""}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="join-item btn rounded-none"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next ›
                  </button>
                  <button
                    className="join-item btn rounded-none"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-base-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-base-content/30"
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
            </div>
            <h3 className="text-2xl font-bold mb-2">No projects found</h3>
            <p className="text-base-content/60 mb-6">
              Try a different search term
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="btn btn-primary rounded-none"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Modal - SQUARE DESIGN WITH ENHANCED INFO CARDS */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProject(null);
              setCurrentImageIndex(0);
            }
          }}
        >
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Top Bar - Close + Delete */}
              <div className="flex justify-end gap-3 mb-4">
                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-error btn-sm gap-2 text-white hover:bg-red-700 w-10 h-10 min-h-0 p-0 rounded-none"
                  title="Delete Project"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setCurrentImageIndex(0);
                  }}
                  className="btn btn-ghost text-white hover:bg-white/10 w-10 h-10 min-h-0 p-0 rounded-none"
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

              {/* Unified Card Layout */}
              <div className="bg-base-100 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Left - Image Gallery */}
                  <div className="lg:col-span-2">
                    {/* Main Image */}
                    <div className="relative bg-black aspect-video">
                      {selectedProject.snaps_signed_urls &&
                      selectedProject.snaps_signed_urls.length > 0 ? (
                        <img
                          src={
                            selectedProject.snaps_signed_urls[currentImageIndex]
                          }
                          alt={selectedProject.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/30 to-secondary/30">
                          <span className="text-8xl font-bold text-white/60">
                            {getInitials(selectedProject.usn)}
                          </span>
                        </div>
                      )}

                      {/* Nav Buttons */}
                      {selectedProject.snaps_signed_urls &&
                        selectedProject.snaps_signed_urls.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) =>
                                  prev === 0
                                    ? selectedProject.snaps_signed_urls.length -
                                      1
                                    : prev - 1,
                                );
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 btn bg-white hover:bg-white/90 w-12 h-12 min-h-0 p-0 border-none rounded-none"
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
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
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
                              className="absolute right-4 top-1/2 -translate-y-1/2 btn bg-white hover:bg-white/90 w-12 h-12 min-h-0 p-0 border-none rounded-none"
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
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 text-sm font-semibold">
                              {currentImageIndex + 1} /{" "}
                              {selectedProject.snaps_signed_urls.length}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {selectedProject.snaps_signed_urls &&
                      selectedProject.snaps_signed_urls.length > 1 && (
                        <div className="bg-base-200 p-4 border-r border-base-300">
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {selectedProject.snaps_signed_urls.map(
                              (url, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex(index);
                                  }}
                                  className={`shrink-0 w-28 h-20 overflow-hidden border-3 transition-all ${
                                    currentImageIndex === index
                                      ? "border-primary shadow-lg scale-105"
                                      : "border-base-300 opacity-60 hover:opacity-100 hover:scale-105"
                                  }`}
                                >
                                  <img
                                    src={url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Description Section */}
                    <div className="p-6 border-t border-r border-base-300">
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Project Description
                      </h3>
                      <div className="bg-base-200 p-4">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                          {selectedProject.description ||
                            "No description provided for this project."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar - All Info in One Column */}
                  <div className="bg-base-200 p-6">
                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-6">
                      {selectedProject.title}
                    </h2>

                    {/* Student Info */}
                    <div className="mb-6">
                      <div className="p-4 bg-base-100 border-l-4 border-primary">
                        <p className="text-xs text-base-content/60 uppercase tracking-wider">
                          Student
                        </p>
                        <p className="font-bold text-lg">
                          {selectedProject.usn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-base-content/70 px-4">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          Created {formatDate(selectedProject.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Mentor Info */}
                    {selectedProject.mentor_name && (
                      <div className="mb-6 p-4 bg-base-100 border-l-4 border-secondary">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/20">
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-base-content/60 uppercase tracking-wider">
                              Mentor
                            </p>
                            <p className="font-bold">
                              {selectedProject.mentor_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Technologies */}
                    {selectedProject.skills &&
                      selectedProject.skills.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-base-content/70">
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
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                            Technologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.skills.map((skill, index) => (
                              <div
                                key={index}
                                className="bg-base-100 border-2 border-primary/30 px-3 py-1.5 text-xs font-semibold"
                              >
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Stats */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-base-content/70">
                        Project Stats
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-base-100">
                          <span className="text-sm">Technologies</span>
                          <span className="badge badge-primary rounded-none">
                            {selectedProject.skills?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-base-100">
                          <span className="text-sm">Images</span>
                          <span className="badge badge-secondary rounded-none">
                            {selectedProject.snaps_signed_urls?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-base-100">
                          <span className="text-sm">Link Status</span>
                          <span
                            className={`badge rounded-none ${
                              selectedProject.project_link
                                ? "badge-success"
                                : "badge-ghost"
                            }`}
                          >
                            {selectedProject.project_link ? "Available" : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visit Button */}
                    {selectedProject.project_link && (
                      <a
                        href={
                          selectedProject.project_link.startsWith("http")
                            ? selectedProject.project_link
                            : `https://${selectedProject.project_link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-lg w-full gap-3 group rounded-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 transition-transform group-hover:scale-110"
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
                        Visit Live Project
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div
              className="modal modal-open"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
                <p className="py-4">
                  Are you sure you want to delete the project{" "}
                  <strong>{selectedProject.title}</strong>? This action cannot
                  be undone.
                </p>
                <div className="modal-action">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        const token = localStorage.getItem("access_token");
                        if (!token) {
                          throw new Error("Authentication token not found");
                        }

                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${selectedProject.id}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          },
                        );

                        if (!res.ok) {
                          throw new Error("Failed to delete project");
                        }

                        const toastDiv = document.createElement("div");
                        toastDiv.className = "toast toast-top toast-center";
                        toastDiv.innerHTML = `
                    <div class="alert alert-success">
                      <span>Project deleted successfully!</span>
                    </div>
                  `;
                        document.body.appendChild(toastDiv);
                        setTimeout(() => toastDiv.remove(), 3000);

                        setShowDeleteModal(false);
                        setSelectedProject(null);
                        setCurrentImageIndex(0);
                        window.location.reload();
                      } catch (err) {
                        const toastDiv = document.createElement("div");
                        toastDiv.className = "toast toast-top toast-center";
                        toastDiv.innerHTML = `
                    <div class="alert alert-error">
                      <span>${err instanceof Error ? err.message : "Failed to delete project"}</span>
                    </div>
                  `;
                        document.body.appendChild(toastDiv);
                        setTimeout(() => toastDiv.remove(), 3000);
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                    className="btn btn-error"
                  >
                    {isDeleting ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
              <div
                className="modal-backdrop"
                onClick={() => !isDeleting && setShowDeleteModal(false)}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
