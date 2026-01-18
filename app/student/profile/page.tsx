"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  { id: "personal", label: "Personal Data", hasData: true },
  { id: "contact", label: "Contact Info", hasData: false },
  { id: "parent", label: "Guardian Info", hasData: false },
  { id: "career", label: "Career Preferences", hasData: false },
  { id: "education", label: "Education", hasData: false },
  { id: "academic", label: "Academic Details", hasData: false },
  { id: "projects", label: "Projects", hasData: false, addable: true },
  { id: "internships", label: "Internships", hasData: false, addable: true },
  { id: "training", label: "Training", hasData: false, addable: true },
  {
    id: "certifications",
    label: "Certifications",
    hasData: false,
    addable: true,
  },
  { id: "publications", label: "Publications", hasData: false, addable: true },
  { id: "extracurricular", label: "Activities", hasData: false, addable: true },
  { id: "experiences", label: "Experiences", hasData: false, addable: true },
  { id: "resume", label: "Resume", hasData: false },
];

export default function StudentProfile() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-base-200 border-r border-base-300">
          <div className="p-4">
            <h2 className="text-sm font-bold text-base-content/60 uppercase mb-4">
              Profile Sections
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center gap-3 ${
                    activeSection === item.id
                      ? "bg-primary text-primary-content font-medium"
                      : "hover:bg-base-300 text-base-content"
                  }`}
                >
                  <span className="flex-1">{item.label}</span>
                  {item.hasData && activeSection !== item.id && (
                    <span className="badge badge-success badge-xs"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Profile Header */}
          <div className="card bg-base-100 shadow border border-base-300 mb-6">
            <div className="card-body">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-24">
                        <span className="text-3xl">U</span>
                      </div>
                    </div>
                    <button className="btn btn-circle btn-sm btn-primary absolute -bottom-1 -right-1">
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
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-base-content">
                      Student Name
                    </h1>
                    <p className="text-base-content/60">student@test.com</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`btn ${isEditing ? "btn-primary" : "btn-outline btn-primary"}`}
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active section */}
          {activeSection === "personal" && (
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base-content mb-4">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Gender</span>
                    </label>
                    <select
                      className="select select-bordered"
                      disabled={!isEditing}
                    >
                      <option>Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date of Birth</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Languages</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Add language"
                      className="input input-bordered"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="divider"></div>

                <h3 className="font-bold text-base-content mb-4">
                  Academic Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "School Name",
                    "Year of Joining",
                    "Program",
                    "Specialization",
                    "Major",
                    "Minor",
                  ].map((field) => (
                    <div key={field} className="form-control">
                      <label className="label">
                        <span className="label-text">{field}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={field}
                        className="input input-bordered"
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* For addable sections like Projects, Internships, etc. */}
          {sidebarItems.find((item) => item.id === activeSection)?.addable && (
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body text-center py-16">
                <h3 className="text-xl font-bold text-base-content mb-2">
                  No{" "}
                  {
                    sidebarItems.find((item) => item.id === activeSection)
                      ?.label
                  }{" "}
                  Added
                </h3>
                <p className="text-base-content/60 mb-6">
                  Start building your profile by adding your{" "}
                  {sidebarItems
                    .find((item) => item.id === activeSection)
                    ?.label.toLowerCase()}
                </p>
                <button className="btn btn-primary">
                  + Add{" "}
                  {
                    sidebarItems.find((item) => item.id === activeSection)
                      ?.label
                  }
                </button>
              </div>
            </div>
          )}

          {/* For other sections */}
          {!sidebarItems.find((item) => item.id === activeSection)?.addable &&
            activeSection !== "personal" && (
              <div className="card bg-base-100 shadow border border-base-300">
                <div className="card-body">
                  <div className="alert alert-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <div>
                      <h3 className="font-bold">Section Incomplete</h3>
                      <div className="text-sm">
                        Complete this section to improve your profile visibility
                        to recruiters.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
