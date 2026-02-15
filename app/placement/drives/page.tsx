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
import {
  Search,
  ChevronDown,
  Download,
  Plus,
  X,
  Columns3,
  Building2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  IndianRupee,
} from "lucide-react";

interface Placement {
  id: number;
  company_id: number | null;
  company_remarks: string | null;
  year: number;
  type_of_hiring: "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER";
  job_type: "DOMESTIC" | "INTERNATIONAL" | null;
  job_description: string | null;
  job_location: string | null;
  onboarded_date: string | null;
  last_date_to_registration: string | null;
  number_of_openings: number | null;
  number_of_registrations: number;
  no_shortlisted: number;
  offer_letter_status: "NOT_ISSUED" | "ISSUED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  placement_status: "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "POSTPONED";
  institution_id: number | null;
  school_id: number | null;
  program_id: number | null;
  specialization_id: number | null;
  event_datetime: string | null;
  tpo_id: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  eligibility_min_cgpa: number | null;
  eligibility_backlogs_allowed: number | null;
  stipend_min: number | null;
  stipend_max: number | null;
  stipend_avg: number | null;
  ctc_min_lpa: number | null;
  ctc_max_lpa: number | null;
  ctc_variable_percentage: number | null;
  company_name: string | null;
  institution_name: string | null;
  school_name: string | null;
  program_name: string | null;
  specialization_name: string | null;
  tpo_name: string | null;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Placement[];
}

interface Company {
  id: number;
  company_name: string;
  description: string;
  company_type: string;
  address: string;
  website: string;
  linkedin: string;
  company_logo_link: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  signed_url: string | null;
}

interface ResourcesEnum {
  schools: { mapping: Record<string, string>; total: number };
  programs: { mapping: Record<string, string>; total: number };
  specializations: { mapping: Record<string, string>; total: number };
  majors: { mapping: Record<string, string>; total: number };
  minors: { mapping: Record<string, string>; total: number };
}

interface PlacementFormData {
  company_id: number | null;
  company_remarks: string;
  year: number;
  type_of_hiring: string;
  job_type: string;
  job_description: string;
  job_location: string;
  onboarded_date: string;
  last_date_to_registration: string;
  number_of_openings: number | null;
  number_of_registrations: number | null;
  no_shortlisted: number | null;
  offer_letter_status: string;
  placement_status: string;
  institution_id: number | null;
  school_id: number | null;
  program_id: number | null;
  specialization_id: number | null;
  event_datetime: string;
  tpo_id: number | null;
  eligibility_min_cgpa: number | null;
  eligibility_backlogs_allowed: number | null;
  stipend_min: number | null;
  stipend_max: number | null;
  stipend_avg: number | null;
  ctc_min_lpa: number | null;
  ctc_max_lpa: number | null;
  ctc_variable_percentage: number | null;
}

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "company_name", label: "COMPANY", alwaysVisible: true },
  { key: "year", label: "YEAR", alwaysVisible: true },
  { key: "type_of_hiring", label: "HIRING TYPE" },
  { key: "job_type", label: "JOB TYPE" },
  { key: "job_location", label: "LOCATION" },
  { key: "number_of_openings", label: "OPENINGS" },
  { key: "number_of_registrations", label: "REGISTRATIONS" },
  { key: "no_shortlisted", label: "SHORTLISTED" },
  { key: "ctc_range", label: "CTC (LPA)" },
  { key: "stipend_range", label: "STIPEND" },
  { key: "eligibility_cgpa", label: "MIN CGPA" },
  { key: "placement_status", label: "STATUS" },
  { key: "school_name", label: "SCHOOL" },
  { key: "program_name", label: "PROGRAM" },
  { key: "specialization_name", label: "SPECIALIZATION" },
  { key: "event_datetime", label: "EVENT DATE" },
  { key: "last_date_to_registration", label: "LAST DATE" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "badge-ghost",
  OPEN: "badge-success",
  CLOSED: "badge-error",
  CANCELLED: "badge-warning",
  POSTPONED: "badge-info",
};

