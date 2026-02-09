"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Search, Columns3, Download, Building2, MapPin, Github, Linkedin } from "lucide-react";

interface AlumniData {
  id: number;
  usn: string | null;
  full_name: string;
  graduation_year: number | null;
  current_company: string | null;
  current_designation: string | null;
  current_work_location: string | null;
  phone_number: string | null;
  other_links: {
    github?: string;
    linkedin?: string;
    [key: string]: any;
  } | null;
  personal_email: string | null;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  refered_by: number | null;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: AlumniData[];
}

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "full_name", label: "NAME", alwaysVisible: true },
  { key: "graduation_year", label: "BATCH", alwaysVisible: true },
  { key: "current_company", label: "COMPANY" },
  { key: "current_designation", label: "DESIGNATION" },
  { key: "current_work_location", label: "LOCATION" },
  { key: "personal_email", label: "EMAIL" },
  { key: "phone_number", label: "CONTACT" },
  { key: "other_links", label: "LINKS" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-lime-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function AlumniPage() {
  const router = useRouter();

  // API state
  const [alumni, setAlumni] = useState<AlumniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const limit = 50;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "full_name",
      "graduation_year",
      "current_company",
      "current_designation",
      "current_work_location",
      "personal_email",
    ])
  );

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
          }
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

  // Unique filter values
  const batches = useMemo(() => {
    return [
      ...new Set(
        alumni
          .map((a) => a.graduation_year)
          .filter((year): year is number => year !== null)
      ),
    ].sort((a, b) => b - a);
  }, [alumni]);

  const companies = useMemo(() => {
    return [
      ...new Set(
        alumni
          .map((a) => a.current_company)
          .filter((company): company is string => company !== null)
      ),
    ].sort();
  }, [alumni]);

  const locations = useMemo(() => {
    return [
      ...new Set(
        alumni
          .map((a) => a.current_work_location)
          .filter((location): location is string => location !== null)
      ),
    ].sort();
  }, [alumni]);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumniItem) => {
      const matchesSearch =
        alumniItem.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alumniItem.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (alumniItem.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (alumniItem.current_designation?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (alumniItem.personal_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesBatch =
        selectedBatch === "all" || alumniItem.graduation_year?.toString() === selectedBatch;

      const matchesCompany =
        selectedCompany === "all" || alumniItem.current_company === selectedCompany;

      const matchesLocation =
        selectedLocation === "all" || alumniItem.current_work_location === selectedLocation;

      return matchesSearch && matchesBatch && matchesCompany && matchesLocation;
    });
  }, [alumni, searchQuery, selectedBatch, selectedCompany, selectedLocation]);

  const handleAlumniClick = (userId: number | null) => {
    if (userId) {
      router.push(`/placement/alumni/${userId}`);
    }
  };

  const toggleColumn = (key: string) => {
    const column = COLUMNS.find((c) => c.key === key);
    if (column?.alwaysVisible) return;

    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleExport = () => {
    const headers = COLUMNS.filter((c) => visibleColumns.has(c.key))
      .map((c) => c.label)
      .join(",");

    const rows = filteredAlumni.map((alumniItem, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return index + 1;
          if (c.key === "other_links") {
            const links = [];
            if (alumniItem.other_links?.linkedin) links.push(`LinkedIn: ${alumniItem.other_links.linkedin}`);
            if (alumniItem.other_links?.github) links.push(`GitHub: ${alumniItem.other_links.github}`);
            return `"${links.join("; ")}"`;
          }
          const value = alumniItem[c.key as keyof AlumniData];
          return `"${value !== null && value !== undefined ? value : ""}"`;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alumni_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBatch("all");
    setSelectedCompany("all");
    setSelectedLocation("all");
  };

  const activeFiltersCount = [
    selectedBatch !== "all",
    selectedCompany !== "all",
    selectedLocation !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alumni</h1>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by name, company, designation, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Batch Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[140px] justify-between ${selectedBatch !== "all" ? "btn-primary" : ""}`}
          >
            {selectedBatch === "all" ? "Batch" : selectedBatch}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedBatch("all")}
                className={selectedBatch === "all" ? "active" : ""}
              >
                All Batches
              </a>
            </li>
            {batches.map((batch) => (
              <li key={batch}>
                <a
                  onClick={() => setSelectedBatch(batch.toString())}
                  className={selectedBatch === batch.toString() ? "active" : ""}
                >
                  {batch}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[150px] justify-between ${selectedCompany !== "all" ? "btn-primary" : ""}`}
          >
            {selectedCompany === "all" ? "Company" : selectedCompany.length > 15 ? selectedCompany.substring(0, 15) + "..." : selectedCompany}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedCompany("all")}
                className={selectedCompany === "all" ? "active" : ""}
              >
                All Companies
              </a>
            </li>
            {companies.map((company) => (
              <li key={company}>
                <a
                  onClick={() => setSelectedCompany(company)}
                  className={selectedCompany === company ? "active" : ""}
                >
                  {company}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Location Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[140px] justify-between ${selectedLocation !== "all" ? "btn-primary" : ""}`}
          >
            {selectedLocation === "all" ? "Location" : selectedLocation}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedLocation("all")}
                className={selectedLocation === "all" ? "active" : ""}
              >
                All Locations
              </a>
            </li>
            {locations.map((location) => (
              <li key={location}>
                <a
                  onClick={() => setSelectedLocation(location)}
                  className={selectedLocation === location ? "active" : ""}
                >
                  {location}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="btn btn-ghost gap-2">
            Clear Filters ({activeFiltersCount})
          </button>
        )}

        <div className="flex-1" />

        {/* Column Visibility */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2"
          >
            <Columns3 className="h-4 w-4" />
            Columns
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-60 max-h-96 overflow-y-auto"
          >
            {COLUMNS.map((column) => (
              <li key={column.key}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    disabled={column.alwaysVisible}
                    className="checkbox checkbox-sm"
                  />
                  {column.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Export */}
        <button onClick={handleExport} className="btn btn-outline gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error shadow-lg">
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

      {/* Table */}
      {!loading && !error && (
        <div className="border border-base-300 rounded-lg overflow-x-auto">
          {filteredAlumni.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No alumni found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-base-200">
                  {COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                    (column) => (
                      <TableHead
                        key={column.key}
                        className="font-semibold text-base-content whitespace-nowrap"
                      >
                        {column.label}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.map((alumniItem, index) => (
                  <TableRow
                    key={alumniItem.id}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() => handleAlumniClick(alumniItem.user_id)}
                  >
                    {visibleColumns.has("index") && (
                      <TableCell className="text-base-content/60">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                    )}
                    {visibleColumns.has("full_name") && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(alumniItem.full_name)}`}
                          >
                            {getInitials(alumniItem.full_name)}
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {alumniItem.full_name}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("graduation_year") && (
                      <TableCell>
                        <span className="badge badge-ghost badge-sm">
                          {alumniItem.graduation_year || "-"}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.has("current_company") && (
                      <TableCell>
                        {alumniItem.current_company ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-base-content/50" />
                            <span className="font-medium text-primary">
                              {alumniItem.current_company}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base-content/60">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("current_designation") && (
                      <TableCell>
                        {alumniItem.current_designation || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.has("current_work_location") && (
                      <TableCell>
                        {alumniItem.current_work_location ? (
                          <div className="flex items-center gap-1 text-base-content/70">
                            <MapPin className="h-3 w-3" />
                            {alumniItem.current_work_location}
                          </div>
                        ) : (
                          <span className="text-base-content/60">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("personal_email") && (
                      <TableCell className="text-primary max-w-xs truncate">
                        {alumniItem.personal_email || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.has("phone_number") && (
                      <TableCell>{alumniItem.phone_number || "-"}</TableCell>
                    )}
                    {visibleColumns.has("other_links") && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {alumniItem.other_links?.linkedin && (
                            <a
                              href={alumniItem.other_links.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn btn-ghost btn-xs"
                            >
                              <Linkedin className="h-4 w-4 text-blue-600" />
                            </a>
                          )}
                          {alumniItem.other_links?.github && (
                            <a
                              href={alumniItem.other_links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn btn-ghost btn-xs"
                            >
                              <Github className="h-4 w-4 text-base-content" />
                            </a>
                          )}
                          {!alumniItem.other_links?.linkedin &&
                            !alumniItem.other_links?.github && (
                              <span className="text-base-content/60">-</span>
                            )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Results Count and Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-base-content/60">
          Showing {filteredAlumni.length} of {totalAlumni} alumni
          {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        )}
      </div>
    </div>
  );
}