"use client";

import { useState } from "react";

export default function AlumniProfilePage() {
  const [formData, setFormData] = useState({
    // Personal Information
    name: "John Doe",
    usn: "1RVU19CSE001",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    batch: "2019-2023",
    department: "Computer Science",

    // Current Employment
    currentCompany: "Google",
    currentDesignation: "Software Engineer",
    currentLocation: "Bangalore",

    // Social Links
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.com",

    // Skills
    skills: "Python, React, Node.js, AWS, Docker",

    // Bio
    bio: "Passionate software engineer with 2 years of experience in full-stack development.",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

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
                    onClick={() => setIsEditing(false)}
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
                    name="name"
                    className="input input-bordered w-full"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">USN</span>
                  </label>
                  <input
                    type="text"
                    name="usn"
                    className="input input-bordered w-full bg-base-300"
                    value={formData.usn}
                    disabled
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full"
                    value={formData.email}
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
                    name="phone"
                    className="input input-bordered w-full"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Batch</span>
                  </label>
                  <input
                    type="text"
                    name="batch"
                    className="input input-bordered w-full bg-base-300"
                    value={formData.batch}
                    disabled
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Department</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    className="input input-bordered w-full bg-base-300"
                    value={formData.department}
                    disabled
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered h-24 w-full"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
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
                    name="currentCompany"
                    className="input input-bordered w-full"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Designation</span>
                  </label>
                  <input
                    type="text"
                    name="currentDesignation"
                    className="input input-bordered w-full"
                    value={formData.currentDesignation}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Location</span>
                  </label>
                  <input
                    type="text"
                    name="currentLocation"
                    className="input input-bordered w-full"
                    value={formData.currentLocation}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Skills & Expertise</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Skills (comma-separated)
                  </span>
                </label>
                <textarea
                  name="skills"
                  className="textarea textarea-bordered h-20 w-full"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="e.g. Python, React, Machine Learning, AWS"
                ></textarea>
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
                    value={formData.linkedin}
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
                    value={formData.github}
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
                    value={formData.portfolio}
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
