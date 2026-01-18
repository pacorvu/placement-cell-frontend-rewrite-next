"use client";

import { useState } from "react";

interface ResumeFormProps {
  isEditing: boolean;
}

export default function ResumeForm({ isEditing }: ResumeFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setUploadedFile(file);
      } else {
        alert("Please upload a PDF file under 5MB");
      }
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setUploadedFile(file);
      } else {
        alert("Please upload a PDF file under 5MB");
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="card bg-base-100 shadow border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-base-content mb-6">Resume</h2>

        {/* Upload Resume Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-base-content mb-4">
            Upload Resume
          </h3>

          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
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

                <label
                  htmlFor="resume-upload"
                  className="text-base-content/80 mb-2 cursor-pointer"
                >
                  <span className="text-primary font-medium hover:underline">
                    Click or Drag to Upload PDF
                  </span>
                </label>
                <p className="text-sm text-base-content/60">Max file size: 5MB</p>

                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
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
                    <div>
                      <p className="font-medium text-base-content">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleRemoveFile}
                      className="btn btn-ghost btn-sm btn-circle text-error"
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

              <button className="btn btn-primary btn-outline w-full md:w-auto">
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
                Preview & Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
