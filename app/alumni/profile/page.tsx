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
  const [linkErrors, setLinkErrors] = useState<{ [key: string]: string }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
  const isValidHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateLink = (key: string, value: string) => {
    if (!value || value.trim() === "") {
      // Empty is NOT allowed - links are required once added
      setLinkErrors({
        ...linkErrors,
        [key]:
          "This link is required. Please enter a URL or remove this field.",
      });
      return false;
    }

    if (!isValidHttpUrl(value)) {
      setLinkErrors({
        ...linkErrors,
        [key]: "Please enter a valid URL starting with http:// or https://",
      });
      return false;
    }

    // Valid URL - clear any existing error
    const newErrors = { ...linkErrors };
    delete newErrors[key];
    setLinkErrors(newErrors);
    return true;
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
    // Validate required fields
    const newFieldErrors: { [key: string]: string } = {};

    if (!formData.full_name || formData.full_name.trim() === "") {
      newFieldErrors.full_name = "Full name is required";
    }

    if (!formData.phone_number || formData.phone_number.trim() === "") {
      newFieldErrors.phone_number = "Phone number is required";
    }

    // Validate all links before saving
    let hasErrors = false;
    const errors: { [key: string]: string } = {};

    Object.entries(formData.other_links).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        errors[key] =
          "This link is required. Please enter a URL or remove this field.";
        hasErrors = true;
      } else if (!isValidHttpUrl(value)) {
        errors[key] =
          "Please enter a valid URL starting with http:// or https://";
        hasErrors = true;
      }
    });

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError("Please fill in all required fields");
      if (hasErrors) {
        setLinkErrors(errors);
      }
      return;
    }

    if (hasErrors) {
      setLinkErrors(errors);
      setError("Please fix the invalid links before saving");
      return;
    }

    setIsSaving(true);
    setError(null);
    setFieldErrors({});

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
      setLinkErrors({});
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
                      setLinkErrors({});
                      setFieldErrors({});
                      fetchProfile(); // Reset form data
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary gap-2"
                    disabled={
                      isSaving ||
                      Object.keys(linkErrors).length > 0 ||
                      Object.keys(fieldErrors).length > 0
                    }
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
                    <span className="label-text font-semibold">
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    className={`input input-bordered w-full ${fieldErrors.full_name ? "input-error" : ""}`}
                    value={formData.full_name}
                    onChange={(e) => {
                      handleChange(e);
                      if (fieldErrors.full_name) {
                        const newErrors = { ...fieldErrors };
                        delete newErrors.full_name;
                        setFieldErrors(newErrors);
                      }
                    }}
                    disabled={!isEditing}
                  />
                  {fieldErrors.full_name && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {fieldErrors.full_name}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    type="email"
                    name="personal_email"
                    className="input input-bordered w-full bg-base-300"
                    value={formData.personal_email}
                    disabled
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      To change your email, contact the placement cell
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Phone <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    className={`input input-bordered w-full ${fieldErrors.phone_number ? "input-error" : ""}`}
                    value={formData.phone_number}
                    onChange={(e) => {
                      handleChange(e);
                      if (fieldErrors.phone_number) {
                        const newErrors = { ...fieldErrors };
                        delete newErrors.phone_number;
                        setFieldErrors(newErrors);
                      }
                    }}
                    disabled={!isEditing}
                  />
                  {fieldErrors.phone_number && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {fieldErrors.phone_number}
                      </span>
                    </label>
                  )}
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
                {Object.entries(formData.other_links).map(([key, value]) => (
                  <div key={key} className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold capitalize">
                        {key} <span className="text-error">*</span>
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedLinks = { ...formData.other_links };
                            delete updatedLinks[key];
                            setFormData({
                              ...formData,
                              other_links: updatedLinks,
                            });
                            // Clear error for this link
                            const newErrors = { ...linkErrors };
                            delete newErrors[key];
                            setLinkErrors(newErrors);
                          }}
                          className="btn btn-ghost btn-xs"
                        >
                          ✕
                        </button>
                      )}
                    </label>
                    <input
                      type="url"
                      className={`input input-bordered w-full ${linkErrors[key] ? "input-error" : ""}`}
                      value={value || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData({
                          ...formData,
                          other_links: {
                            ...formData.other_links,
                            [key]: newValue,
                          },
                        });
                        validateLink(key, newValue);
                      }}
                      disabled={!isEditing}
                      placeholder="https://example.com"
                    />
                    {linkErrors[key] && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {linkErrors[key]}
                        </span>
                      </label>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Link Name
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newLinkKey"
                        className="input input-bordered w-full"
                        placeholder="e.g., Twitter, Instagram"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            "newLinkKey",
                          ) as HTMLInputElement;
                          const newKey = input?.value?.trim();
                          if (newKey) {
                            setFormData({
                              ...formData,
                              other_links: {
                                ...formData.other_links,
                                [newKey]: "",
                              },
                            });
                            input.value = "";
                          }
                        }}
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {Object.keys(formData.other_links).length === 0 && (
                  <p className="text-base-content/60 text-center py-4">
                    No social links added yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
