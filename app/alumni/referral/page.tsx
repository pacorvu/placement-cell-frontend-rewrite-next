"use client";

import Link from "next/link";
import { useState } from "react";

export default function AlumniReferralPage() {
  const [formData, setFormData] = useState({
    // Job Details
    company: "",
    role: "",
    description: "",
    jobType: "Full-time",
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
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
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      company: "",
                      role: "",
                      description: "",
                      jobType: "Full-time",
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
                  }}
                  className="btn btn-outline"
                >
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
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
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
            Refer an Opportunity
          </h1>
          <p className="text-lg text-base-content/70">
            Help your juniors by connecting us with HRs or Hiring Managers from
            your network.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Details Section */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Job Details</h2>

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
                    className="input input-bordered"
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
                    className="input input-bordered"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Job Type */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Job Type</span>
                  </label>
                  <select
                    name="jobType"
                    className="select select-bordered"
                    value={formData.jobType}
                    onChange={handleChange}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Experience Level
                    </span>
                  </label>
                  <select
                    name="experienceLevel"
                    className="select select-bordered"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                </div>

                {/* Location */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Location</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Bangalore, Remote"
                    className="input input-bordered"
                    value={formData.location}
                    onChange={handleChange}
                  />
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
                    className="input input-bordered"
                    value={formData.salaryRange}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="grid grid-cols-1 gap-6 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Job Description / Link
                    </span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Brief description or link to the job posting..."
                    className="textarea textarea-bordered h-24 w-full"
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
                    className="input input-bordered"
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
                  <div className="join w-full">
                    <span className="join-item bg-base-300 flex items-center px-4">
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
                    </span>
                    <input
                      type="email"
                      name="hrEmail"
                      placeholder="hr@company.com"
                      className="input input-bordered join-item flex-1"
                      value={formData.hrEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* HR Phone */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      HR Phone (Optional)
                    </span>
                  </label>
                  <div className="join w-full">
                    <span className="join-item bg-base-300 flex items-center px-4">
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
                    </span>
                    <input
                      type="tel"
                      name="hrPhone"
                      placeholder="+91 9876543210"
                      className="input input-bordered join-item flex-1"
                      value={formData.hrPhone}
                      onChange={handleChange}
                    />
                  </div>
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
                    className="input input-bordered"
                    value={formData.hrLinkedIn}
                    onChange={handleChange}
                  />
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

              <div className="grid grid-cols-1 gap-6">
                {/* Application Deadline */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Application Deadline (Optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="input input-bordered"
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
                    className="textarea textarea-bordered h-20 w-full"
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
                    className="textarea textarea-bordered h-20 w-full"
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
      </div>
    </div>
  );
}
