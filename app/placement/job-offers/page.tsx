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
import { Search, ChevronDown, Download, Plus, X, Columns3 } from "lucide-react";

interface JobOffer {
  id: number;
  usn: string;
  hiring_type: "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER" ;
  job_type: "DOMESTIC" | "INTERNATIONAL";
  internship_duration: number ;
  internship_stipend: number ;
  ctc_min_lpa: number ;
  ctc_max_lpa: number ;
  ctc_variable_pay: number;
  designation: string ;
  offer_letter_status: "NOT_ISSUED" | "ISSUED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" ;
  final_interview_status: "PASSED" | "FAILED" | "ABSENT";
  remarks: string ;
  company_id: number ;
  company_name: string;
  refered_by: string ;
  created_at: string;
  updated_at: string;
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

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Company[];
}

const COLUMNS = [
  { key: "index", label: "#", alwaysVisible: true },
  { key: "usn", label: "USN", alwaysVisible: true },
  { key: "company_name", label: "COMPANY", alwaysVisible: true },
  { key: "designation", label: "DESIGNATION" },
  { key: "hiring_type", label: "HIRING TYPE" },
  { key: "job_type", label: "JOB TYPE" },
  { key: "ctc_range", label: "CTC (LPA)" },
  { key: "internship_details", label: "INTERNSHIP DETAILS" },
  { key: "offer_letter_status", label: "OFFER STATUS" },
  { key: "final_interview_status", label: "INTERVIEW STATUS" },
  { key: "refered_by", label: "REFERRED BY" },
  { key: "remarks", label: "REMARKS" },
];

const STATUS_STYLES: Record<string, string> = {
  NOT_ISSUED: "bg-gray-100 text-gray-800",
  ISSUED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-orange-100 text-orange-800",
  PASSED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  ABSENT: "bg-yellow-100 text-yellow-800",
};

