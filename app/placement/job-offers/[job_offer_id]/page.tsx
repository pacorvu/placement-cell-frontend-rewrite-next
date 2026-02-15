"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Edit2,
  Save,
  X,
  Trash2,
  MapPin,
  User,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface JobOfferPageProps {
  params: Promise<{
    job_offer_id: string;
  }>;
}

interface JobOffer {
  id: number;
  usn: string;
  hiring_type:
  | "FULL_TIME"
  | "INTERNSHIP"
  | "INTERNSHIP_PLUS_PPO"
  | "CONTRACT"
  | "OTHER"
  | null;
  job_type: "DOMESTIC" | "INTERNATIONAL" | null;
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
  final_interview_status: "PASSED" | "FAILED" | "ABSENT";
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

const STATUS_COLORS: Record<string, string> = {
  NOT_ISSUED: "badge-ghost",
  ISSUED: "badge-info",
  ACCEPTED: "badge-success",
  REJECTED: "badge-error",
  WITHDRAWN: "badge-warning",
  PASSED: "badge-success",
  FAILED: "badge-error",
  ABSENT: "badge-warning",
};

function formatDate(dateString: string): string {
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

export default function JobOfferPage({ params }: JobOfferPageProps) {
  const router = useRouter();
  const { job_offer_id } = use(params);

  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const [editedData, setEditedData] = useState<Partial<JobOffer>>({});

  // Message banner state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-clear message after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchJobOffer = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/${job_offer_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job offer");
        }

        const data: JobOffer = await response.json();
        setJobOffer(data);
        setEditedData(data);
        if (data.company_name) {
          setCompanySearchQuery(data.company_name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobOffer();
  }, [job_offer_id]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=1&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data = await response.json();
        setCompanies(data.data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setCompaniesLoading(false);
      }
    };

    if (isEditing) {
      fetchCompanies();
    }
  }, [isEditing]);

  const filteredCompanies = companies.filter((company) =>
    company.company_name
      .toLowerCase()
      .includes(companySearchQuery.toLowerCase()),
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload: any = {
        usn: editedData.usn,
        hiring_type: editedData.hiring_type || null,
        job_type: editedData.job_type || null,
        internship_duration: editedData.internship_duration || null,
        internship_stipend: editedData.internship_stipend || null,
        ctc_min_lpa: editedData.ctc_min_lpa || null,
        ctc_max_lpa: editedData.ctc_max_lpa || null,
        ctc_variable_pay: editedData.ctc_variable_pay || null,
        designation: editedData.designation || null,
        offer_letter_status: editedData.offer_letter_status || null,
        final_interview_status: editedData.final_interview_status,
        remarks: editedData.remarks || null,
        company_id: editedData.company_id || null,
        refered_by: editedData.refered_by || null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/${job_offer_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update job offer");
      }

      const updatedData: JobOffer = await response.json();
      setJobOffer(updatedData);
      setEditedData(updatedData);
      setIsEditing(false);

      setMessage({ type: 'success', text: "Job offer updated successfully!" });
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to save changes";
      setMessage({ type: 'error', text: messageText });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job_offers/${job_offer_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete job offer");
      }

      router.push("/placement/job-offers");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete job offer");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setEditedData(jobOffer || {});
    setIsEditing(false);
    if (jobOffer?.company_name) {
      setCompanySearchQuery(jobOffer.company_name);
    }
  };

  const updateField = (field: keyof JobOffer, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/60">Loading job offer...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jobOffer) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                {error ? "Error Loading Job Offer" : "Job offer not found"}
              </h2>
              <p className="text-base-content/60 mb-6">
                {error || "The job offer you're looking for doesn't exist."}
              </p>
              <Link href="/placement/job-offers" className="btn btn-primary">
                Back to Job Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? editedData : jobOffer;
  const selectedCompanyObj = companies.find(
    (c) => c.id === displayData.company_id,
  );

  return (
    <div className="min-h-screen bg-base-100">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this job offer? This action cannot
              be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          />
        </div>
      )}

      {/* Header */}
      <div className="bg-base-300 text-primary-content shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

          {/* Message banner */}
          {message && (
            <div className={`mb-6 alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg`}>
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <Link
              href="/placement/job-offers"
              className="btn btn-ghost btn-sm gap-2 hover:bg-white/10"
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
              Back to Job Offers
            </Link>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-sm gap-2 btn-error"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="btn btn-sm gap-2 btn-ghost hover:bg-white/10"
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Header Info */}
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {displayData.designation || "No Designation"}
                </h1>
                <span
                  className={`badge badge-lg ${STATUS_COLORS[displayData.offer_letter_status || "NOT_ISSUED"]}`}
                >
                  {
                    OFFER_STATUS_LABELS[
                    displayData.offer_letter_status || "NOT_ISSUED"
                    ]
                  }
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <Building className="h-4 w-4" />
                  {displayData.company_name || "Unknown Company"}
                </div>
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <User className="h-4 w-4" />
                  {displayData.usn}
                </div>
                {displayData.hiring_type && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <Briefcase className="h-4 w-4" />
                    {HIRING_TYPE_LABELS[displayData.hiring_type]}
                  </div>
                )}
                {displayData.job_type && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <MapPin className="h-4 w-4" />
                    {displayData.job_type}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Student & Company Info */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </h2>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs text-base-content/60 mb-1">
                      Student USN
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.usn || ""}
                        onChange={(e) => updateField("usn", e.target.value)}
                        className="input input-bordered input-sm w-full"
                        placeholder="USN"
                        disabled
                      />
                    ) : (
                      <p className="text-sm font-medium">{displayData.usn}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 mb-1">Company</p>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            selectedCompanyObj?.company_name ||
                            companySearchQuery
                          }
                          onChange={(e) => {
                            setCompanySearchQuery(e.target.value);
                            setShowCompanyDropdown(true);
                            if (!e.target.value) {
                              updateField("company_id", null);
                            }
                          }}
                          onFocus={() => setShowCompanyDropdown(true)}
                          className="input input-bordered input-sm w-full"
                          placeholder="Search company"
                        />
                        {showCompanyDropdown &&
                          filteredCompanies.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredCompanies.map((company) => (
                                <div
                                  key={company.id}
                                  onClick={() => {
                                    updateField("company_id", company.id);
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
                    ) : (
                      <p className="text-sm font-medium">
                        {displayData.company_name || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 mb-1">
                      Referred By
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.refered_by || ""}
                        onChange={(e) =>
                          updateField("refered_by", e.target.value)
                        }
                        className="input input-bordered input-sm w-full"
                        placeholder="Referrer name"
                      />
                    ) : (
                      <p className="text-sm">
                        {displayData.refered_by || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Status
                </h2>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs text-base-content/60 mb-2">
                      Offer Letter Status
                    </p>
                    {isEditing ? (
                      <select
                        value={displayData.offer_letter_status || ""}
                        onChange={(e) =>
                          updateField("offer_letter_status", e.target.value)
                        }
                        className="select select-bordered select-sm w-full"
                      >
                        <option value="">Select Status</option>
                        <option value="NOT_ISSUED">Not Issued</option>
                        <option value="ISSUED">Issued</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WITHDRAWN">Withdrawn</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${STATUS_COLORS[displayData.offer_letter_status || "NOT_ISSUED"]}`}
                      >
                        {
                          OFFER_STATUS_LABELS[
                          displayData.offer_letter_status || "NOT_ISSUED"
                          ]
                        }
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 mb-2">
                      Interview Status
                    </p>
                    {isEditing ? (
                      <select
                        value={displayData.final_interview_status}
                        onChange={(e) =>
                          updateField("final_interview_status", e.target.value)
                        }
                        className="select select-bordered select-sm w-full"
                      >
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${STATUS_COLORS[displayData.final_interview_status!] ?? "badge-ghost"}`}
                      >
                        {displayData.final_interview_status ?? "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job Details
                </h2>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs text-base-content/60 mb-2">
                      Hiring Type
                    </p>
                    {isEditing ? (
                      <select
                        value={displayData.hiring_type || ""}
                        onChange={(e) =>
                          updateField("hiring_type", e.target.value)
                        }
                        className="select select-bordered select-sm w-full"
                      >
                        <option value="">Select Type</option>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="INTERNSHIP_PLUS_PPO">
                          Internship + PPO
                        </option>
                        <option value="CONTRACT">Contract</option>
                        <option value="OTHER">Other</option>
                      </select>
                    ) : (
                      <p className="text-sm">
                        {displayData.hiring_type
                          ? HIRING_TYPE_LABELS[displayData.hiring_type]
                          : "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 mb-2">
                      Job Type
                    </p>
                    {isEditing ? (
                      <select
                        value={displayData.job_type || ""}
                        onChange={(e) =>
                          updateField("job_type", e.target.value)
                        }
                        className="select select-bordered select-sm w-full"
                      >
                        <option value="">Select Type</option>
                        <option value="DOMESTIC">Domestic</option>
                        <option value="INTERNATIONAL">International</option>
                      </select>
                    ) : (
                      <p className="text-sm">{displayData.job_type || "N/A"}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-base-content/60 mb-2">
                      Designation
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.designation || ""}
                        onChange={(e) =>
                          updateField("designation", e.target.value)
                        }
                        className="input input-bordered input-sm w-full"
                        placeholder="Job designation"
                      />
                    ) : (
                      <p className="text-sm">
                        {displayData.designation || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* CTC Details */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Compensation Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="p-4 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">
                      Minimum CTC (LPA)
                    </p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayData.ctc_min_lpa || ""}
                        onChange={(e) =>
                          updateField(
                            "ctc_min_lpa",
                            parseFloat(e.target.value) || null,
                          )
                        }
                        className="input input-bordered w-full"
                        placeholder="e.g., 10"
                        step="0.1"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-primary">
                        ₹
                        {displayData.ctc_min_lpa?.toLocaleString("en-IN") ||
                          "0"}{" "}
                        LPA
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">
                      Maximum CTC (LPA)
                    </p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayData.ctc_max_lpa || ""}
                        onChange={(e) =>
                          updateField(
                            "ctc_max_lpa",
                            parseFloat(e.target.value) || null,
                          )
                        }
                        className="input input-bordered w-full"
                        placeholder="e.g., 12"
                        step="0.1"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-primary">
                        ₹
                        {displayData.ctc_max_lpa?.toLocaleString("en-IN") ||
                          "0"}{" "}
                        LPA
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">
                      Variable Pay (%)
                    </p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayData.ctc_variable_pay || ""}
                        onChange={(e) =>
                          updateField(
                            "ctc_variable_pay",
                            parseFloat(e.target.value) || null,
                          )
                        }
                        className="input input-bordered w-full"
                        placeholder="e.g., 10"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-secondary">
                        {displayData.ctc_variable_pay || 0}%
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-2">
                      Average CTC
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      ₹
                      {(
                        ((displayData.ctc_min_lpa || 0) +
                          (displayData.ctc_max_lpa || 0)) /
                        2
                      ).toLocaleString("en-IN")}{" "}
                      LPA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Internship Details */}
            {(displayData.hiring_type === "INTERNSHIP" ||
              displayData.hiring_type === "INTERNSHIP_PLUS_PPO" ||
              displayData.internship_duration ||
              displayData.internship_stipend ||
              isEditing) && (
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-xl flex items-center gap-2">
                      <Clock className="h-6 w-6 text-primary" />
                      Internship Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-xs text-base-content/60 mb-2">
                          Duration (months)
                        </p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={displayData.internship_duration || ""}
                            onChange={(e) =>
                              updateField(
                                "internship_duration",
                                parseInt(e.target.value) || null,
                              )
                            }
                            className="input input-bordered w-full"
                            placeholder="e.g., 3"
                            min="0"
                          />
                        ) : (
                          <p className="text-2xl font-bold">
                            {displayData.internship_duration || 0} months
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-xs text-base-content/60 mb-2">
                          Stipend
                        </p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={displayData.internship_stipend || ""}
                            onChange={(e) =>
                              updateField(
                                "internship_stipend",
                                parseFloat(e.target.value) || null,
                              )
                            }
                            className="input input-bordered w-full"
                            placeholder="e.g., 50000"
                            min="0"
                          />
                        ) : (
                          <p className="text-2xl font-bold text-success">
                            ₹
                            {displayData.internship_stipend?.toLocaleString(
                              "en-IN",
                            ) || "0"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Remarks */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Remarks
                </h2>
                {isEditing ? (
                  <textarea
                    value={displayData.remarks || ""}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    className="textarea textarea-bordered w-full mt-4"
                    rows={4}
                    placeholder="Additional notes or remarks about this job offer"
                  />
                ) : (
                  <div className="mt-4 p-4 bg-base-100 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {displayData.remarks || "No remarks available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
