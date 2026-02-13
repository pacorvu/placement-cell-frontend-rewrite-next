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
import { ChevronDown, Search, Columns3, Download, Filter } from "lucide-react";

interface Student {
  usn: string;
  user_id: number | null;
  full_name: string;
  gender: string;
  date_of_birth: string;
  specially_abled: boolean;
  languages: string[];
  personal_email: string | null;
  verification_type: string | null;
  profile_image: string | null;
  profile_image_signed_url: string | null;
  school_name: string | null;
  program_name: string | null;
  specialization_name: string | null;
  major_name: string | null;
  minor_name: string | null;
  email: string | null;
  year_of_joining: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Student[];
}

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "full_name", label: "NAME", alwaysVisible: true },
  { key: "usn", label: "USN", alwaysVisible: true },
  { key: "gender", label: "GENDER" },
  { key: "school_name", label: "SCHOOL" },
  { key: "program_name", label: "PROGRAM" },
  { key: "specialization_name", label: "SPECIALIZATION" },
  { key: "major_name", label: "MAJOR" },
  { key: "minor_name", label: "MINOR" },
  { key: "year_of_joining", label: "BATCH" },
  { key: "personal_email", label: "PERSONAL EMAIL" },
  { key: "email", label: "INSTITUTE EMAIL" },
  { key: "languages", label: "LANGUAGES" },
  { key: "verification_type", label: "VERIFICATION" },
  { key: "specially_abled", label: "SPECIALLY ABLED" },
  { key: "date_of_birth", label: "DOB" },
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function StudentsPage() {
  const router = useRouter();

  // API state
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const limit = 50;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] = useState<string>("all");
  const [showSpeciallyAbled, setShowSpeciallyAbled] = useState<string>("all");
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "full_name",
      "usn",
      "gender",
      "school_name",
      "program_name",
      "specialization_name",
      "year_of_joining",
      "personal_email",
    ])
  );

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/personal-details/all?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch students data");
        }

        const data: ApiResponse = await response.json();
        setStudents(data.data);
        setTotalStudents(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage]);

  // Unique filter values
  const schools = useMemo(() => {
    return [
      ...new Set(
        students
          .map((s) => s.school_name)
          .filter((school): school is string => school !== null)
      ),
    ].sort();
  }, [students]);

  const programs = useMemo(() => {
    return [
      ...new Set(
        students
          .map((s) => s.program_name)
          .filter((program): program is string => program !== null)
      ),
    ].sort();
  }, [students]);

  const specializations = useMemo(() => {
    return [
      ...new Set(
        students
          .map((s) => s.specialization_name)
          .filter((spec): spec is string => spec !== null)
      ),
    ].sort();
  }, [students]);

  const batches = useMemo(() => {
    return [
      ...new Set(students.map((s) => s.year_of_joining))
    ].sort((a, b) => b - a);
  }, [students]);

  const genders = useMemo(() => {
    return [...new Set(students.map((s) => s.gender))].sort();
  }, [students]);

  const verificationTypes = useMemo(() => {
    return [
      ...new Set(
        students
          .map((s) => s.verification_type)
          .filter((v): v is string => v !== null)
      ),
    ].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.personal_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (student.major_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (student.minor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesSchool =
        selectedSchool === "all" || student.school_name === selectedSchool;
      
      const matchesProgram =
        selectedProgram === "all" || student.program_name === selectedProgram;

      const matchesSpecialization =
        selectedSpecialization === "all" || student.specialization_name === selectedSpecialization;

      const matchesBatch =
        selectedBatch === "all" || student.year_of_joining.toString() === selectedBatch;

      const matchesGender =
        selectedGender === "all" || student.gender === selectedGender;

      const matchesVerification =
        selectedVerification === "all" || student.verification_type === selectedVerification;

      const matchesSpeciallyAbled =
        showSpeciallyAbled === "all" ||
        (showSpeciallyAbled === "yes" && student.specially_abled) ||
        (showSpeciallyAbled === "no" && !student.specially_abled);
      
      return matchesSearch && matchesSchool && matchesProgram && matchesSpecialization && 
             matchesBatch && matchesGender && matchesVerification && matchesSpeciallyAbled;
    });
  }, [students, searchQuery, selectedSchool, selectedProgram, selectedSpecialization, 
      selectedBatch, selectedGender, selectedVerification, showSpeciallyAbled]);

  const handleStudentClick = (user_id: string) => {
    router.push(`/placement/student/${user_id}`);
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

    const rows = filteredStudents.map((student, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return index + 1;
          if (c.key === "languages") {
            return `"${student.languages.join("; ")}"`;
          }
          if (c.key === "specially_abled") {
            return student.specially_abled ? "Yes" : "No";
          }
          const value = student[c.key as keyof Student];
          return `"${value !== null && value !== undefined ? value : ""}"`;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSchool("all");
    setSelectedProgram("all");
    setSelectedSpecialization("all");
    setSelectedBatch("all");
    setSelectedGender("all");
    setSelectedVerification("all");
    setShowSpeciallyAbled("all");
  };

  const activeFiltersCount = [
    selectedSchool !== "all",
    selectedProgram !== "all",
    selectedSpecialization !== "all",
    selectedBatch !== "all",
    selectedGender !== "all",
    selectedVerification !== "all",
    showSpeciallyAbled !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Students</h1>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by name, USN, email, major, minor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* School Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35ify-between ${selectedSchool !== "all" ? "btn-primary" : ""}`}
          >
            {selectedSchool === "all" ? "School" : selectedSchool.length > 15 ? selectedSchool.substring(0, 15) + "..." : selectedSchool}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedSchool("all")}
                className={selectedSchool === "all" ? "active" : ""}
              >
                All Schools
              </a>
            </li>
            {schools.map((school) => (
              <li key={school}>
                <a
                  onClick={() => setSelectedSchool(school)}
                  className={selectedSchool === school ? "active" : ""}
                >
                  {school}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Program Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedProgram !== "all" ? "btn-primary" : ""}`}
          >
            {selectedProgram === "all" ? "Program" : selectedProgram}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedProgram("all")}
                className={selectedProgram === "all" ? "active" : ""}
              >
                All Programs
              </a>
            </li>
            {programs.map((program) => (
              <li key={program}>
                <a
                  onClick={() => setSelectedProgram(program)}
                  className={selectedProgram === program ? "active" : ""}
                >
                  {program}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Specialization Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedSpecialization !== "all" ? "btn-primary" : ""}`}
          >
            {selectedSpecialization === "all" ? "Specialization" : selectedSpecialization.length > 15 ? selectedSpecialization.substring(0, 15) + "..." : selectedSpecialization}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedSpecialization("all")}
                className={selectedSpecialization === "all" ? "active" : ""}
              >
                All Specializations
              </a>
            </li>
            {specializations.map((spec) => (
              <li key={spec}>
                <a
                  onClick={() => setSelectedSpecialization(spec)}
                  className={selectedSpecialization === spec ? "active" : ""}
                >
                  {spec}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Batch Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-30 justify-between ${selectedBatch !== "all" ? "btn-primary" : ""}`}
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

        {/* Gender Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-30 justify-between ${selectedGender !== "all" ? "btn-primary" : ""}`}
          >
            {selectedGender === "all" ? "Gender" : selectedGender}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a
                onClick={() => setSelectedGender("all")}
                className={selectedGender === "all" ? "active" : ""}
              >
                All Genders
              </a>
            </li>
            {genders.map((gender) => (
              <li key={gender}>
                <a
                  onClick={() => setSelectedGender(gender)}
                  className={selectedGender === gender ? "active" : ""}
                >
                  {gender}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Verification Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedVerification !== "all" ? "btn-primary" : ""}`}
          >
            {selectedVerification === "all" ? "Verification" : selectedVerification}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedVerification("all")}
                className={selectedVerification === "all" ? "active" : ""}
              >
                All Types
              </a>
            </li>
            {verificationTypes.map((type) => (
              <li key={type}>
                <a
                  onClick={() => setSelectedVerification(type)}
                  className={selectedVerification === type ? "active" : ""}
                >
                  {type}
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
          {filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No students found</p>
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
                {filteredStudents.map((student, index) => (
                  <TableRow
                    key={student.usn}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() => handleStudentClick( student.user_id?.toString()|| "0")}
                  >
                    {visibleColumns.has("index") && (
                      <TableCell className="text-base-content/60">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>
                    )}
                    {visibleColumns.has("full_name") && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {student.profile_image_signed_url ? (
                            <img
                              src={student.profile_image_signed_url}
                              alt={student.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(student.full_name)}`}
                            >
                              {getInitials(student.full_name)}
                            </div>
                          )}
                          <span className="font-medium whitespace-nowrap">{student.full_name}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("usn") && (
                      <TableCell>
                        <span className="badge badge-primary badge-sm font-mono">
                          {student.usn}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.has("gender") && (
                      <TableCell>
                        <span className="capitalize">{student.gender.toLowerCase()}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("school_name") && (
                      <TableCell className="max-w-xs">
                        {student.school_name || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.has("program_name") && (
                      <TableCell>{student.program_name || "-"}</TableCell>
                    )}
                    {visibleColumns.has("specialization_name") && (
                      <TableCell>{student.specialization_name || "-"}</TableCell>
                    )}
                    {visibleColumns.has("major_name") && (
                      <TableCell>{student.major_name || "-"}</TableCell>
                    )}
                    {visibleColumns.has("minor_name") && (
                      <TableCell>{student.minor_name || "-"}</TableCell>
                    )}
                    {visibleColumns.has("year_of_joining") && (
                      <TableCell>
                        <span className="badge badge-outline badge-sm">
                          {student.year_of_joining}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.has("personal_email") && (
                      <TableCell className="text-primary max-w-xs truncate">
                        {student.personal_email || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.has("email") && (
                      <TableCell className="text-primary max-w-xs truncate">
                        {student.email || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.has("languages") && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {student.languages.slice(0, 2).map((lang, i) => (
                            <span key={i} className="badge badge-sm badge-ghost">
                              {lang}
                            </span>
                          ))}
                          {student.languages.length > 2 && (
                            <span className="badge badge-sm badge-ghost">
                              +{student.languages.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("verification_type") && (
                      <TableCell>
                        {student.verification_type ? (
                          <span className="badge badge-sm badge-success">
                            {student.verification_type}
                          </span>
                        ) : (
                          <span className="text-base-content/60">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("specially_abled") && (
                      <TableCell>
                        {student.specially_abled ? (
                          <span className="badge badge-sm badge-info">Yes</span>
                        ) : (
                          <span className="text-base-content/60">No</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("date_of_birth") && (
                      <TableCell className="whitespace-nowrap">
                        {formatDate(student.date_of_birth)}
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
          Showing {filteredStudents.length} of {totalStudents} students
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