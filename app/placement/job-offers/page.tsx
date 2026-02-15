"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Download, Plus, X, Columns3 } from "lucide-react";

// ────────────────────────────────────────────────
//   TYPES & CONSTANTS
// ────────────────────────────────────────────────

interface JobOffer {
  id: number;
  usn: string;
  hiring_type:
    | "FULL_TIME"
    | "INTERNSHIP"
    | "INTERNSHIP_PLUS_PPO"
    | "CONTRACT"
    | "OTHER";
  job_type: "DOMESTIC" | "INTERNATIONAL";
  internship_duration: number | null;
  internship_stipend: number | null;
  ctc_min_lpa: number | null;
  ctc_max_lpa: number | null;
  ctc_variable_pay: number | null;
  designation: string | null;
  offer_letter_status:
    | "NOT_ISSUED"
    | "ISSUED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN"
    | null;
  final_interview_status: "PASSED" | "FAILED" | "ABSENT" | null;
  remarks: string | null;
  company_id: number | null;
  company_name: string | null;
  refered_by: string | null;
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
  NOT_ISSUED: "badge badge-sm badge-ghost text-gray-700",
  ISSUED: "badge badge-sm badge-info",
  ACCEPTED: "badge badge-sm badge-success",
  REJECTED: "badge badge-sm badge-error",
  WITHDRAWN: "badge badge-sm badge-warning",
  PASSED: "badge badge-sm badge-success",
  FAILED: "badge badge-sm badge-error",
  ABSENT: "badge badge-sm badge-warning",
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

// ────────────────────────────────────────────────
//   COMPONENT
// ────────────────────────────────────────────────

export default function JobOffersPage() {
  const router = useRouter();

  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedHiringType, setSelectedHiringType] = useState<string>("all");
  const [selectedOfferStatus, setSelectedOfferStatus] = useState<string>("all");
  const [selectedInterviewStatus, setSelectedInterviewStatus] =
    useState<string>("all");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "index",
      "usn",
      "company_name",
      "designation",
      "hiring_type",
      "ctc_range",
      "offer_letter_status",
      "final_interview_status",
    ]),
  );

  // Add modal
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
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch job offers");

        const data: JobOffer[] = await res.json();
        setJobOffers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobOffers();
  }, []);

  // Fetch companies (for dropdown in modal)
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=-1&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!res.ok) throw new Error("Failed to fetch companies");

        const data: ApiResponse = await res.json();
        setCompanies(data.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter dropdown options
  const uniqueCompanies = useMemo(
    () =>
      [
        ...new Set(jobOffers.map((o) => o.company_name).filter(Boolean)),
      ].sort() as string[],
    [jobOffers],
  );

  const uniqueHiringTypes = useMemo(
    () =>
      [
        ...new Set(jobOffers.map((o) => o.hiring_type).filter(Boolean)),
      ] as string[],
    [jobOffers],
  );

  const uniqueJobTypes = useMemo(
    () =>
      [
        ...new Set(jobOffers.map((o) => o.job_type).filter(Boolean)),
      ] as string[],
    [jobOffers],
  );

  const uniqueOfferStatuses = useMemo(
    () =>
      [
        ...new Set(jobOffers.map((o) => o.offer_letter_status).filter(Boolean)),
      ] as string[],
    [jobOffers],
  );

  const uniqueInterviewStatuses = useMemo(
    () =>
      [
        ...new Set(
          jobOffers.map((o) => o.final_interview_status).filter(Boolean),
        ),
      ] as string[],
    [jobOffers],
  );

  // Filtered data
  const filteredOffers = useMemo(() => {
    return jobOffers.filter((offer) => {
      const matchesSearch =
        offer.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.company_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ??
          false) ||
        (offer.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        (offer.refered_by?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      const matchesCompany =
        selectedCompany === "all" || offer.company_name === selectedCompany;
      const matchesHiringType =
        selectedHiringType === "all" ||
        offer.hiring_type === selectedHiringType;
      const matchesOffer =
        selectedOfferStatus === "all" ||
        offer.offer_letter_status === selectedOfferStatus;
      const matchesInterview =
        selectedInterviewStatus === "all" ||
        offer.final_interview_status === selectedInterviewStatus;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesHiringType &&
        matchesOffer &&
        matchesInterview
      );
    });
  }, [
    jobOffers,
    searchQuery,
    selectedCompany,
    selectedHiringType,
    selectedOfferStatus,
    selectedInterviewStatus,
  ]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) =>
      c.company_name.toLowerCase().includes(companySearchQuery.toLowerCase()),
    );
  }, [companies, companySearchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("all");
    setSelectedHiringType("all");
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

  const handleOfferClick = (id: number) => {
    router.push(`/placement/job-offers/${id}`);
  };

  const toggleColumn = (key: string) => {
    const col = COLUMNS.find((c) => c.key === key);
    if (col?.alwaysVisible) return;

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

    const rows = filteredOffers.map((offer, idx) =>
      COLUMNS.filter((c) => visibleColumns.has(c.key))
        .map((c) => {
          if (c.key === "index") return idx + 1;
          if (c.key === "ctc_range") {
            const min = offer.ctc_min_lpa ?? 0;
            const max = offer.ctc_max_lpa ?? 0;
            return `"${min} - ${max} LPA"`;
          }
          if (c.key === "internship_details") {
            if (offer.internship_duration && offer.internship_stipend) {
              return `"${offer.internship_duration} months @ ₹${offer.internship_stipend}"`;
            }
            return '"-"';
          }
          const val = offer[c.key as keyof JobOffer];
          return `"${val ?? ""}"`;
        })
        .join(","),
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job_offers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No token");

      const payload: any = {
        usn: formData.usn,
        hiring_type: formData.hiring_type || null,
        job_type: formData.job_type || null,
        internship_duration: formData.internship_duration
          ? Number(formData.internship_duration)
          : null,
        internship_stipend: formData.internship_stipend
          ? Number(formData.internship_stipend)
          : null,
        ctc_min_lpa: formData.ctc_min_lpa ? Number(formData.ctc_min_lpa) : null,
        ctc_max_lpa: formData.ctc_max_lpa ? Number(formData.ctc_max_lpa) : null,
        ctc_variable_pay: formData.ctc_variable_pay
          ? Number(formData.ctc_variable_pay)
          : null,
        designation: formData.designation || null,
        offer_letter_status: formData.offer_letter_status || null,
        final_interview_status: formData.final_interview_status || null,
        remarks: formData.remarks || null,
        company_id: formData.company_id ? Number(formData.company_id) : null,
        refered_by: formData.refered_by || null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create job offer");
      }

      const newOffer: JobOffer = await res.json();
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
    selectedOfferStatus !== "all",
    selectedInterviewStatus !== "all",
  ].filter(Boolean).length;

  // ────────────────────────────────────────────────
  //   RENDER
  // ────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Offers</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary gap-2 rounded-none"
          >
            <Plus className="h-4 w-4" />
            Add Offer
          </button>
          <button
            onClick={handleExport}
            className="btn btn-outline gap-2 rounded-none"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => router.push("/placement/companies")}
            className="btn btn-outline rounded-none"
          >
            Add New Company
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
        <input
          type="text"
          placeholder="Search by USN, company, designation, referrer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-10 rounded-none"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Company */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[11rem] justify-between rounded-none ${selectedCompany !== "all" ? "btn-primary" : ""}`}
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
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-64 max-h-60 overflow-y-auto rounded-none"
          >
            <li>
              <a
                onClick={() => setSelectedCompany("all")}
                className={selectedCompany === "all" ? "active" : ""}
              >
                All Companies
              </a>
            </li>
            {uniqueCompanies.map((comp) => (
              <li key={comp}>
                <a
                  onClick={() => setSelectedCompany(comp)}
                  className={selectedCompany === comp ? "active" : ""}
                >
                  {comp}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Hiring Type */}
        <div
          tabIndex={0}
          role="button"
          className={` btn btn-outline gap-2 rounded-none min-w-[9rem] max-w-[16rem]     
            ${selectedHiringType !== "all" ? "btn-primary" : ""} `}
        >
          <span className="truncate flex-1 text-left">
            {selectedHiringType === "all"
              ? "Hiring Type"
              : HIRING_TYPE_LABELS[selectedHiringType] || selectedHiringType}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </div>

        {/* Offer Status */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[9.5rem] justify-between rounded-none ${selectedOfferStatus !== "all" ? "btn-primary" : ""}`}
          >
            {selectedOfferStatus === "all"
              ? "Offer Status"
              : OFFER_STATUS_LABELS[selectedOfferStatus] || selectedOfferStatus}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-52 rounded-none"
          >
            <li>
              <a
                onClick={() => setSelectedOfferStatus("all")}
                className={selectedOfferStatus === "all" ? "active" : ""}
              >
                All Statuses
              </a>
            </li>
            {uniqueOfferStatuses.map((s) => (
              <li key={s}>
                <a
                  onClick={() => setSelectedOfferStatus(s)}
                  className={selectedOfferStatus === s ? "active" : ""}
                >
                  {OFFER_STATUS_LABELS[s] || s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Status */}
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[10rem] justify-between rounded-none ${selectedInterviewStatus !== "all" ? "btn-primary" : ""}`}
          >
            {selectedInterviewStatus === "all"
              ? "Interview Status"
              : selectedInterviewStatus}
            <ChevronDown className="h-4 w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-52 rounded-none"
          >
            <li>
              <a
                onClick={() => setSelectedInterviewStatus("all")}
                className={selectedInterviewStatus === "all" ? "active" : ""}
              >
                All Statuses
              </a>
            </li>
            {uniqueInterviewStatuses.map((s) => (
              <li key={s}>
                <a
                  onClick={() => setSelectedInterviewStatus(s)}
                  className={selectedInterviewStatus === s ? "active" : ""}
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="btn btn-ghost gap-2 rounded-none"
          >
            Clear Filters ({activeFiltersCount})
          </button>
        )}

        <div className="flex-1" />

        {/* Columns */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-outline gap-2 rounded-none"
          >
            <Columns3 className="h-4 w-4" />
            Columns
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 w-60 max-h-96 overflow-y-auto rounded-none"
          >
            {COLUMNS.map((col) => (
              <li key={col.key}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    disabled={col.alwaysVisible}
                    className="checkbox checkbox-sm rounded-none"
                  />
                  {col.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Error */}
      {error && (
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
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto border border-base-300">
          {filteredOffers.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No job offers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  {COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
                    (col) => (
                      <th
                        key={col.key}
                        className="font-semibold text-base-content whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer, idx) => (
                  <tr
                    key={offer.id}
                    className="cursor-pointer hover:bg-base-200/50"
                    onClick={() => handleOfferClick(offer.id)}
                  >
                    {visibleColumns.has("index") && (
                      <td className="text-base-content/60">{idx + 1}</td>
                    )}

                    {visibleColumns.has("usn") && (
                      <td>
                        <span className="badge badge-primary badge-sm font-mono rounded-none">
                          {offer.usn}
                        </span>
                      </td>
                    )}

                    {visibleColumns.has("company_name") && (
                      <td className="font-medium">
                        {offer.company_name || "—"}
                      </td>
                    )}

                    {visibleColumns.has("designation") && (
                      <td>{offer.designation || "—"}</td>
                    )}

                    {visibleColumns.has("hiring_type") && (
                      <td className="whitespace-nowrap">
                        {offer.hiring_type ? (
                          <span
                            className="badge badge-outline badge-sm rounded-none
                                    px-2.5 py-1.5 min-w-[6.5rem] text-center "
                          >
                            {HIRING_TYPE_LABELS[offer.hiring_type] ||
                              offer.hiring_type}
                          </span>
                        ) : (
                          <span className="text-base-content/50">—</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.has("job_type") && (
                      <td>
                        {offer.job_type ? (
                          <span className="badge badge-ghost badge-sm rounded-none">
                            {offer.job_type}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {visibleColumns.has("ctc_range") && (
                      <td>
                        {offer.ctc_min_lpa || offer.ctc_max_lpa ? (
                          <div className="flex flex-col gap-0.5">
                            <span>
                              {offer.ctc_min_lpa ?? 0} –{" "}
                              {offer.ctc_max_lpa ?? 0} LPA
                            </span>
                            {offer.ctc_variable_pay && (
                              <span className="text-xs text-base-content/60">
                                Variable: {offer.ctc_variable_pay}%
                              </span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {visibleColumns.has("internship_details") && (
                      <td>
                        {offer.internship_duration &&
                        offer.internship_stipend ? (
                          <div className="flex flex-col gap-0.5">
                            <span>{offer.internship_duration} months</span>
                            <span className="text-xs text-base-content/60">
                              ₹{offer.internship_stipend.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {visibleColumns.has("offer_letter_status") && (
                      <td>
                        {offer.offer_letter_status ? (
                          <span
                            className={`badge badge-sm rounded-none ${STATUS_STYLES[offer.offer_letter_status]}`}
                          >
                            {OFFER_STATUS_LABELS[offer.offer_letter_status] ||
                              offer.offer_letter_status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {visibleColumns.has("final_interview_status") && (
                      <td>
                        {offer.final_interview_status ? (
                          <span
                            className={`badge badge-sm rounded-none ${STATUS_STYLES[offer.final_interview_status]}`}
                          >
                            {offer.final_interview_status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    {visibleColumns.has("refered_by") && (
                      <td className="text-base-content/70">
                        {offer.refered_by || "—"}
                      </td>
                    )}

                    {visibleColumns.has("remarks") && (
                      <td className="max-w-xs truncate text-base-content/60">
                        {offer.remarks || "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Footer info */}
      {!loading && !error && (
        <div className="text-sm text-base-content/60">
          Showing {filteredOffers.length} of {jobOffers.length} job offers
          {activeFiltersCount > 0 &&
            ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} active)`}
        </div>
      )}

      {/* ───── Add Offer Modal ───── */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 rounded-none"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-xl mb-6">Add Job Offer</h3>

            <div className="space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    USN <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.usn}
                  onChange={(e) =>
                    setFormData({ ...formData, usn: e.target.value })
                  }
                  className="input input-bordered rounded-none"
                  placeholder="1RV21CS001"
                />
              </div>

              <div className="form-control relative">
                <label className="label">
                  <span className="label-text">
                    Company <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={companySearchQuery}
                  onChange={(e) => {
                    setCompanySearchQuery(e.target.value);
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="input input-bordered rounded-none"
                  placeholder="Search company name..."
                />
                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded shadow max-h-60 overflow-y-auto">
                    {filteredCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            company_id: c.id.toString(),
                          });
                          setCompanySearchQuery(c.company_name);
                          setShowCompanyDropdown(false);
                        }}
                      >
                        {c.company_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Designation</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="input input-bordered rounded-none"
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Hiring Type</span>
                  </label>
                  <select
                    value={formData.hiring_type}
                    onChange={(e) =>
                      setFormData({ ...formData, hiring_type: e.target.value })
                    }
                    className="select select-bordered rounded-none"
                  >
                    <option value="">Select...</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="INTERNSHIP_PLUS_PPO">
                      Internship + PPO
                    </option>
                    <option value="CONTRACT">Contract</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* ... rest of the form fields remain the same ... */}

              <div className="modal-action mt-8">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn btn-ghost rounded-none"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary rounded-none"
                  disabled={submitting || !formData.usn || !formData.company_id}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Offer"
                  )}
                </button>
              </div>
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
