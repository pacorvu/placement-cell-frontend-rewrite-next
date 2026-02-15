"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Edit2,
  Save,
  X,
  Trash2,
  Clock,
  Award,
  FileText,
  Target,
  TrendingUp,
} from "lucide-react";

interface RegistrationPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface PlacementDrive {
  id: number;
  company_name: string | null;
  company_remarks: string | null;
  year: number;
  type_of_hiring: "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER" | null;
  job_type: "DOMESTIC" | "INTERNATIONAL" | null;
  job_description: string | null;
  job_location: string | null;
  onboarded_date: string | null;
  last_date_to_registration: string | null;
  number_of_openings: number | null;
  number_of_registrations: number;
  no_shortlisted: number;
  offer_letter_status: "NOT_ISSUED" | "ISSUED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | null;
  placement_status: "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "POSTPONED" | null;
  school_name: string | null;
  program_name: string | null;
  specialization_name: string | null;
  event_datetime: string | null;
  tpo_name: string | null;
  eligibility_min_cgpa: string | null;
  eligibility_backlogs_allowed: number | null;
  stipend_min: string | null;
  stipend_max: string | null;
  stipend_avg: string | null;
  ctc_min_lpa: string | null;
  ctc_max_lpa: string | null;
  ctc_variable_percentage: string | null;
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

interface ResourcesEnum {
  majors: {
    mapping: Record<string, string>;
    total: number;
  };
  minors: {
    mapping: Record<string, string>;
    total: number;
  };
  specializations: {
    mapping: Record<string, string>;
    total: number;
  };
  schools: {
    mapping: Record<string, string>;
    total: number;
  };
  programs: {
    mapping: Record<string, string>;
    total: number;
  };
}

interface EditFormData {
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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "badge-ghost",
  OPEN: "badge-success",
  CLOSED: "badge-error",
  CANCELLED: "badge-warning",
  POSTPONED: "badge-info",
  NOT_ISSUED: "badge-ghost",
  ISSUED: "badge-info",
  ACCEPTED: "badge-success",
  REJECTED: "badge-error",
  WITHDRAWN: "badge-warning",
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

function toLocalDatetimeString(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function toLocalDateString(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export default function RegistrationPage({ params }: RegistrationPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [drive, setDrive] = useState<PlacementDrive | null>(null);
  const [resources, setResources] = useState<ResourcesEnum | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const [editedData, setEditedData] = useState<EditFormData>({
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch placement drive details
        const driveResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!driveResponse.ok) {
          throw new Error("Failed to fetch placement drive");
        }

        const driveData: PlacementDrive = await driveResponse.json();
        setDrive(driveData);

        // Fetch resources enum
        const resourcesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/resources-enum`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resourcesResponse.ok) {
          throw new Error("Failed to fetch resources");
        }

        const resourcesData: ResourcesEnum = await resourcesResponse.json();
        setResources(resourcesData);

        // Fetch companies
        const companiesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=1&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!companiesResponse.ok) {
          throw new Error("Failed to fetch companies");
        }

        const companiesData = await companiesResponse.json();
        setCompanies(companiesData.data);

        // Set company search query if company name exists
        if (driveData.company_name) {
          setCompanySearchQuery(driveData.company_name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredCompanies = companies.filter((company) =>
    company.company_name.toLowerCase().includes(companySearchQuery.toLowerCase())
  );

  const handleSave = async () => {
    setShowSaveConfirm(false);
    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload: any = {
        company_id: editedData.company_id,
        company_remarks: editedData.company_remarks || null,
        year: editedData.year,
        type_of_hiring: editedData.type_of_hiring,
        job_type: editedData.job_type,
        job_description: editedData.job_description || null,
        job_location: editedData.job_location || null,
        onboarded_date: editedData.onboarded_date || null,
        last_date_to_registration: editedData.last_date_to_registration || null,
        number_of_openings: editedData.number_of_openings,
        number_of_registrations: editedData.number_of_registrations,
        no_shortlisted: editedData.no_shortlisted,
        offer_letter_status: editedData.offer_letter_status,
        placement_status: editedData.placement_status,
        institution_id: editedData.institution_id,
        school_id: editedData.school_id,
        program_id: editedData.program_id,
        specialization_id: editedData.specialization_id,
        event_datetime: editedData.event_datetime || null,
        tpo_id: editedData.tpo_id,
        eligibility_min_cgpa: editedData.eligibility_min_cgpa,
        eligibility_backlogs_allowed: editedData.eligibility_backlogs_allowed,
        stipend_min: editedData.stipend_min,
        stipend_max: editedData.stipend_max,
        stipend_avg: editedData.stipend_avg,
        ctc_min_lpa: editedData.ctc_min_lpa,
        ctc_max_lpa: editedData.ctc_max_lpa,
        ctc_variable_percentage: editedData.ctc_variable_percentage,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update placement drive");
      }

      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Placement drive updated successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);

      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-error">
          <span>${err instanceof Error ? err.message : "Failed to update placement drive"}</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/placements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete placement drive");
      }

      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Placement drive deleted successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 2000);

      setTimeout(() => {
        router.push("/placement/drives");
      }, 2000);
    } catch (err) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-error">
          <span>${err instanceof Error ? err.message : "Failed to delete placement drive"}</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (drive?.company_name) {
      setCompanySearchQuery(drive.company_name);
    }
  };

  const handleEdit = () => {
    if (!drive) return;

    // Find company ID from company name
    const company = companies.find((c) => c.company_name === drive.company_name);

    // Find IDs from resource mappings
    const schoolId = resources
      ? Object.entries(resources.schools.mapping).find(([_, name]) => name === drive.school_name)?.[0]
      : null;
    const programId = resources
      ? Object.entries(resources.programs.mapping).find(([_, name]) => name === drive.program_name)?.[0]
      : null;
    const specializationId = resources
      ? Object.entries(resources.specializations.mapping).find(
          ([_, name]) => name === drive.specialization_name
        )?.[0]
      : null;

    setEditedData({
      company_id: company?.id || null,
      company_remarks: drive.company_remarks || "",
      year: drive.year,
      type_of_hiring: drive.type_of_hiring || "FULL_TIME",
      job_type: drive.job_type || "DOMESTIC",
      job_description: drive.job_description || "",
      job_location: drive.job_location || "",
      onboarded_date: toLocalDateString(drive.onboarded_date),
      last_date_to_registration: toLocalDatetimeString(drive.last_date_to_registration),
      number_of_openings: drive.number_of_openings,
      number_of_registrations: drive.number_of_registrations,
      no_shortlisted: drive.no_shortlisted,
      offer_letter_status: drive.offer_letter_status || "NOT_ISSUED",
      placement_status: drive.placement_status || "DRAFT",
      institution_id: null,
      school_id: schoolId ? parseInt(schoolId) : null,
      program_id: programId ? parseInt(programId) : null,
      specialization_id: specializationId ? parseInt(specializationId) : null,
      event_datetime: toLocalDatetimeString(drive.event_datetime),
      tpo_id: null,
      eligibility_min_cgpa: drive.eligibility_min_cgpa ? parseFloat(drive.eligibility_min_cgpa) : null,
      eligibility_backlogs_allowed: drive.eligibility_backlogs_allowed,
      stipend_min: drive.stipend_min ? parseFloat(drive.stipend_min) : null,
      stipend_max: drive.stipend_max ? parseFloat(drive.stipend_max) : null,
      stipend_avg: drive.stipend_avg ? parseFloat(drive.stipend_avg) : null,
      ctc_min_lpa: drive.ctc_min_lpa ? parseFloat(drive.ctc_min_lpa) : null,
      ctc_max_lpa: drive.ctc_max_lpa ? parseFloat(drive.ctc_max_lpa) : null,
      ctc_variable_percentage: drive.ctc_variable_percentage ? parseFloat(drive.ctc_variable_percentage) : null,
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/60">Loading placement drive...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                {error ? "Error Loading Placement Drive" : "Placement drive not found"}
              </h2>
              <p className="text-base-content/60 mb-6">
                {error || "The placement drive you're looking for doesn't exist."}
              </p>
              <Link href="/placement/drives" className="btn btn-primary">
                Back to Drives
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedCompanyObj = companies.find((c) => c.id === editedData.company_id);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Changes</h3>
            <p className="mb-6">Are you sure you want to save these changes to the placement drive?</p>
            <div className="modal-action">
              <button onClick={() => setShowSaveConfirm(false)} className="btn btn-ghost" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !saving && setShowSaveConfirm(false)} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this placement drive? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-error" disabled={deleting}>
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
          <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteConfirm(false)} />
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-primary-content shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/placement/drives" className="btn btn-ghost btn-sm gap-2 hover:bg-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Drives
            </Link>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button onClick={handleEdit} className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90">
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-sm gap-2 btn-error">
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
                    onClick={() => setShowSaveConfirm(true)}
                    className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
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
                <h1 className="text-3xl md:text-4xl font-bold">{drive.company_name || "Unknown Company"}</h1>
                {drive.placement_status && (
                  <span className={`badge badge-lg ${STATUS_COLORS[drive.placement_status]}`}>
                    {drive.placement_status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <Calendar className="h-4 w-4" />
                  {drive.year}
                </div>
                {drive.type_of_hiring && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <Briefcase className="h-4 w-4" />
                    {HIRING_TYPE_LABELS[drive.type_of_hiring]}
                  </div>
                )}
                {drive.job_type && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <MapPin className="h-4 w-4" />
                    {drive.job_type}
                  </div>
                )}
                {drive.job_location && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <MapPin className="h-4 w-4" />
                    {drive.job_location}
                  </div>
                )}
              </div>

              <div className="text-sm opacity-90">
                Created: {formatDateTime(drive.created_at)} • Updated: {formatDateTime(drive.updated_at)}
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
            {/* Registration Stats */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Registration Stats
                </h2>
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Openings</p>
                    <p className="text-2xl font-bold text-primary">{drive.number_of_openings || 0}</p>
                  </div>
                  <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Registrations</p>
                    <p className="text-2xl font-bold text-success">{drive.number_of_registrations}</p>
                  </div>
                  <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-xs text-base-content/60 mb-1">Shortlisted</p>
                    <p className="text-2xl font-bold text-info">{drive.no_shortlisted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Eligibility
                </h2>
                <div className="space-y-4 mt-4">
                  {isEditing ? (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Min CGPA</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.eligibility_min_cgpa || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              eligibility_min_cgpa: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered input-sm"
                          placeholder="7.0"
                          step="0.1"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Backlogs Allowed</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.eligibility_backlogs_allowed || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              eligibility_backlogs_allowed: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          className="input input-bordered input-sm"
                          placeholder="0"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">Minimum CGPA</p>
                        <p className="text-lg font-semibold">{drive.eligibility_min_cgpa || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60 mb-1">Backlogs Allowed</p>
                        <p className="text-lg font-semibold">{drive.eligibility_backlogs_allowed ?? "N/A"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Program Details */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Program Details
                </h2>
                <div className="space-y-3 mt-4">
                  {isEditing ? (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">School</span>
                        </label>
                        <select
                          value={editedData.school_id || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              school_id: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select School</option>
                          {resources &&
                            Object.entries(resources.schools.mapping).map(([id, name]) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Program</span>
                        </label>
                        <select
                          value={editedData.program_id || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              program_id: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select Program</option>
                          {resources &&
                            Object.entries(resources.programs.mapping).map(([id, name]) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-xs">Specialization</span>
                        </label>
                        <select
                          value={editedData.specialization_id || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              specialization_id: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          className="select select-bordered select-sm"
                        >
                          <option value="">Select Specialization</option>
                          {resources &&
                            Object.entries(resources.specializations.mapping).map(([id, name]) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-base-content/60">School</p>
                        <p className="text-sm font-medium">{drive.school_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Program</p>
                        <p className="text-sm font-medium">{drive.program_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/60">Specialization</p>
                        <p className="text-sm font-medium">{drive.specialization_name || "N/A"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* TPO Details */}
            {drive.tpo_name && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    TPO Coordinator
                  </h2>
                  <p className="text-sm mt-2">{drive.tpo_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Basic Information
                </h2>
                {isEditing ? (
                  <div className="space-y-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Company</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedCompanyObj?.company_name || companySearchQuery}
                          onChange={(e) => {
                            setCompanySearchQuery(e.target.value);
                            setShowCompanyDropdown(true);
                            if (!e.target.value) {
                              setEditedData({ ...editedData, company_id: null });
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
                                  setEditedData({ ...editedData, company_id: company.id });
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Year</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.year}
                          onChange={(e) => setEditedData({ ...editedData, year: parseInt(e.target.value) })}
                          className="input input-bordered"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Job Location</span>
                        </label>
                        <input
                          type="text"
                          value={editedData.job_location}
                          onChange={(e) => setEditedData({ ...editedData, job_location: e.target.value })}
                          className="input input-bordered"
                          placeholder="Bangalore"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Hiring Type</span>
                        </label>
                        <select
                          value={editedData.type_of_hiring}
                          onChange={(e) => setEditedData({ ...editedData, type_of_hiring: e.target.value })}
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
                          <span className="label-text">Job Type</span>
                        </label>
                        <select
                          value={editedData.job_type}
                          onChange={(e) => setEditedData({ ...editedData, job_type: e.target.value })}
                          className="select select-bordered"
                        >
                          <option value="DOMESTIC">Domestic</option>
                          <option value="INTERNATIONAL">International</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Number of Openings</span>
                      </label>
                      <input
                        type="number"
                        value={editedData.number_of_openings || ""}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            number_of_openings: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="input input-bordered"
                        placeholder="10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Year</p>
                      <p className="text-base font-medium">{drive.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Job Location</p>
                      <p className="text-base font-medium">{drive.job_location || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Job Description
                </h2>
                {isEditing ? (
                  <textarea
                    value={editedData.job_description}
                    onChange={(e) => setEditedData({ ...editedData, job_description: e.target.value })}
                    className="textarea textarea-bordered w-full mt-4"
                    rows={4}
                    placeholder="Detailed job description..."
                  />
                ) : (
                  <div className="mt-4 p-4 bg-base-100 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{drive.job_description || "No description available"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compensation Details */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Compensation Details
                </h2>
                {isEditing ? (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">CTC Min (LPA)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.ctc_min_lpa || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              ctc_min_lpa: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="10"
                          step="0.1"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">CTC Max (LPA)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.ctc_max_lpa || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              ctc_max_lpa: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="15"
                          step="0.1"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Variable (%)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.ctc_variable_percentage || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              ctc_variable_percentage: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Stipend Min (₹)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.stipend_min || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              stipend_min: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="30000"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Stipend Max (₹)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.stipend_max || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              stipend_max: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="50000"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Stipend Avg (₹)</span>
                        </label>
                        <input
                          type="number"
                          value={editedData.stipend_avg || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              stipend_avg: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          className="input input-bordered"
                          placeholder="40000"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="p-4 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-2">CTC Range</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{drive.ctc_min_lpa || "0"} - ₹{drive.ctc_max_lpa || "0"} LPA
                      </p>
                      {drive.ctc_variable_percentage && (
                        <p className="text-xs text-base-content/60 mt-1">Variable: {drive.ctc_variable_percentage}%</p>
                      )}
                    </div>

                    <div className="p-4 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-2">Stipend Range</p>
                      <p className="text-2xl font-bold text-success">
                        ₹{drive.stipend_min || "0"} - ₹{drive.stipend_max || "0"}
                      </p>
                      {drive.stipend_avg && (
                        <p className="text-xs text-base-content/60 mt-1">Average: ₹{drive.stipend_avg}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Important Dates
                </h2>
                {isEditing ? (
                  <div className="space-y-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Onboarded Date</span>
                      </label>
                      <input
                        type="date"
                        value={editedData.onboarded_date}
                        onChange={(e) => setEditedData({ ...editedData, onboarded_date: e.target.value })}
                        className="input input-bordered"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Event Date & Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={editedData.event_datetime}
                        onChange={(e) => setEditedData({ ...editedData, event_datetime: e.target.value })}
                        className="input input-bordered"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Last Registration Date</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={editedData.last_date_to_registration}
                        onChange={(e) =>
                          setEditedData({ ...editedData, last_date_to_registration: e.target.value })
                        }
                        className="input input-bordered"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Onboarded</p>
                        <p className="text-xs text-base-content/60">{formatDate(drive.onboarded_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-info rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event</p>
                        <p className="text-xs text-base-content/60">{formatDateTime(drive.event_datetime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Registration Date</p>
                        <p className="text-xs text-base-content/60">
                          {formatDateTime(drive.last_date_to_registration)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Remarks */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Status & Remarks
                </h2>
                {isEditing ? (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Placement Status</span>
                        </label>
                        <select
                          value={editedData.placement_status}
                          onChange={(e) => setEditedData({ ...editedData, placement_status: e.target.value })}
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
                          <span className="label-text">Offer Letter Status</span>
                        </label>
                        <select
                          value={editedData.offer_letter_status}
                          onChange={(e) => setEditedData({ ...editedData, offer_letter_status: e.target.value })}
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
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Company Remarks</span>
                      </label>
                      <textarea
                        value={editedData.company_remarks}
                        onChange={(e) => setEditedData({ ...editedData, company_remarks: e.target.value })}
                        className="textarea textarea-bordered"
                        rows={3}
                        placeholder="Additional remarks..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-2">Placement Status</p>
                        {drive.placement_status && (
                          <span className={`badge ${STATUS_COLORS[drive.placement_status]}`}>
                            {drive.placement_status}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-2">Offer Letter Status</p>
                        {drive.offer_letter_status && (
                          <span className={`badge ${STATUS_COLORS[drive.offer_letter_status]}`}>
                            {drive.offer_letter_status}
                          </span>
                        )}
                      </div>
                    </div>
                    {drive.company_remarks && (
                      <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-1">Company Remarks</p>
                        <p className="text-sm">{drive.company_remarks}</p>
                      </div>
                    )}
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