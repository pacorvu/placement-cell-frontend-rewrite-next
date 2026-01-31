"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Search, Columns3, Download, Building2, MapPin } from "lucide-react";
import type { AlumniProfile } from "@/lib/alumni-types";

interface AlumniResponse {
  alumni: AlumniProfile[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "name", label: "NAME", alwaysVisible: true },
  { key: "usn", label: "USN", alwaysVisible: true },
  { key: "batch", label: "BATCH" },
  { key: "department", label: "DEPARTMENT" },
  { key: "company", label: "COMPANY" },
  { key: "designation", label: "DESIGNATION" },
  { key: "location", label: "LOCATION" },
  { key: "email", label: "EMAIL" },
  { key: "phone", label: "CONTACT" },
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
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(COLUMNS.map((c) => c.key))
  );

  // Unique filter values
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetchAlumni();
  }, [page, selectedBatch, selectedDepartment, selectedCompany, searchQuery]);

  const fetchAlumni = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedBatch !== "all") params.append("batch", selectedBatch);
      if (selectedDepartment !== "all") params.append("department", selectedDepartment);
      if (selectedCompany !== "all") params.append("company", selectedCompany);

      const response = await api.get<AlumniResponse>(
        `/placement/alumni?${params.toString()}`
      );

      setAlumni(response.data.alumni);
      setTotalAlumni(response.data.total);
      setTotalPages(response.data.total_pages);

      // Extract unique filter values
      if (batches.length === 0) {
        const uniqueBatches = [
          ...new Set(response.data.alumni.map((a) => a.batch)),
        ].filter(Boolean).sort().reverse();
        setBatches(uniqueBatches);
      }
      if (departments.length === 0) {
        const uniqueDepartments = [
          ...new Set(response.data.alumni.map((a) => a.department)),
        ].filter(Boolean);
        setDepartments(uniqueDepartments);
      }
      if (companies.length === 0) {
        const uniqueCompanies = [
          ...new Set(response.data.alumni.map((a) => a.currentEmployment.company)),
        ].filter(Boolean).sort();
        setCompanies(uniqueCompanies);
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
      setError("Failed to load alumni. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlumniClick = (usn: string) => {
    router.push(`/alumni/${usn}`);
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

    const rows = alumni.map((alum, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return (page - 1) * perPage + index + 1;
          if (c.key === "company") return `"${alum.currentEmployment.company}"`;
          if (c.key === "designation") return `"${alum.currentEmployment.designation}"`;
          if (c.key === "location") return `"${alum.currentEmployment.location}"`;
          return `"${alum[c.key as keyof AlumniProfile] || ""}"`;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalAlumni);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Alumni</h1>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search alumni..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Batch Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[140px] justify-between"
          >
            {selectedBatch === "all" ? "All Batches" : selectedBatch}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => {
                  setSelectedBatch("all");
                  setPage(1);
                }}
                className={selectedBatch === "all" ? "active" : ""}
              >
                All Batches
              </a>
            </li>
            {batches.map((batch) => (
              <li key={batch}>
                <a
                  onClick={() => {
                    setSelectedBatch(batch);
                    setPage(1);
                  }}
                  className={selectedBatch === batch ? "active" : ""}
                >
                  {batch}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Department Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 min-w-[160px] justify-between"
          >
            {selectedDepartment === "all" ? "All Departments" : selectedDepartment.slice(0, 15) + "..."}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-72 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => {
                  setSelectedDepartment("all");
                  setPage(1);
                }}
                className={selectedDepartment === "all" ? "active" : ""}
              >
                All Departments
              </a>
            </li>
            {departments.map((dept) => (
              <li key={dept}>
                <a
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setPage(1);
                  }}
                  className={selectedDepartment === dept ? "active" : ""}
                >
                  {dept}
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
            className="btn btn-outline gap-2 min-w-[150px] justify-between"
          >
            {selectedCompany === "all" ? "All Companies" : selectedCompany}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => {
                  setSelectedCompany("all");
                  setPage(1);
                }}
                className={selectedCompany === "all" ? "active" : ""}
              >
                All Companies
              </a>
            </li>
            {companies.map((company) => (
              <li key={company}>
                <a
                  onClick={() => {
                    setSelectedCompany(company);
                    setPage(1);
                  }}
                  className={selectedCompany === company ? "active" : ""}
                >
                  {company}
                </a>
              </li>
            ))}
          </ul>
        </div>

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
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52"
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

      {/* Table */}
      <div className="border border-base-300 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-error">
            {error}
          </div>
        ) : alumni.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-base-content/60">
            No alumni found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-base-200">
                {COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                  (column) => (
                    <TableHead
                      key={column.key}
                      className="font-semibold text-base-content"
                    >
                      {column.label}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumni.map((alum, index) => (
                <TableRow
                  key={alum.id}
                  className="cursor-pointer hover:bg-base-200/50"
                  onClick={() => handleAlumniClick(alum.id)}
                >
                  {visibleColumns.has("index") && (
                    <TableCell className="text-base-content/60">
                      {(page - 1) * perPage + index + 1}
                    </TableCell>
                  )}
                  {visibleColumns.has("name") && (
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(alum.name)}`}
                        >
                          {alum.photo ? (
                            <img
                              src={alum.photo}
                              alt={alum.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(alum.name)
                          )}
                        </div>
                        <span className="font-medium">{alum.name}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.has("usn") && (
                    <TableCell>
                      <span className="badge badge-secondary badge-sm font-mono">
                        {alum.id}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has("batch") && (
                    <TableCell>
                      <span className="badge badge-ghost badge-sm">
                        {alum.batch}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has("department") && (
                    <TableCell className="max-w-[200px] truncate" title={alum.department}>
                      {alum.department}
                    </TableCell>
                  )}
                  {visibleColumns.has("company") && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-base-content/50" />
                        <span className="font-medium text-primary">
                          {alum.currentEmployment.company}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.has("designation") && (
                    <TableCell>{alum.currentEmployment.designation}</TableCell>
                  )}
                  {visibleColumns.has("location") && (
                    <TableCell>
                      <div className="flex items-center gap-1 text-base-content/70">
                        <MapPin className="h-3 w-3" />
                        {alum.currentEmployment.location}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.has("email") && (
                    <TableCell className="text-primary">
                      {alum.email}
                    </TableCell>
                  )}
                  {visibleColumns.has("phone") && (
                    <TableCell>{alum.phone || "-"}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalAlumni > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-base-content/60">
            Showing {startIndex} to {endIndex} of {totalAlumni} entries
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="join-item btn btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