const HIRING_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
  INTERNSHIP_PLUS_PPO: "Internship + PPO",
  CONTRACT: "Contract",
  OTHER: "Other",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PlacementDrivesPage() {
  const router = useRouter();

  // API state
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resources, setResources] = useState<ResourcesEnum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlacements, setTotalPlacements] = useState(0);
  const limit = 50;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedHiringType, setSelectedHiringType] = useState<string>("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "company_name",
      "year",
      "type_of_hiring",
      "job_type",
      "job_location",
      "number_of_openings",
      "number_of_registrations",
      "ctc_range",
      "placement_status",
    ])
  );

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const [formData, setFormData] = useState<PlacementFormData>({
    company_id: null,
    company_remarks: "",
    year: new Date().getFullYear(),
    type_of_hiring: "FULL_TIME",
    job_type: "DOMESTIC",
    job_description: "",
    job_location: "",
    onboarded_date: "",
    last_date_to_registration: "",
    number_of_openings: null,
    number_of_registrations: null,
    no_shortlisted: null,
    offer_letter_status: "NOT_ISSUED",
    placement_status: "DRAFT",
    institution_id: null,
    school_id: null,
    program_id: null,
    specialization_id: null,
    event_datetime: "",
    tpo_id: null,
    eligibility_min_cgpa: null,
    eligibility_backlogs_allowed: null,
    stipend_min: null,
    stipend_max: null,
    stipend_avg: null,
    ctc_min_lpa: null,
    ctc_max_lpa: null,
    ctc_variable_percentage: null,
  });

  // Fetch placements
  useEffect(() => {
    const fetchPlacements = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/all?page=${currentPage}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch placements");

        const data: ApiResponse = await response.json();
        setPlacements(data.data);
        setTotalPlacements(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, [currentPage]);

  // Fetch companies (only when modal opens)
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=1&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to fetch companies");

        const data = await res.json();
        setCompanies(data.data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    if (showAddModal) {
      fetchCompanies();
    }
  }, [showAddModal]);

  // NEW: Fetch resources enum (schools, programs, specializations, etc.)
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/resources-enum`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to fetch resources enum");

        const data: ResourcesEnum = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources enum:", err);
      }
    };

    // Fetch once when component mounts (or when modal opens — here we do it on mount)
    fetchResources();
  }, []);

  // Unique filter values (unchanged)
  const years = useMemo(() => {
    return [...new Set(placements.map((p) => p.year))].sort((a, b) => b - a);
  }, [placements]);

  const companyNames = useMemo(() => {
    return [
      ...new Set(
        placements
          .map((p) => p.company_name)
          .filter((name): name is string => name !== null)
      ),
    ].sort();
  }, [placements]);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        placements
          .map((p) => p.placement_status)
          .filter((status): status is "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "POSTPONED" => status !== null)
      ),
    ];
  }, [placements]);

  const hiringTypes = useMemo(() => {
    return [
      ...new Set(
        placements
          .map((p) => p.type_of_hiring)
          .filter((type): type is "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER" => type !== null)
      ),
    ];
  }, [placements]);

  const filteredPlacements = useMemo(() => {
    return placements.filter((placement) => {
      const matchesSearch =
        placement.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        placement.job_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        placement.job_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        placement.program_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear = selectedYear === "all" || placement.year.toString() === selectedYear;
      const matchesCompany = selectedCompany === "all" || placement.company_name === selectedCompany;
      const matchesStatus = selectedStatus === "all" || placement.placement_status === selectedStatus;
      const matchesHiringType =
        selectedHiringType === "all" || placement.type_of_hiring === selectedHiringType;

      return matchesSearch && matchesYear && matchesCompany && matchesStatus && matchesHiringType;
    });
  }, [placements, searchQuery, selectedYear, selectedCompany, selectedStatus, selectedHiringType]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.company_name.toLowerCase().includes(companySearchQuery.toLowerCase())
    );
  }, [companies, companySearchQuery]);

  const handlePlacementClick = (placementId: number) => {
    router.push(`/placement/drives/${placementId}/registerations`);
  };

  const toggleColumn = (key: string) => {
    const column = COLUMNS.find((c) => c.key === key);
    if (column?.alwaysVisible) return;

    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = () => {
    const headers = COLUMNS.filter((c) => visibleColumns.has(c.key))
      .map((c) => c.label)
      .join(",");

    const rows = filteredPlacements.map((placement, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key)).map((c) => {
        if (c.key === "index") return index + 1;
        if (c.key === "ctc_range") {
          const min = placement.ctc_min_lpa || 0;
          const max = placement.ctc_max_lpa || 0;
          return `"${min} - ${max} LPA"`;
        }
        if (c.key === "stipend_range") {
          const min = placement.stipend_min || 0;
          const max = placement.stipend_max || 0;
          return `"₹${min} - ₹${max}"`;
        }
        if (c.key === "eligibility_cgpa") {
          return placement.eligibility_min_cgpa || "N/A";
        }
        const value = placement[c.key as keyof Placement];
        return `"${value !== null && value !== undefined ? value : ""}"`;
      }).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placements_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedYear("all");
    setSelectedCompany("all");
    setSelectedStatus("all");
    setSelectedHiringType("all");
  };

  const activeFiltersCount = [
    selectedYear !== "all",
    selectedCompany !== "all",
    selectedStatus !== "all",
    selectedHiringType !== "all",
  ].filter(Boolean).length;

  const handleAddPlacement = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const payload: any = {
        company_id: formData.company_id,
        company_remarks: formData.company_remarks || null,
        year: formData.year,
        type_of_hiring: formData.type_of_hiring,
        job_type: formData.job_type,
        job_description: formData.job_description || null,
        job_location: formData.job_location || null,
        onboarded_date: formData.onboarded_date || null,
        last_date_to_registration: formData.last_date_to_registration || null,
        number_of_openings: formData.number_of_openings,
        number_of_registrations: formData.number_of_registrations,
        no_shortlisted: formData.no_shortlisted,
        offer_letter_status: formData.offer_letter_status,
        placement_status: formData.placement_status,
        institution_id: formData.institution_id,
        school_id: formData.school_id,
        program_id: formData.program_id,
        specialization_id: formData.specialization_id,
        event_datetime: formData.event_datetime || null,
        tpo_id: formData.tpo_id,
        eligibility_min_cgpa: formData.eligibility_min_cgpa,
        eligibility_backlogs_allowed: formData.eligibility_backlogs_allowed,
        stipend_min: formData.stipend_min,
        stipend_max: formData.stipend_max,
        stipend_avg: formData.stipend_avg,
        ctc_min_lpa: formData.ctc_min_lpa,
        ctc_max_lpa: formData.ctc_max_lpa,
        ctc_variable_percentage: formData.ctc_variable_percentage,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create placement");
      }

      // Success toast
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Placement drive created successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);

      setShowAddModal(false);
      setFormData({
        company_id: null,
        company_remarks: "",
        year: new Date().getFullYear(),
        type_of_hiring: "FULL_TIME",
        job_type: "DOMESTIC",
        job_description: "",
        job_location: "",
        onboarded_date: "",
        last_date_to_registration: "",
        number_of_openings: null,
        number_of_registrations: null,
        no_shortlisted: null,
        offer_letter_status: "NOT_ISSUED",
        placement_status: "DRAFT",
        institution_id: null,
        school_id: null,
        program_id: null,
        specialization_id: null,
        event_datetime: "",
        tpo_id: null,
        eligibility_min_cgpa: null,
        eligibility_backlogs_allowed: null,
        stipend_min: null,
        stipend_max: null,
        stipend_avg: null,
        ctc_min_lpa: null,
        ctc_max_lpa: null,
        ctc_variable_percentage: null,
      });
      setCompanySearchQuery("");
      window.location.reload();
    } catch (err) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-error">
          <span>${err instanceof Error ? err.message : "Failed to create placement"}</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCompanyObj = companies.find((c) => c.id === formData.company_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Placement Drives</h1>
          <p className="text-base-content/60 mt-1">Manage all placement drives and registrations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Drive
          </button>
          <button className="btn btn-outline gap-2">
            <Download className="h-4 w-4" />
            Monthly Report
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by company, location, program..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Year Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedYear !== "all" ? "btn-primary" : ""}`}
          >
            {selectedYear === "all" ? "Year" : selectedYear}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-40 max-h-60 overflow-y-auto"
          >
            <li>
              <a onClick={() => setSelectedYear("all")} className={selectedYear === "all" ? "active" : ""}>
                All Years
              </a>
            </li>
            {years.map((year) => (
              <li key={year}>
                <a
                  onClick={() => setSelectedYear(year.toString())}
                  className={selectedYear === year.toString() ? "active" : ""}
                >
                  {year}
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
            className={`btn btn-outline gap-2 min-w-40 justify-between ${selectedCompany !== "all" ? "btn-primary" : ""}`}
          >
            {selectedCompany === "all"
              ? "Company"
              : selectedCompany.length > 15
              ? selectedCompany.substring(0, 15) + "..."
              : selectedCompany}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto"
          >
            <li>
              <a onClick={() => setSelectedCompany("all")} className={selectedCompany === "all" ? "active" : ""}>
                All Companies
              </a>
            </li>
            {companyNames.map((company) => (
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

        {/* Status Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedStatus !== "all" ? "btn-primary" : ""}`}
          >
            {selectedStatus === "all" ? "Status" : selectedStatus}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-40 max-h-60 overflow-y-auto"
          >
            <li>
              <a onClick={() => setSelectedStatus("all")} className={selectedStatus === "all" ? "active" : ""}>
                All Statuses
              </a>
            </li>
            {statuses.map((status) => (
              <li key={status}>
                <a
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? "active" : ""}
                >
                  {status}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Hiring Type Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-40 justify-between ${selectedHiringType !== "all" ? "btn-primary" : ""}`}
          >
            {selectedHiringType === "all" ? "Hiring Type" : HIRING_TYPE_LABELS[selectedHiringType]}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48 max-h-60 overflow-y-auto"
          >
            <li>
              <a onClick={() => setSelectedHiringType("all")} className={selectedHiringType === "all" ? "active" : ""}>
                All Types
              </a>
            </li>
            {hiringTypes.map((type) => (
              <li key={type}>
                <a
                  onClick={() => setSelectedHiringType(type)}
                  className={selectedHiringType === type ? "active" : ""}
                >
                  {HIRING_TYPE_LABELS[type]}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {activeFiltersCount > 0 && (
          <button onClick={clearFilters} className="btn btn-ghost gap-2">
            Clear Filters ({activeFiltersCount})
          </button>
        )}

        <div className="flex-1" />

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-outline gap-2">
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

        <button onClick={handleExport} className="btn btn-outline gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

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

      {!loading && !error && (
        <div className="border border-base-300 rounded-lg overflow-x-auto">
          {filteredPlacements.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No placement drives found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-base-200">
                  {COLUMNS.filter((c) => visibleColumns.has(c.key)).map((column) => (
                    <TableHead key={column.key} className="font-semibold text-base-content whitespace-nowrap">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlacements.map((placement, index) => (
                  <TableRow
                    key={placement.id}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() => handlePlacementClick(placement.id)}
                  >
                    {visibleColumns.has("index") && (
                      <TableCell className="text-base-content/60">{(currentPage - 1) * limit + index + 1}</TableCell>
                    )}
                    {visibleColumns.has("company_name") && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">{placement.company_name || "N/A"}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("year") && (
                      <TableCell>
                        <span className="badge badge-ghost badge-sm">{placement.year}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("type_of_hiring") && (
                      <TableCell>
                        {placement.type_of_hiring ? (
                          <span className="badge badge-sm badge-outline">
                            {HIRING_TYPE_LABELS[placement.type_of_hiring]}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("job_type") && (
                      <TableCell>
                        <span className="badge badge-sm badge-ghost">{placement.job_type || "N/A"}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("job_location") && (
                      <TableCell>
                        {placement.job_location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-base-content/60" />
                            {placement.job_location}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("number_of_openings") && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-base-content/60" />
                          {placement.number_of_openings || 0}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("number_of_registrations") && (
                      <TableCell>
                        <span className="badge badge-sm badge-primary">{placement.number_of_registrations}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("no_shortlisted") && (
                      <TableCell>
                        <span className="badge badge-sm badge-success">{placement.no_shortlisted}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("ctc_range") && (
                      <TableCell>
                        {placement.ctc_min_lpa || placement.ctc_max_lpa ? (
                          <div className="flex items-center gap-1 text-primary">
                            <IndianRupee className="h-3 w-3" />
                            {placement.ctc_min_lpa || 0} - {placement.ctc_max_lpa || 0}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("stipend_range") && (
                      <TableCell>
                        {placement.stipend_min || placement.stipend_max ? (
                          <span className="text-sm">
                            ₹{placement.stipend_min || 0} - ₹{placement.stipend_max || 0}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("eligibility_cgpa") && (
                      <TableCell>
                        <span className="badge badge-sm badge-info">{placement.eligibility_min_cgpa || "N/A"}</span>
                      </TableCell>
                    )}
                    {visibleColumns.has("placement_status") && (
                      <TableCell>
                        {placement.placement_status && (
                          <span className={`badge ${STATUS_COLORS[placement.placement_status]}`}>
                            {placement.placement_status}
                          </span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.has("school_name") && (
                      <TableCell className="max-w-xs truncate">{placement.school_name || "N/A"}</TableCell>
                    )}
                    {visibleColumns.has("program_name") && (
                      <TableCell className="max-w-xs truncate">{placement.program_name || "N/A"}</TableCell>
                    )}
                    {visibleColumns.has("specialization_name") && (
                      <TableCell className="max-w-xs truncate">{placement.specialization_name || "N/A"}</TableCell>
                    )}
                    {visibleColumns.has("event_datetime") && (
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-base-content/60" />
                          {formatDateTime(placement.event_datetime)}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.has("last_date_to_registration") && (
                      <TableCell className="text-sm">{formatDateTime(placement.last_date_to_registration)}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-base-content/60">
          Showing {filteredPlacements.length} of {totalPlacements} placements
          {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} active)`}
        </div>

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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────── */}
      {/*               Add Placement Modal                */}
      {/* ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-xl mb-6">Add New Placement Drive</h3>

            <div className="space-y-4">
              {/* Company */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Company <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedCompanyObj?.company_name || companySearchQuery}
                    onChange={(e) => {
                      setCompanySearchQuery(e.target.value);
                      setShowCompanyDropdown(true);
                      if (!e.target.value) {
                        setFormData({ ...formData, company_id: null });
                      }
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    className="input input-bordered w-full"
                    placeholder="Search company"
                  />
                  {showCompanyDropdown && filteredCompanies.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => {
                            setFormData({ ...formData, company_id: company.id });
                            setCompanySearchQuery(company.company_name);
                            setShowCompanyDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                        >
                          {company.company_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 1: Year, Hiring Type, Job Type */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Year *</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="input input-bordered"
                    placeholder="2024"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Hiring Type *</span>
                  </label>
                  <select
                    value={formData.type_of_hiring}
                    onChange={(e) => setFormData({ ...formData, type_of_hiring: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="INTERNSHIP_PLUS_PPO">Internship + PPO</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Type *</span>
                  </label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="DOMESTIC">Domestic</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Job Location, Number of Openings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Location</span>
                  </label>
                  <input
                    type="text"
                    value={formData.job_location}
                    onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
                    className="input input-bordered"
                    placeholder="Bangalore"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Number of Openings</span>
                  </label>
                  <input
                    type="number"
                    value={formData.number_of_openings || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, number_of_openings: e.target.value ? parseInt(e.target.value) : null })
                    }
                    className="input input-bordered"
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Description</span>
                </label>
                <textarea
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="Detailed job description..."
                />
              </div>

              {/* CTC Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">CTC Min (LPA)</span></label>
                  <input
                    type="number"
                    value={formData.ctc_min_lpa || ""}
                    onChange={(e) => setFormData({ ...formData, ctc_min_lpa: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="10"
                    step="0.1"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">CTC Max (LPA)</span></label>
                  <input
                    type="number"
                    value={formData.ctc_max_lpa || ""}
                    onChange={(e) => setFormData({ ...formData, ctc_max_lpa: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="15"
                    step="0.1"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Variable Pay (%)</span></label>
                  <input
                    type="number"
                    value={formData.ctc_variable_percentage || ""}
                    onChange={(e) => setFormData({ ...formData, ctc_variable_percentage: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Stipend Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Stipend Min (₹)</span></label>
                  <input
                    type="number"
                    value={formData.stipend_min || ""}
                    onChange={(e) => setFormData({ ...formData, stipend_min: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="30000"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Stipend Max (₹)</span></label>
                  <input
                    type="number"
                    value={formData.stipend_max || ""}
                    onChange={(e) => setFormData({ ...formData, stipend_max: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="50000"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Stipend Avg (₹)</span></label>
                  <input
                    type="number"
                    value={formData.stipend_avg || ""}
                    onChange={(e) => setFormData({ ...formData, stipend_avg: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="40000"
                  />
                </div>
              </div>

              {/* Eligibility */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Min CGPA</span></label>
                  <input
                    type="number"
                    value={formData.eligibility_min_cgpa || ""}
                    onChange={(e) => setFormData({ ...formData, eligibility_min_cgpa: e.target.value ? parseFloat(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="7.0"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Backlogs Allowed</span></label>
                  <input
                    type="number"
                    value={formData.eligibility_backlogs_allowed || ""}
                    onChange={(e) => setFormData({ ...formData, eligibility_backlogs_allowed: e.target.value ? parseInt(e.target.value) : null })}
                    className="input input-bordered"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* NEW: School, Program, Specialization Dropdowns */}
              <div className="grid grid-cols-3 gap-4">
                {/* School */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">School</span>
                  </label>
                  <select
                    value={formData.school_id || ""}
                    onChange={(e) => setFormData({ ...formData, school_id: e.target.value ? Number(e.target.value) : null })}
                    className="select select-bordered"
                    disabled={!resources?.schools}
                  >
                    <option value="">Select School</option>
                    {resources?.schools &&
                      Object.entries(resources.schools.mapping).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Program */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Program</span>
                  </label>
                  <select
                    value={formData.program_id || ""}
                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value ? Number(e.target.value) : null })}
                    className="select select-bordered"
                    disabled={!resources?.programs}
                  >
                    <option value="">Select Program</option>
                    {resources?.programs &&
                      Object.entries(resources.programs.mapping).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Specialization */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Specialization</span>
                  </label>
                  <select
                    value={formData.specialization_id || ""}
                    onChange={(e) => setFormData({ ...formData, specialization_id: e.target.value ? Number(e.target.value) : null })}
                    className="select select-bordered"
                    disabled={!resources?.specializations}
                  >
                    <option value="">Select Specialization</option>
                    {resources?.specializations &&
                      Object.entries(resources.specializations.mapping).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Onboarded Date</span></label>
                  <input
                    type="date"
                    value={formData.onboarded_date}
                    onChange={(e) => setFormData({ ...formData, onboarded_date: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Event Date & Time</span></label>
                  <input
                    type="datetime-local"
                    value={formData.event_datetime}
                    onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Last Registration Date</span></label>
                  <input
                    type="datetime-local"
                    value={formData.last_date_to_registration}
                    onChange={(e) => setFormData({ ...formData, last_date_to_registration: e.target.value })}
                    className="input input-bordered"
                  />
                </div>
              </div>

              {/* Status Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Placement Status *</span>
                  </label>
                  <select
                    value={formData.placement_status}
                    onChange={(e) => setFormData({ ...formData, placement_status: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="POSTPONED">Postponed</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Offer Letter Status *</span>
                  </label>
                  <select
                    value={formData.offer_letter_status}
                    onChange={(e) => setFormData({ ...formData, offer_letter_status: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="NOT_ISSUED">Not Issued</option>
                    <option value="ISSUED">Issued</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>
              </div>

              {/* Company Remarks */}
              <div className="form-control">
                <label className="label"><span className="label-text">Company Remarks</span></label>
                <textarea
                  value={formData.company_remarks}
                  onChange={(e) => setFormData({ ...formData, company_remarks: e.target.value })}
                  className="textarea textarea-bordered"
                  rows={2}
                  placeholder="Additional remarks..."
                />
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setShowAddModal(false)} disabled={isSaving} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleAddPlacement}
                disabled={isSaving || !formData.company_id}
                className="btn btn-primary"
              >
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "Create Drive"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isSaving && setShowAddModal(false)} />
        </div>
      )}
    </div>
  );
}