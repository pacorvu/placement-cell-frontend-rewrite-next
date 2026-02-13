"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Building2, Globe, Linkedin } from "lucide-react";

interface Company {
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

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  data: Company[];
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

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const limit = 50;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    company_type: "",
    address: "",
    website: "",
    linkedin: "",
    remarks: "",
    logo: null as File | null,
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/all?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data: ApiResponse = await response.json();
        setCompanies(data.data);
        setTotalCompanies(data.total);
        setTotalPages(Math.ceil(data.total / data.limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [currentPage]);

  const companyTypes = useMemo(() => {
    return [
      ...new Set(
        companies
          .map((c) => c.company_type)
          .filter((type): type is string => type !== null),
      ),
    ].sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.company_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === "all" || company.company_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [companies, searchQuery, selectedType]);

  const resetForm = () => {
    setFormData({
      company_name: "",
      description: "",
      company_type: "",
      address: "",
      website: "",
      linkedin: "",
      remarks: "",
      logo: null,
    });
  };

  const handleCompanyClick = (companyId: number) => {
    router.push(`/placement/companies/${companyId}`);
  };

  const handleAddCompany = async () => {
    if (!formData.company_name.trim()) {
      alert("Company name is required");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const submitFormData = new FormData();
      submitFormData.append("company_name", formData.company_name);
      if (formData.description)
        submitFormData.append("description", formData.description);
      if (formData.company_type)
        submitFormData.append("company_type", formData.company_type);
      if (formData.address) submitFormData.append("address", formData.address);
      if (formData.website) submitFormData.append("website", formData.website);
      if (formData.linkedin)
        submitFormData.append("linkedin", formData.linkedin);
      if (formData.remarks) submitFormData.append("remarks", formData.remarks);
      if (formData.logo) submitFormData.append("logo", formData.logo);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/companies/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitFormData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add company");
      }

      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-success">
          <span>Company added successfully!</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);

      resetForm();
      setShowAddModal(false);
      window.location.reload();
    } catch (err) {
      const toastDiv = document.createElement("div");
      toastDiv.className = "toast toast-top toast-center";
      toastDiv.innerHTML = `
        <div class="alert alert-error">
          <span>${err instanceof Error ? err.message : "Failed to add company"}</span>
        </div>
      `;
      document.body.appendChild(toastDiv);
      setTimeout(() => toastDiv.remove(), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Companies</h1>
          <p className="text-base-content/60 mt-1">
            Browse hiring partners; click for full details
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-12"
          />
        </div>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-outline gap-2 min-w-[160px] justify-between ${
              selectedType !== "all" ? "btn-primary" : ""
            }`}
          >
            <Building2 className="h-4 w-4" />
            {selectedType === "all" ? "All Types" : selectedType}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
          >
            <li>
              <a
                onClick={() => setSelectedType("all")}
                className={selectedType === "all" ? "active" : ""}
              >
                All Types
              </a>
            </li>
            {companyTypes.map((type) => (
              <li key={type}>
                <a
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? "active" : ""}
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Total Companies</div>
          <div className="stat-value text-primary">{totalCompanies}</div>
          <div className="stat-desc">Across all categories</div>
        </div>
        <div className="stat">
          <div className="stat-title">Showing</div>
          <div className="stat-value text-secondary">
            {filteredCompanies.length}
          </div>
          <div className="stat-desc">
            {selectedType !== "all" || searchQuery
              ? "Filtered results"
              : "All companies"}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
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

      {/* Companies Grid */}
      {!loading && !error && (
        <>
          {filteredCompanies.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-base-content/60">
              <div className="text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No companies found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleCompanyClick(company.id)}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-base-300 hover:border-primary hover:bg-base-200/70 transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-base-200 group-hover:bg-base-300 flex items-center justify-center transition-colors shadow-sm">
                    {company.signed_url ? (
                      <img
                        src={company.signed_url}
                        alt={company.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${getAvatarColor(
                          company.company_name,
                        )}`}
                      >
                        <span className="text-lg font-bold text-white">
                          {getInitials(company.company_name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1 w-full">
                    <span className="text-sm text-center font-medium text-base-content leading-tight line-clamp-2">
                      {company.company_name}
                    </span>
                    {company.company_type && (
                      <span className="badge badge-ghost badge-xs">
                        {company.company_type}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
            </div>
          )}
        </>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-5 top-5"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-xl mb-8">Add Company</h3>

            <div className="space-y-6">
              {/* Company Name */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">
                    Company Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="input input-bordered w-full"
                  placeholder="Google"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Brief description of the company..."
                />
              </div>

              {/* Company Type */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Company Type</span>
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) =>
                    setFormData({ ...formData, company_type: e.target.value })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select Company Type</option>
                  {COMPANY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Address</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="textarea textarea-bordered w-full"
                  rows={2}
                  placeholder="Bangalore, Karnataka, India"
                />
              </div>

              {/* Website & LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text">Website</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="input input-bordered w-full pl-11"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text">LinkedIn</span>
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      className="input input-bordered w-full pl-11"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Company Logo</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logo: e.target.files?.[0] || null,
                    })
                  }
                  className="file-input file-input-bordered w-full"
                />
                {formData.logo && (
                  <p className="text-sm text-success mt-2">
                    Selected: {formData.logo.name}
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text">Remarks</span>
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="textarea textarea-bordered w-full"
                  rows={2}
                  placeholder="Additional notes or remarks..."
                />
              </div>
            </div>

            <div className="modal-action mt-10">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={isSaving}
                className="btn btn-ghost px-6"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCompany}
                disabled={isSaving || !formData.company_name.trim()}
                className="btn btn-primary px-8"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Add Company"
                )}
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={() => {
              if (!isSaving) {
                setShowAddModal(false);
                resetForm();
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
