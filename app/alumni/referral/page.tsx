"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Referral {
  id: number;
  company_name: string;
  role: string;
  job_type: string;
  location: string;
  salary_range?: string;
  job_description?: string;
  hr_name: string;
  hr_email: string;
  hr_phone?: string;
  hr_linkedin_profile?: string;
  application_deadline?: string;
  required_skills?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
  alumni_id: number;
  seen: boolean;
  is_deleted: boolean;
}

export default function AlumniReferralPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "view">("submit");
  const [formData, setFormData] = useState({
    // Job Details
    company: "",
    role: "",
    description: "",
    jobType: "FULL_TIME",
    experienceLevel: "Entry",
    location: "",
    salaryRange: "",

    // HR Contact
    hrName: "",
    hrEmail: "",
    hrPhone: "",
    hrLinkedIn: "",

    // Additional Info
    deadline: "",
    requiredSkills: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View referrals state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

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

  // Fetch referrals
  const fetchReferrals = async (page: number) => {
    setIsLoading(true);
    setError(null);

    const token = getAccessToken();
    const userId = getUserId();

    if (!token) {
      setError("Access token not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      setError("User ID not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/referrals/alumni/${userId}?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch referrals: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different API response structures
      let referralData = [];
      if (Array.isArray(data)) {
        referralData = data;
      } else if (Array.isArray(data.referrals)) {
        referralData = data.referrals;
      } else if (Array.isArray(data.items)) {
        referralData = data.items;
      } else if (Array.isArray(data.data)) {
        referralData = data.data;
      }

      setReferrals(referralData);

      // Calculate total pages if provided
      if (data.total) {
        setTotalPages(Math.ceil(data.total / limit));
      } else if (data.pagination?.total) {
        setTotalPages(Math.ceil(data.pagination.total / limit));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch referrals",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load referrals when switching to view tab
  useEffect(() => {
    if (activeTab === "view") {
      fetchReferrals(currentPage);
    }
  }, [activeTab, currentPage]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = getAccessToken();
    const userId = getUserId();

    if (!token) {
      setError("Access token not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    if (!userId) {
      setError("User ID not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        company_name: formData.company,
        role: formData.role,
        job_type: formData.jobType,
        location: formData.location,
        salary_range: formData.salaryRange || undefined,
        job_description: formData.description || undefined,
        hr_name: formData.hrName,
        hr_email: formData.hrEmail,
        hr_phone: formData.hrPhone || undefined,
        hr_linkedin_profile: formData.hrLinkedIn || undefined,
        application_deadline: formData.deadline || undefined,
        required_skills: formData.requiredSkills || undefined,
        additional_notes: formData.notes || undefined,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/referrals/${userId}`,
        {
          method: "POST",
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
            `Failed to submit referral: ${response.statusText}`,
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit referral",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setError(null);
    setFormData({
      company: "",
      role: "",
      description: "",
      jobType: "FULL_TIME",
      experienceLevel: "Entry",
      location: "",
      salaryRange: "",
      hrName: "",
      hrEmail: "",
      hrPhone: "",
      hrLinkedIn: "",
      deadline: "",
      requiredSkills: "",
      notes: "",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center py-16">
              <div className="text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold mb-4">
                Referral Submitted Successfully!
              </h2>
              <p className="text-base-content/70 mb-8">
                Thank you for helping your juniors! The placement team will
                review your referral and reach out to the HR contact you
                provided.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/alumni/dashboard" className="btn btn-primary">
                  Back to Dashboard
                </Link>
                <button onClick={resetForm} className="btn btn-outline">
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-12">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/alumni/dashboard"
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
              Back
            </Link>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Alumni Referrals
          </h1>
          <p className="text-lg text-base-content/70">
            Help your juniors by connecting us with HRs or Hiring Managers from
            your network.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8 bg-base-200 p-1">
          <a
            className={`tab ${activeTab === "submit" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("submit")}
          >
            Submit Referral
          </a>
          <a
            className={`tab ${activeTab === "view" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            View Referrals
          </a>
        </div>

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

        {/* Submit Referral Tab */}
        {activeTab === "submit" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Details Section */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Job Details</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Company Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        placeholder="e.g. Google, Amazon"
                        className="input input-bordered w-full"
                        value={formData.company}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Role/Position */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Role / Position <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="role"
                        placeholder="e.g. Software Engineer Intern"
                        className="input input-bordered w-full"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Job Type */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Job Type <span className="text-error">*</span>
                        </span>
                      </label>
                      <select
                        name="jobType"
                        className="select select-bordered w-full"
                        value={formData.jobType}
                        onChange={handleChange}
                        required
                      >
                        <option value="FULL_TIME">Full-time</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="INTERNSHIP_PLUS_PPO">
                          Internship + PPO
                        </option>
                        <option value="CONTRACT">Contract</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Location <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="e.g. Bangalore, Remote"
                        className="input input-bordered w-full"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Salary Range (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="salaryRange"
                      placeholder="e.g. 10-15 LPA"
                      className="input input-bordered w-full max-w-sm m-2"
                      value={formData.salaryRange}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Job Description */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Job Description / Link
                      </span>
                    </label>
                    <textarea
                      name="description"
                      placeholder="Brief description or link to the job posting..."
                      className="textarea textarea-bordered h-32 w-full resize-none"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Contact Details Section */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">HR Contact Details</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* HR Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          HR Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="hrName"
                        placeholder="Name of the contact person"
                        className="input input-bordered w-full"
                        value={formData.hrName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* HR Email */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          HR Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-base-content/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <input
                          type="email"
                          name="hrEmail"
                          placeholder="hr@company.com"
                          className="grow"
                          value={formData.hrEmail}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    </div>

                    {/* HR Phone */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          HR Phone (Optional)
                        </span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-base-content/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <input
                          type="tel"
                          name="hrPhone"
                          placeholder="+91 9876543210"
                          className="grow"
                          value={formData.hrPhone}
                          onChange={handleChange}
                        />
                      </label>
                    </div>

                    {/* LinkedIn Profile */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          LinkedIn Profile (Optional)
                        </span>
                      </label>
                      <input
                        type="url"
                        name="hrLinkedIn"
                        placeholder="https://linkedin.com/in/..."
                        className="input input-bordered w-full"
                        value={formData.hrLinkedIn}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">
                  Additional Information
                </h2>

                <div className="space-y-6">
                  {/* Application Deadline */}
                  <div className="form-control max-w-sm">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Application Deadline (Optional)
                      </span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      className="input input-bordered w-full"
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Required Skills */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Required Skills/Qualifications
                      </span>
                    </label>
                    <textarea
                      name="requiredSkills"
                      placeholder="e.g. Python, React, Cloud Computing..."
                      className="textarea textarea-bordered h-24 w-full resize-none"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Additional Notes */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Additional Notes
                      </span>
                    </label>
                    <textarea
                      name="notes"
                      placeholder="Any specific context or advice for the placement team..."
                      className="textarea textarea-bordered h-24 w-full resize-none"
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="btn btn-primary btn-lg gap-2 min-w-64"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Referral
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* View Referrals Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : referrals.length === 0 ? (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-2xl font-bold mb-2">
                    No Referrals Found
                  </h3>
                  <p className="text-base-content/70">
                    You haven't submitted any referrals yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="card-body">
                        {/* Header Section */}
                        <div className="flex justify-between items-start pb-4 border-b border-base-300">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-1">
                              {referral.role}
                            </h3>
                            <p className="text-lg text-base-content/70 mb-3">
                              {referral.company_name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <div className="badge badge-primary badge-lg gap-1">
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
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {referral.job_type.replace(/_/g, " ")}
                              </div>
                              <div className="badge badge-outline badge-lg gap-1">
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
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {referral.location}
                              </div>
                              {referral.salary_range && (
                                <div className="badge badge-success badge-lg gap-1">
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
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {referral.salary_range} LPA
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* HR Contact Section */}
                        <div className="py-4 border-b border-base-300">
                          <h4 className="font-semibold text-base-content/80 mb-3 flex items-center gap-2">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            HR Contact Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center">
                                  <span className="text-xs font-semibold leading-none">
                                    {referral.hr_name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <span className="font-semibold">
                                {referral.hr_name}
                              </span>
                            </div>
                            <a
                              href={`mailto:${referral.hr_email}`}
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
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
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              {referral.hr_email}
                            </a>
                            {referral.hr_phone && (
                              <a
                                href={`tel:${referral.hr_phone}`}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
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
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                                {referral.hr_phone}
                              </a>
                            )}
                            {referral.hr_linkedin_profile && (
                              <a
                                href={
                                  referral.hr_linkedin_profile.startsWith(
                                    "http",
                                  )
                                    ? referral.hr_linkedin_profile
                                    : `https://${referral.hr_linkedin_profile}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Deadline Section */}
                        {referral.application_deadline && (
                          <div className="py-4 border-b border-base-300">
                            <div className="flex items-center gap-2">
                              <div className="badge badge-warning gap-2">
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
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Deadline:{" "}
                                {new Date(
                                  referral.application_deadline,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Description and Details */}
                        {(referral.job_description ||
                          referral.required_skills ||
                          referral.additional_notes) && (
                          <div className="space-y-3 pt-4">
                            {referral.job_description && (
                              <div>
                                <h4 className="font-semibold text-sm text-base-content/70 mb-1">
                                  Job Description
                                </h4>
                                <p className="text-sm bg-base-300 p-3 rounded-lg">
                                  {referral.job_description}
                                </p>
                              </div>
                            )}

                            {referral.required_skills && (
                              <div>
                                <h4 className="font-semibold text-sm text-base-content/70 mb-1">
                                  Required Skills
                                </h4>
                                <p className="text-sm bg-base-300 p-3 rounded-lg">
                                  {referral.required_skills}
                                </p>
                              </div>
                            )}

                            {referral.additional_notes && (
                              <div>
                                <h4 className="font-semibold text-sm text-base-content/70 mb-1">
                                  Additional Notes
                                </h4>
                                <p className="text-sm bg-base-300 p-3 rounded-lg">
                                  {referral.additional_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      Previous
                    </button>
                    <div className="join">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              className={`join-item btn btn-sm ${
                                currentPage === pageNum ? "btn-active" : ""
                              }`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
