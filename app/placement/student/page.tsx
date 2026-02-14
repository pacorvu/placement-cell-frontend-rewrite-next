"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search, Columns3, Download } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/api";

// ==================== SCHEMAS ====================
const studentSchema = z.object({
  usn: z.string(),
  user_id: z.number().nullable(),
  full_name: z.string(),
  gender: z.string(),
  date_of_birth: z.string().nullable(),
  specially_abled: z.boolean(),
  languages: z.array(z.string()).nullable(),
  personal_email: z.string().nullable(),
  profile_image: z.string().nullable(),
  profile_image_signed_url: z.string().nullable(),
  school_name: z.string().nullable(),
  program_name: z.string().nullable(),
  specialization_name: z.string().nullable(),
  major_name: z.string().nullable(),
  minor_name: z.string().nullable(),
  email: z.string().nullable(),
  year_of_joining: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const apiResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  data: z.array(studentSchema),
});

type Student = z.infer<typeof studentSchema>;
type ApiResponse = z.infer<typeof apiResponseSchema>;

// ==================== CONSTANTS ====================
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
  { key: "specially_abled", label: "SPECIALLY ABLED" },
  { key: "date_of_birth", label: "DOB" },
];

// ==================== HELPER FUNCTIONS ====================
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
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ==================== COMPONENT ====================
export default function StudentsPage() {
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 50;

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [showSpeciallyAbled, setShowSpeciallyAbled] = useState<string>("all");

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "full_name",
      "usn",
      "school_name",
      "year_of_joining",
    ])
  );

  // Fetch students data with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["students", currentPage],
    queryFn: async () => {
      const response = await api.get<ApiResponse>(
        `/students/personal-details/all?page=${currentPage}&limit=${limit}`
      );
      return apiResponseSchema.parse(response.data);
    },
  });

  const students = data?.data ?? [];
  const totalStudents = data?.total ?? 0;
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

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
    return [...new Set(students.map((s) => s.year_of_joining))].sort(
      (a, b) => b - a
    );
  }, [students]);

  const genders = useMemo(() => {
    return [...new Set(students.map((s) => s.gender))].sort();
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.personal_email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false) ||
        (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        (student.major_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false) ||
        (student.minor_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false) ||
        (student.school_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false) ||
        (student.program_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false) ||
        (student.specialization_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false);

      const matchesSchool =
        selectedSchool === "all" || student.school_name === selectedSchool;

      const matchesProgram =
        selectedProgram === "all" || student.program_name === selectedProgram;

      const matchesSpecialization =
        selectedSpecialization === "all" ||
        student.specialization_name === selectedSpecialization;

      const matchesBatch =
        selectedBatch === "all" ||
        student.year_of_joining.toString() === selectedBatch;

      const matchesGender =
        selectedGender === "all" || student.gender === selectedGender;

      const matchesSpeciallyAbled =
        showSpeciallyAbled === "all" ||
        (showSpeciallyAbled === "yes" && student.specially_abled) ||
        (showSpeciallyAbled === "no" && !student.specially_abled);

      return (
        matchesSearch &&
        matchesSchool &&
        matchesProgram &&
        matchesSpecialization &&
        matchesBatch &&
        matchesGender &&
        matchesSpeciallyAbled
      );
    });
  }, [
    students,
    searchQuery,
    selectedSchool,
    selectedProgram,
    selectedSpecialization,
    selectedBatch,
    selectedGender,
    showSpeciallyAbled,
  ]);

  // Handlers
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
            return `"${(student.languages ?? []).join("; ")}"`;
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
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
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
    setShowSpeciallyAbled("all");
  };

  const activeFiltersCount = [
    selectedSchool !== "all",
    selectedProgram !== "all",
    selectedSpecialization !== "all",
    selectedBatch !== "all",
    selectedGender !== "all",
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
          className="input input-bordered w-full pl-10 rounded-none"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* School Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 rounded-none ${selectedSchool !== "all" ? "btn-primary" : ""}`}
          >
            {selectedSchool === "all"
              ? "School"
              : selectedSchool.length > 15
                ? selectedSchool.substring(0, 15) + "..."
                : selectedSchool}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-64 max-h-60 overflow-y-auto rounded-none"
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
            className={`btn btn-outline gap-2 min-w-35 rounded-none ${selectedProgram !== "all" ? "btn-primary" : ""}`}
          >
            {selectedProgram === "all" ? "Program" : selectedProgram}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-52 max-h-60 overflow-y-auto rounded-none"
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
            className={`btn btn-outline gap-2 min-w-35 rounded-none ${selectedSpecialization !== "all" ? "btn-primary" : ""}`}
          >
            {selectedSpecialization === "all"
              ? "Specialization"
              : selectedSpecialization.length > 15
                ? selectedSpecialization.substring(0, 15) + "..."
                : selectedSpecialization}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-64 max-h-60 overflow-y-auto rounded-none"
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
            className={`btn btn-outline gap-2 min-w-30 rounded-none ${selectedBatch !== "all" ? "btn-primary" : ""}`}
          >
            {selectedBatch === "all" ? "Batch" : selectedBatch}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-52 max-h-60 overflow-y-auto rounded-none"
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
            className={`btn btn-outline gap-2 min-w-30 rounded-none ${selectedGender !== "all" ? "btn-primary" : ""}`}
          >
            {selectedGender === "all" ? "Gender" : selectedGender}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-52 rounded-none"
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

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="btn btn-ghost gap-2 rounded-none">
            Clear Filters ({activeFiltersCount})
          </button>
        )}

        <div className="flex-1" />

        {/* Column Visibility */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-outline gap-2 rounded-none">
            <Columns3 className="h-4 w-4" />
            Columns
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-60 max-h-96 overflow-y-auto rounded-none"
          >
            {COLUMNS.map((column) => (
              <li key={column.key}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    disabled={column.alwaysVisible}
                    className="checkbox checkbox-sm rounded-none"
                  />
                  {column.label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Export */}
        <button onClick={handleExport} className="btn btn-outline gap-2 rounded-none">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Error State */}
      {isError && (
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
          <span>Error loading students: {(error as Error)?.message}</span>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto border border-base-300">
          {filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No students found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-200">
                  {COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                    (column) => (
                      <th
                        key={column.key}
                        className="font-semibold text-base-content"
                      >
                        {column.label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.usn}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() =>
                      handleStudentClick(student.user_id?.toString() || "0")
                    }
                  >
                    {visibleColumns.has("index") && (
                      <td className="text-base-content/60">
                        {(currentPage - 1) * limit + index + 1}
                      </td>
                    )}
                    {visibleColumns.has("full_name") && (
                      <td>
                        <div className="flex items-center gap-3">
                          {student.profile_image_signed_url ? (
                            <div className="avatar">
                              <div className="w-8 h-8 rounded-full">
                                <img
                                  src={student.profile_image_signed_url}
                                  alt={student.full_name}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="avatar placeholder">
                              <div
                                className={`w-8 h-8 rounded-full text-white ${getAvatarColor(student.full_name)}`}
                              >
                                <span className="text-xs font-medium">
                                  {getInitials(student.full_name)}
                                </span>
                              </div>
                            </div>
                          )}
                          <span className="font-medium whitespace-nowrap">
                            {student.full_name}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.has("usn") && (
                      <td>
                        <span className="badge badge-primary badge-sm font-mono rounded-none">
                          {student.usn}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has("gender") && (
                      <td>
                        <span className="capitalize">
                          {student.gender.toLowerCase()}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has("school_name") && (
                      <td className="max-w-xs">{student.school_name || "-"}</td>
                    )}
                    {visibleColumns.has("program_name") && (
                      <td>{student.program_name || "-"}</td>
                    )}
                    {visibleColumns.has("specialization_name") && (
                      <td>{student.specialization_name || "-"}</td>
                    )}
                    {visibleColumns.has("major_name") && (
                      <td>{student.major_name || "-"}</td>
                    )}
                    {visibleColumns.has("minor_name") && (
                      <td>{student.minor_name || "-"}</td>
                    )}
                    {visibleColumns.has("year_of_joining") && (
                      <td>
                        <span className="badge badge-outline badge-sm rounded-none">
                          {student.year_of_joining}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has("personal_email") && (
                      <td className="text-primary max-w-xs truncate">
                        {student.personal_email || "-"}
                      </td>
                    )}
                    {visibleColumns.has("email") && (
                      <td className="text-primary max-w-xs truncate">
                        {student.email || "-"}
                      </td>
                    )}
                    {visibleColumns.has("languages") && (
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(student.languages ?? []).slice(0, 2).map((lang, i) => (
                            <span key={i} className="badge badge-sm badge-ghost rounded-none">
                              {lang}
                            </span>
                          ))}
                          {(student.languages?.length ?? 0) > 2 && (
                            <span className="badge badge-sm badge-ghost rounded-none">
                              +{(student.languages?.length ?? 0) - 2}
                            </span>
                          )}
                          {(!student.languages || student.languages.length === 0) && (
                            <span className="text-base-content/50 text-sm">-</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.has("specially_abled") && (
                      <td>
                        {student.specially_abled ? (
                          <span className="badge badge-sm badge-info rounded-none">Yes</span>
                        ) : (
                          <span className="text-base-content/60">No</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.has("date_of_birth") && (
                      <td className="whitespace-nowrap">
                        {formatDate(student.date_of_birth ?? "")}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Results Count and Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-base-content/60">
          Showing {filteredStudents.length} of {totalStudents} students
          {activeFiltersCount > 0 &&
            ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} active)`}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="join">
            <button
              className="join-item btn btn-sm rounded-none"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button className="join-item btn btn-sm rounded-none">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn btn-sm rounded-none"
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
