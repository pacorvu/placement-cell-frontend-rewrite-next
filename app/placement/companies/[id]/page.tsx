"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Linkedin,
  MapPin,
  FileText,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";

interface CompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface CompanyData {
  id: number;
  company_name: string;
  description: string | null;
  company_type: string | null;
  address: string | null;
  website: string | null;
  linkedin: string | null;
  company_logo_link: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  signed_url: string | null;
}

interface CompanyUpdateData {
  company_name?: string;
  description?: string;
  company_type?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  remarks?: string;
  logo?: File | null;
}

const COMPANY_TYPES = [
  "SERVICE",
  "PRODUCT",
  "MANUFACTURING",
  "CONSTRUCTION",
  "EDUCATION",
  "FINTECH",
  "HEALTHCARE",
  "IT",
  "CONSULTING",
  "OTHER",
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

export default function CompanyPage({ params }: CompanyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editFormData, setEditFormData] = useState<CompanyUpdateData>({
    company_name: "",
    description: "",
    company_type: "",
    address: "",
    website: "",
    linkedin: "",
    remarks: "",
    logo: null,
  });

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch company details");
        }

        const data: CompanyData = await response.json();
        setCompany(data);
        setEditFormData({
          company_name: data.company_name,
          description: data.description || "",
          company_type: data.company_type || "",
          address: data.address || "",
          website: data.website || "",
          linkedin: data.linkedin || "",
          remarks: data.remarks || "",
          logo: null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (company) {
      setEditFormData({
        company_name: company.company_name,
        description: company.description || "",
        company_type: company.company_type || "",
        address: company.address || "",
        website: company.website || "",
        linkedin: company.linkedin || "",
        remarks: company.remarks || "",
        logo: null,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const submitFormData = new FormData();
      if (editFormData.company_name)
        submitFormData.append("company_name", editFormData.company_name);
      if (editFormData.description)
        submitFormData.append("description", editFormData.description);
      if (editFormData.company_type)
        submitFormData.append("company_type", editFormData.company_type);
      if (editFormData.address)
        submitFormData.append("address", editFormData.address);
      if (editFormData.website)
        submitFormData.append("website", editFormData.website);
      if (editFormData.linkedin)
        submitFormData.append("linkedin", editFormData.linkedin);
      if (editFormData.remarks)
        submitFormData.append("remarks", editFormData.remarks);
      if (editFormData.logo) submitFormData.append("logo", editFormData.logo);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitFormData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      const updatedData: CompanyData = await response.json();
      setCompany(updatedData);
      setIsEditing(false);

      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Company updated successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } catch (err) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-error">
          <span>${err instanceof Error ? err.message : "Failed to save changes"}</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDelete = async () => {
  //   setIsDeleting(true);
  //   try {
  //     const token = localStorage.getItem("access_token");
  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/${id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to delete company");
  //     }

  //     router.push("/placement/companies");
  //   } catch (err) {
  //     const toastDiv = document.createElement("div");
  //     toastDiv.className = "toast toast-top toast-center";
  //     toastDiv.innerHTML = `
  //       <div class="alert alert-error">
  //         <span>${err instanceof Error ? err.message : "Failed to delete company"}</span>
  //       </div>
  //     `;
  //     document.body.appendChild(toastDiv);
  //     setTimeout(() => toastDiv.remove(), 3000);
  //     setIsDeleting(false);
  //     setShowDeleteModal(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                {error ? "Error Loading Company" : "Company not found"}
              </h2>
              <p className="text-base-content/60 mb-6">
                {error || "The company you're looking for doesn't exist."}
              </p>
              <Link href="/placement/companies" className="btn btn-primary">
                Back to Companies
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/placement/companies"
            className="btn btn-ghost btn-sm gap-2"
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
            Back to Companies
          </Link>

          {!isEditing && (
            <div className="flex gap-2">
              <button onClick={handleEdit} className="btn btn-primary btn-sm">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              {/* <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-error btn-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button> */}
            </div>
          )}

          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-success btn-sm"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Company Logo & Basic Info */}
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-base-300 flex items-center justify-center mb-4 shadow-md">
                    {company.signed_url ? (
                      <img
                        src={company.signed_url}
                        alt={company.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${getAvatarColor(
                          company.company_name
                        )}`}
                      >
                        <span className="text-4xl font-bold text-white">
                          {getInitials(company.company_name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editFormData.company_name || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            company_name: e.target.value,
                          })
                        }
                        className="input input-bordered w-full mb-2"
                        placeholder="Company Name"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            logo: e.target.files?.[0] || null,
                          })
                        }
                        className="file-input file-input-bordered file-input-sm w-full"
                      />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold mb-2">
                        {company.company_name}
                      </h1>
                      {company.company_type && (
                        <span className="badge badge-primary badge-lg">
                          {company.company_type}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Company Type */}
            {isEditing && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-2">Company Type</h2>
                  <select
                    value={editFormData.company_type || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        company_type: e.target.value,
                      })
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Type</option>
                    {COMPANY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
                  <Globe className="h-5 w-5" />
                  Links
                </h2>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Website</span>
                        </label>
                        <input
                          type="url"
                          value={editFormData.website || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              website: e.target.value,
                            })
                          }
                          className="input input-bordered input-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">LinkedIn</span>
                        </label>
                        <input
                          type="url"
                          value={editFormData.linkedin || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              linkedin: e.target.value,
                            })
                          }
                          className="input input-bordered input-sm"
                          placeholder="https://linkedin.com/company/..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {company.website && (
                        <a
                          href={
                            company.website.startsWith("http")
                              ? company.website
                              : `https://${company.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm link link-hover"
                        >
                          <Globe className="h-5 w-5 text-base-content/60" />
                          <span className="flex-1">Website</span>
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                      {company.linkedin && (
                        <a
                          href={company.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm link link-hover"
                        >
                          <Linkedin className="h-5 w-5 text-blue-600" />
                          <span className="flex-1">LinkedIn</span>
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                      {!company.website && !company.linkedin && (
                        <p className="text-sm text-base-content/60 italic">
                          No links available
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <FileText className="h-5 w-5" />
                  Description
                </h2>
                {isEditing ? (
                  <textarea
                    value={editFormData.description || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="textarea textarea-bordered w-full"
                    rows={5}
                    placeholder="Company description..."
                  />
                ) : company.description ? (
                  <p className="text-base-content/80 leading-relaxed">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-base-content/60 italic">
                    No description available
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <MapPin className="h-5 w-5" />
                  Address
                </h2>
                {isEditing ? (
                  <textarea
                    value={editFormData.address || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: e.target.value,
                      })
                    }
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Company address..."
                  />
                ) : company.address ? (
                  <p className="text-base-content/80">{company.address}</p>
                ) : (
                  <p className="text-base-content/60 italic">
                    No address available
                  </p>
                )}
              </div>
            </div>

            {/* Remarks */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  <Building2 className="h-5 w-5" />
                  Remarks
                </h2>
                {isEditing ? (
                  <textarea
                    value={editFormData.remarks || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        remarks: e.target.value,
                      })
                    }
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Additional remarks..."
                  />
                ) : company.remarks ? (
                  <p className="text-base-content/80">{company.remarks}</p>
                ) : (
                  <p className="text-base-content/60 italic">
                    No remarks available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {/* {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete{" "}
              <strong>{company.company_name}</strong>? This action cannot be
              undone.
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
                onClick={handleDelete}
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
      )} */}
    </div>
  );
}