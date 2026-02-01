"use client";

import { useState, useEffect } from "react";

interface AlumniProfile {
  full_name: string;
  graduation_year: number;
  current_company: string;
  current_designation: string;
  current_work_location: string;
  personal_email: string;
  phone_number: string;
  other_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    [key: string]: any;
  };
  refered_by?: string;
  batch?: string;
  department?: string;
}

export default function AlumniProfilePage() {
  const [formData, setFormData] = useState<AlumniProfile>({
    full_name: "",
    graduation_year: 0,
    current_company: "",
    current_designation: "",
    current_work_location: "",
    personal_email: "",
    phone_number: "",
    other_links: {},
    refered_by: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get access token from localStorage
  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  };

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("user_id");
    }
    return null;
  };

  // Fetch alumni profile
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    const token = getAccessToken();
    const userId = getUserId();

    if (!token) {
      setError("Access token not found. Please login again.");
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setError("User ID not found. Please login again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setFormData({
        full_name: data.full_name || "",
        graduation_year: data.graduation_year || 0,
        current_company: data.current_company || "",
        current_designation: data.current_designation || "",
        current_work_location: data.current_work_location || "",
        personal_email: data.personal_email || "",
        phone_number: data.phone_number || "",
        other_links: data.other_links || {},
        refered_by: data.refered_by || "",
        batch: data.batch,
        department: data.department,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle nested other_links properties
    if (name === "linkedin" || name === "github" || name === "portfolio") {
      setFormData({
        ...formData,
        other_links: {
          ...formData.other_links,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === "graduation_year" ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const token = getAccessToken();
    const userId = getUserId();

    if (!token) {
      setError("Access token not found. Please login again.");
      setIsSaving(false);
      return;
    }

    if (!userId) {
      setError("User ID not found. Please login again.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        graduation_year: formData.graduation_year,
        current_company: formData.current_company,
        current_designation: formData.current_designation,
        current_work_location: formData.current_work_location,
        personal_email: formData.personal_email,
        phone_number: formData.phone_number,
        other_links: formData.other_links,
        refered_by: formData.refered_by || undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${userId}`,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update profile: ${response.statusText}`,
        );
      }

      // Refresh profile data after successful update
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-8">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-base-content/70">
                Manage your profile information
              </p>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Reset form data
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
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

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    className="input input-bordered w-full"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    type="email"
                    name="personal_email"
                    className="input input-bordered w-full"
                    value={formData.personal_email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    className="input input-bordered w-full"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Graduation Year
                    </span>
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    className="input input-bordered w-full"
                    value={formData.graduation_year || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g. 2023"
                  />
                </div>

                {formData.department && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Department
                      </span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      className="input input-bordered w-full bg-base-300"
                      value={formData.department}
                      disabled
                    />
                  </div>
                )}
              </div>

              {formData.refered_by !== undefined && (
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Referred By
                    </span>
                  </label>
                  <input
                    type="text"
                    name="refered_by"
                    className="input input-bordered w-full"
                    value={formData.refered_by}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Name of the person who referred you"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Current Employment */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Current Employment</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Company</span>
                  </label>
                  <input
                    type="text"
                    name="current_company"
                    className="input input-bordered w-full"
                    value={formData.current_company}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Designation
                    </span>
                  </label>
                  <input
                    type="text"
                    name="current_designation"
                    className="input input-bordered w-full"
                    value={formData.current_designation}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Work Location
                    </span>
                  </label>
                  <input
                    type="text"
                    name="current_work_location"
                    className="input input-bordered w-full"
                    value={formData.current_work_location}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Social Links</h2>

              <div className="grid grid-cols-1 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">LinkedIn</span>
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    className="input input-bordered w-full"
                    value={formData.other_links?.linkedin || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">GitHub</span>
                  </label>
                  <input
                    type="url"
                    name="github"
                    className="input input-bordered w-full"
                    value={formData.other_links?.github || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Portfolio Website
                    </span>
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    className="input input-bordered w-full"
                    value={formData.other_links?.portfolio || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