const HIRING_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
  INTERNSHIP_PLUS_PPO: "Internship + PPO",
  CONTRACT: "Contract",
  OTHER: "Other",
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  NOT_ISSUED: "Not Issued",
  ISSUED: "Issued",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default function JobOffersPage() {
  const router = useRouter();
  
  // API state
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedHiringType, setSelectedHiringType] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedOfferStatus, setSelectedOfferStatus] = useState("all");
  const [selectedInterviewStatus, setSelectedInterviewStatus] = useState("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "usn",
      "company_name",
      "designation",
      "hiring_type",
      "job_type",
      "ctc_range",
      "offer_letter_status",
      "final_interview_status",
    ])
  );

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    usn: "",
    hiring_type: "",
    job_type: "",
    internship_duration: "",
    internship_stipend: "",
    ctc_min_lpa: "",
    ctc_max_lpa: "",
    ctc_variable_pay: "",
    designation: "",
    offer_letter_status: "",
    final_interview_status: "",
    remarks: "",
    company_id: "",
    refered_by: "",
  });

  // Fetch job offers
  useEffect(() => {
    const fetchJobOffers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job offers");
        }

        const data: JobOffer[] = await response.json();
        setJobOffers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobOffers();
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=-1&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data: ApiResponse = await response.json();
        setCompanies(data.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Get unique filter values
  const uniqueCompanies = useMemo(() => {
    return [...new Set(jobOffers.map((o) => o.company_name).filter(Boolean))].sort();
  }, [jobOffers]);

  const uniqueHiringTypes = useMemo(() => {
    return [...new Set(jobOffers.map((o) => o.hiring_type).filter(Boolean))];
  }, [jobOffers]);

  const uniqueJobTypes = useMemo(() => {
    return [...new Set(jobOffers.map((o) => o.job_type).filter(Boolean))];
  }, [jobOffers]);

  const uniqueOfferStatuses = useMemo(() => {
    return [...new Set(jobOffers.map((o) => o.offer_letter_status).filter(Boolean))];
  }, [jobOffers]);

  const uniqueInterviewStatuses = useMemo(() => {
    return [...new Set(jobOffers.map((o) => o.final_interview_status))];
  }, [jobOffers]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return jobOffers.filter((offer) => {
      const matchesSearch =
        offer.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.refered_by?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = selectedCompany === "all" || offer.company_name === selectedCompany;
      const matchesHiringType = selectedHiringType === "all" || offer.hiring_type === selectedHiringType;
      const matchesJobType = selectedJobType === "all" || offer.job_type === selectedJobType;
      const matchesOfferStatus = selectedOfferStatus === "all" || offer.offer_letter_status === selectedOfferStatus;
      const matchesInterviewStatus = selectedInterviewStatus === "all" || offer.final_interview_status === selectedInterviewStatus;

      return matchesSearch && matchesCompany && matchesHiringType && matchesJobType && matchesOfferStatus && matchesInterviewStatus;
    });
  }, [jobOffers, searchQuery, selectedCompany, selectedHiringType, selectedJobType, selectedOfferStatus, selectedInterviewStatus]);

  // Filtered companies for dropdown
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      company.company_name.toLowerCase().includes(companySearchQuery.toLowerCase())
    );
  }, [companies, companySearchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedHiringType("all");
    setSelectedJobType("all");
    setSelectedOfferStatus("all");
    setSelectedInterviewStatus("all");
  };

  const resetForm = () => {
    setFormData({
      usn: "",
      hiring_type: "",
      job_type: "",
      internship_duration: "",
      internship_stipend: "",
      ctc_min_lpa: "",
      ctc_max_lpa: "",
      ctc_variable_pay: "",
      designation: "",
      offer_letter_status: "",
      final_interview_status: "",
      remarks: "",
      company_id: "",
      refered_by: "",
    });
    setCompanySearchQuery("");
  };
  const handleOfferClick = (id: string) => {
    router.push(`/placement/job-offers/${id}`);
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

    const rows = filteredOffers.map((offer, index) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return index + 1;
          if (c.key === "ctc_range") {
            const min = offer.ctc_min_lpa || 0;
            const max = offer.ctc_max_lpa || 0;
            return `"${min} - ${max} LPA"`;
          }
          if (c.key === "internship_details") {
            if (offer.internship_duration && offer.internship_stipend) {
              return `"${offer.internship_duration} months @ ₹${offer.internship_stipend}"`;
            }
            return '"-"';
          }
          const value = offer[c.key as keyof JobOffer];
          return `"${value !== null && value !== undefined ? value : ""}"`;
        })
        .join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job_offers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Prepare payload
      const payload: any = {
        usn: formData.usn,
        hiring_type: formData.hiring_type || null,
        job_type: formData.job_type || null,
        internship_duration: formData.internship_duration ? Number(formData.internship_duration) : null,
        internship_stipend: formData.internship_stipend ? Number(formData.internship_stipend) : null,
        ctc_min_lpa: formData.ctc_min_lpa ? Number(formData.ctc_min_lpa) : null,
        ctc_max_lpa: formData.ctc_max_lpa ? Number(formData.ctc_max_lpa) : null,
        ctc_variable_pay: formData.ctc_variable_pay ? Number(formData.ctc_variable_pay) : null,
        designation: formData.designation || null,
        offer_letter_status: formData.offer_letter_status || null,
        final_interview_status: formData.final_interview_status,
        remarks: formData.remarks || null,
        company_id: formData.company_id ? Number(formData.company_id) : null,
        refered_by: formData.refered_by || null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/`,
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
        throw new Error(errorData.detail || "Failed to create job offer");
      }

      const newOffer: JobOffer = await response.json();
      setJobOffers((prev) => [newOffer, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create job offer");
    } finally {
      setSubmitting(false);
    }
  };

  const activeFiltersCount = [
    selectedCompany !== "all",
    selectedHiringType !== "all",
    selectedJobType !== "all",
    selectedOfferStatus !== "all",
    selectedInterviewStatus !== "all",
  ].filter(Boolean).length;

  const selectedCompanyObj = companies.find((c) => c.id.toString() === formData.company_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Offers</h1>
          <p className="text-base-content/60 mt-1">
            All job offers across students and companies
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-success gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Offer
          </button>
          <button onClick={handleExport} className="btn btn-primary btn-outline gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            onClick={() => router.push("/placement/companies")}
            className="btn btn-outline"
          >
            Add New Company
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by USN, company, designation, or referred by"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-12 py-6"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Company Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-40 justify-between ${selectedCompany !== "all" ? "btn-primary" : ""}`}
          >
            {selectedCompany === "all" ? "Filter by Company" : selectedCompany}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-56 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedCompany("all")}
                className={selectedCompany === "all" ? "active" : ""}
              >
                All Companies
              </a>
            </li>
            {uniqueCompanies.map((company) => (
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

        {/* Hiring Type Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-40ify-between ${selectedHiringType !== "all" ? "btn-primary" : ""}`}
          >
            {selectedHiringType === "all" ? "Hiring Type" : HIRING_TYPE_LABELS[selectedHiringType]}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48"
          >
            <li>
              <a
                onClick={() => setSelectedHiringType("all")}
                className={selectedHiringType === "all" ? "active" : ""}
              >
                All Types
              </a>
            </li>
            {uniqueHiringTypes.map((type) => (
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

        {/* Job Type Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-35 justify-between ${selectedJobType !== "all" ? "btn-primary" : ""}`}
          >
            {selectedJobType === "all" ? "Job Type" : selectedJobType}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48"
          >
            <li>
              <a
                onClick={() => setSelectedJobType("all")}
                className={selectedJobType === "all" ? "active" : ""}
              >
                All Types
              </a>
            </li>
            {uniqueJobTypes.map((type) => (
              <li key={type}>
                <a
                  onClick={() => setSelectedJobType(type)}
                  className={selectedJobType === type ? "active" : ""}
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Offer Status Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-40 justify-between ${selectedOfferStatus !== "all" ? "btn-primary" : ""}`}
          >
            {selectedOfferStatus === "all" ? "Offer Status" : OFFER_STATUS_LABELS[selectedOfferStatus]}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48"
          >
            <li>
              <a
                onClick={() => setSelectedOfferStatus("all")}
                className={selectedOfferStatus === "all" ? "active" : ""}
              >
                All Statuses
              </a>
            </li>
            {uniqueOfferStatuses.map((status) => (
              <li key={status}>
                <a
                  onClick={() => setSelectedOfferStatus(status)}
                  className={selectedOfferStatus === status ? "active" : ""}
                >
                  {OFFER_STATUS_LABELS[status]}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Status Filter */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-40 justify-between ${selectedInterviewStatus !== "all" ? "btn-primary" : ""}`}
          >
            {selectedInterviewStatus === "all" ? "Interview Status" : selectedInterviewStatus}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-48"
          >
            <li>
              <a
                onClick={() => setSelectedInterviewStatus("all")}
                className={selectedInterviewStatus === "all" ? "active" : ""}
              >
                All Statuses
              </a>
            </li>
            {uniqueInterviewStatuses.map((status) => (
              <li key={status}>
                <a
                  onClick={() => setSelectedInterviewStatus(status)}
                  className={selectedInterviewStatus === status ? "active" : ""}
                >
                  {status}
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
        <div className="card bg-base-100 shadow border border-base-200">
          <div className="card-body p-0">
            {filteredOffers.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-base-content/60">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No job offers found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {filteredOffers.map((offer, index) => (
                      <TableRow
                        key={offer.id}
                        className="cursor-pointer hover:bg-base-200/50"
                        onClick={() => handleOfferClick( offer.id.toString())}
                      >
                        {visibleColumns.has("index") && (
                          <TableCell className="text-base-content/60">
                            {index + 1}
                          </TableCell>
                        )}
                        {visibleColumns.has("usn") && (
                          <TableCell className="font-mono text-primary font-medium">
                            {offer.usn}
                          </TableCell>
                        )}
                        {visibleColumns.has("company_name") && (
                          <TableCell className="text-primary font-medium">
                            {offer.company_name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.has("designation") && (
                          <TableCell className="text-base-content/80">
                            {offer.designation || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.has("hiring_type") && (
                          <TableCell>
                            {offer.hiring_type ? (
                              <span className="badge badge-sm badge-outline">
                                {HIRING_TYPE_LABELS[offer.hiring_type]}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has("job_type") && (
                          <TableCell>
                            {offer.job_type ? (
                              <span className="badge badge-sm badge-ghost">
                                {offer.job_type}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has("ctc_range") && (
                          <TableCell className="text-base-content/70">
                            {offer.ctc_min_lpa || offer.ctc_max_lpa ? (
                              <div className="flex flex-col gap-1">
                                <span>
                                  {offer.ctc_min_lpa || 0} - {offer.ctc_max_lpa || 0} LPA
                                </span>
                                {offer.ctc_variable_pay && (
                                  <span className="text-xs text-base-content/50">
                                    Variable: {offer.ctc_variable_pay}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has("internship_details") && (
                          <TableCell className="text-base-content/70">
                            {offer.internship_duration && offer.internship_stipend ? (
                              <div className="flex flex-col gap-1">
                                <span>{offer.internship_duration} months</span>
                                <span className="text-xs text-base-content/50">
                                  ₹{offer.internship_stipend.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has("offer_letter_status") && (
                          <TableCell>
                            {offer.offer_letter_status ? (
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded ${STATUS_STYLES[offer.offer_letter_status]}`}
                              >
                                {OFFER_STATUS_LABELS[offer.offer_letter_status]}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has("final_interview_status") && (
                          <TableCell>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded ${STATUS_STYLES[offer.final_interview_status]}`}
                            >
                              {offer.final_interview_status}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.has("refered_by") && (
                          <TableCell className="text-base-content/70">
                            {offer.refered_by || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.has("remarks") && (
                          <TableCell className="max-w-xs truncate text-base-content/60">
                            {offer.remarks || "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-base-content/60">
        Showing {filteredOffers.length} of {jobOffers.length} job offers
        {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active)`}
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-xl mb-6">Add Job Offer</h3>

            <div className="space-y-4">
              {/* USN */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    USN <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  className="input input-bordered"
                  placeholder="Enter student USN"
                />
              </div>

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
                        setFormData({ ...formData, company_id: "" });
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
                            setFormData({ ...formData, company_id: company.id.toString() });
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

              {/* Row 1: Designation, Hiring Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Designation</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Hiring Type</span>
                  </label>
                  <select
                    value={formData.hiring_type}
                    onChange={(e) => setFormData({ ...formData, hiring_type: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">Select Hiring Type</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="INTERNSHIP_PLUS_PPO">Internship + PPO</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Job Type, Referred By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Type</span>
                  </label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">Select Job Type</option>
                    <option value="DOMESTIC">Domestic</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Referred By</span>
                  </label>
                  <input
                    type="text"
                    value={formData.refered_by}
                    onChange={(e) => setFormData({ ...formData, refered_by: e.target.value })}
                    className="input input-bordered"
                    placeholder="Referrer name"
                  />
                </div>
              </div>

              {/* Internship Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internship Duration (months)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.internship_duration}
                    onChange={(e) => setFormData({ ...formData, internship_duration: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., 3"
                    min="0"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internship Stipend (₹)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.internship_stipend}
                    onChange={(e) => setFormData({ ...formData, internship_stipend: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., 50000"
                    min="0"
                  />
                </div>
              </div>

              {/* CTC Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CTC Min (LPA)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.ctc_min_lpa}
                    onChange={(e) => setFormData({ ...formData, ctc_min_lpa: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., 10"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">CTC Max (LPA)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.ctc_max_lpa}
                    onChange={(e) => setFormData({ ...formData, ctc_max_lpa: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., 12"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Variable Pay (%)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.ctc_variable_pay}
                    onChange={(e) => setFormData({ ...formData, ctc_variable_pay: e.target.value })}
                    className="input input-bordered"
                    placeholder="e.g., 10"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Status Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Offer Letter Status</span>
                  </label>
                  <select
                    value={formData.offer_letter_status}
                    onChange={(e) => setFormData({ ...formData, offer_letter_status: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">Select Status</option>
                    <option value="NOT_ISSUED">Not Issued</option>
                    <option value="ISSUED">Issued</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Final Interview Status <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={formData.final_interview_status}
                    onChange={(e) => setFormData({ ...formData, final_interview_status: e.target.value })}
                    className="select select-bordered"
                  >
                    <option value="">Select Status</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Remarks</span>
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="Additional notes or remarks"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="btn btn-ghost"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-success"
                disabled={submitting || !formData.usn || !formData.company_id || !formData.final_interview_status}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          />
        </div>
      )}
    </div>
  );
}