"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface ResumeFormProps {
  isEditing: boolean;
}

export default function ResumeForm({ isEditing }: ResumeFormProps) {
  const { user, isLoading } = useUser();
  const [resumeUrl, setResumeUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Populate form with user data
  useEffect(() => {
    // Assuming resume is stored in user profile or a specific field
    // Adjust this based on your actual data structure
    const existingResume = user?.resume_url || "";
    setResumeUrl(existingResume);
  }, [user]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeUrl(e.target.value);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // File drop handling would be implemented here
    // You would upload the file to a server and get back a URL
  };

  const handleRemoveResume = () => {
    setResumeUrl("");
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-base-content mb-6">Resume</h2>

        {/* Upload Resume Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-base-content mb-4">
            Upload Resume
          </h3>

          {!resumeUrl ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-primary"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-base-content/40 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <p className="text-base-content/80 mb-4">
                  Upload your resume to a cloud storage service (Google Drive,
                  Dropbox, etc.) and paste the link below
                </p>

                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium mb-2">
                    Resume URL
                  </label>
                  <input
                    type="text"
                    value={resumeUrl}
                    onChange={handleUrlChange}
                    disabled={!isEditing}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-base-content/60 mt-2">
                    Max file size: 5MB • Format: PDF
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-success/10 border border-success">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-error"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-base-content">Resume Uploaded</p>
                      <p className="text-sm text-base-content/60 break-all">
                        {resumeUrl}
                      </p>
                      {isValidUrl(resumeUrl) && (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <i className="material-icons text-sm">open_in_new</i>
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleRemoveResume}
                      className="btn btn-ghost btn-sm btn-circle text-error"
                      title="Remove Resume"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Update Resume URL
                    </label>
                    <input
                      type="text"
                      value={resumeUrl}
                      onChange={handleUrlChange}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="divider">OR</div>

        {/* Auto-Generate Resume Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-base-content mb-4">
            Auto-Generate Resume
          </h3>

          <div className="card bg-base-200">
            <div className="card-body">
              <p className="text-base-content/80 mb-4">
                Create a professional resume instantly using the data from your
                profile sections (Education, Projects, Skills, etc.).
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn btn-primary btn-outline flex-1 sm:flex-initial">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Preview Resume
                </button>

                <button className="btn btn-primary flex-1 sm:flex-initial">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>

              <div className="mt-4 p-3 bg-info/10 border border-info rounded-md">
                <p className="text-sm text-info-content">
                  <strong>Tip:</strong> Complete all profile sections for a more
                  comprehensive resume. Missing sections will be excluded from the
                  generated resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
