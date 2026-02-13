"use client";

import Link from "next/link";
import {use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface AlumniProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface AlumniData {
  id: number;
  usn: string | null;
  full_name: string;
  graduation_year: number | null;
  current_company: string | null;
  current_designation: string | null;
  current_work_location: string | null;
  phone_number: string | null;
  other_links: Record<string, string> | null;
  personal_email: string | null;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  refered_by: string | null;
}

interface AlumniUpdateData {
  usn?: string;
  full_name?: string;
  graduation_year?: number;
  current_company?: string;
  current_designation?: string;
  current_work_location?: string;
  personal_email?: string;
  phone_number?: string;
  other_links?: Record<string, string>;
  refered_by?: string;
}

interface LinkEntry {
  key: string;
  value: string;
}

// ──────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────

const getLinkIcon = (url: string) => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("linkedin.com")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }

  if (lowerUrl.includes("github.com")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    );
  }

  if (lowerUrl.includes("instagram.com")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
};

const getLinkName = (url: string, key?: string) => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("linkedin.com")) return "LinkedIn";
  if (lowerUrl.includes("github.com")) return "GitHub";
  if (lowerUrl.includes("instagram.com")) return "Instagram";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "Twitter / X";

  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    if (key) return key.charAt(0).toUpperCase() + key.slice(1);
    return "Website";
  }
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export default function AlumniProfilePage({ params }: AlumniProfilePageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const router = useRouter();

  const [alumni, setAlumni] = useState<AlumniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState<AlumniUpdateData>({});
  const [linkEntries, setLinkEntries] = useState<LinkEntry[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchAlumniProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch alumni profile");

        const data: AlumniData = await res.json();
        setAlumni(data);

        setEditFormData({
          usn: data.usn ?? "",
          full_name: data.full_name,
          graduation_year: data.graduation_year ?? undefined,
          current_company: data.current_company ?? "",
          current_designation: data.current_designation ?? "",
          current_work_location: data.current_work_location ?? "",
          personal_email: data.personal_email ?? "",
          phone_number: data.phone_number ?? "",
          refered_by: data.refered_by ?? "",
        });

        // Convert other_links → array of {key, value}
        const links = data.other_links ?? {};
        setLinkEntries(
          Object.entries(links)
            .filter(([, v]) => typeof v === "string" && v.trim() !== "")
            .map(([k, v]) => ({ key: k, value: v as string }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniProfile();
  }, [id]);

  const addLinkField = () => {
    setLinkEntries([...linkEntries, { key: "", value: "" }]);
  };

  const removeLinkField = (index: number) => {
    setLinkEntries(linkEntries.filter((_, i) => i !== index));
  };

  const updateLinkField = (index: number, field: "key" | "value", val: string) => {
    const newLinks = [...linkEntries];
    newLinks[index] = { ...newLinks[index], [field]: val };
    setLinkEntries(newLinks);
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    if (!alumni) return;

    setEditFormData({
      usn: alumni.usn ?? "",
      full_name: alumni.full_name,
      graduation_year: alumni.graduation_year ?? undefined,
      current_company: alumni.current_company ?? "",
      current_designation: alumni.current_designation ?? "",
      current_work_location: alumni.current_work_location ?? "",
      personal_email: alumni.personal_email ?? "",
      phone_number: alumni.phone_number ?? "",
      refered_by: alumni.refered_by ?? "",
    });

    const links = alumni.other_links ?? {};
    setLinkEntries(
      Object.entries(links)
        .filter(([, v]) => typeof v === "string" && v.trim() !== "")
        .map(([k, v]) => ({ key: k, value: v as string }))
    );

    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      // Build clean other_links object
      const otherLinks: Record<string, string> = {};
      linkEntries.forEach(({ key, value }) => {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (trimmedKey && trimmedValue) {
          otherLinks[trimmedKey] = trimmedValue;
        }
      });

      const updateData: AlumniUpdateData = {
        ...editFormData,
        other_links: otherLinks,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update profile");
      }

      const updatedData: AlumniData = await res.json();
      setAlumni(updatedData);
      setIsEditing(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save changes";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/alumni/${alumni?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete profile");

      router.push("/placement/alumni");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete profile";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">{error ? "Error" : "Not Found"}</h2>
              <p className="mb-6">{error || "Alumni profile not found."}</p>
              <Link href="/placement/alumni" className="btn btn-primary">
                Back to Alumni
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = (alumni.full_name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-base-100">
      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/placement/alumni" className="btn btn-ghost btn-sm gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {!isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleEdit} className="btn btn-primary btn-sm gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-error btn-sm gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={isSaving} className="btn btn-success btn-sm gap-2">
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "Save"}
              </button>
              <button onClick={handleCancelEdit} disabled={isSaving} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold">
                    {initials}
                  </div>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.full_name ?? ""}
                    onChange={(e) => setEditFormData((p) => ({ ...p, full_name: e.target.value }))}
                    className="input input-bordered w-full text-center text-xl font-bold"
                    placeholder="Full Name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{alumni.full_name}</h1>
                )}

                <div className="flex flex-col gap-1 w-full max-w-xs">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editFormData.usn ?? ""}
                        onChange={(e) => setEditFormData((p) => ({ ...p, usn: e.target.value }))}
                        className="input input-bordered input-sm"
                        placeholder="USN / Roll No"
                      />
                      <input
                        type="number"
                        value={editFormData.graduation_year ?? ""}
                        onChange={(e) =>
                          setEditFormData((p) => ({
                            ...p,
                            graduation_year: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        className="input input-bordered input-sm"
                        placeholder="Graduation Year"
                      />
                    </>
                  ) : (
                    <>
                      {alumni.usn && <p className="text-sm opacity-70">{alumni.usn}</p>}
                      {alumni.graduation_year && <p className="text-sm opacity-70">Class of {alumni.graduation_year}</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </h2>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Personal Email</span>
                        </label>
                        <input
                          type="email"
                          value={editFormData.personal_email ?? ""}
                          onChange={(e) => setEditFormData((p) => ({ ...p, personal_email: e.target.value }))}
                          className="input input-bordered"
                          placeholder="name@example.com"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          value={editFormData.phone_number ?? ""}
                          onChange={(e) => setEditFormData((p) => ({ ...p, phone_number: e.target.value }))}
                          className="input input-bordered"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {alumni.personal_email && (
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${alumni.personal_email}`} className="link link-hover break-all text-sm">
                            {alumni.personal_email}
                          </a>
                        </div>
                      )}

                      {alumni.phone_number && (
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{alumni.phone_number}</span>
                        </div>
                      )}

                      {!alumni.personal_email && !alumni.phone_number && (
                        <p className="text-sm opacity-60 italic">No contact info added yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links Card */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Links
                </h2>

                {isEditing ? (
                  <div className="space-y-4">
                    {linkEntries.map((entry, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="form-control flex-1">
                          <label className="label">
                            <span className="label-text">Platform / Name</span>
                          </label>
                          <input
                            type="text"
                            value={entry.key}
                            onChange={(e) => updateLinkField(index, "key", e.target.value)}
                            placeholder="e.g. linkedin, portfolio"
                            className="input input-bordered"
                          />
                        </div>
                        <div className="form-control flex-1">
                          <label className="label">
                            <span className="label-text">URL</span>
                          </label>
                          <input
                            type="url"
                            value={entry.value}
                            onChange={(e) => updateLinkField(index, "value", e.target.value)}
                            placeholder="https://..."
                            className="input input-bordered"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLinkField(index)}
                          className="btn btn-error btn-sm mb-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button type="button" onClick={addLinkField} className="btn btn-outline btn-sm gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(alumni.other_links ?? {}).length > 0 ? (
                      Object.entries(alumni.other_links ?? {}).map(([key, url]) =>
                        typeof url === "string" && url.trim() ? (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 text-sm link link-hover"
                          >
                            {getLinkIcon(url)}
                            <span className="flex-1">{getLinkName(url, key)}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : null
                      )
                    ) : (
                      <p className="text-sm opacity-60 italic">No links added yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Referred By */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Referred By
                </h2>

                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.refered_by ?? ""}
                    onChange={(e) => setEditFormData((p) => ({ ...p, refered_by: e.target.value }))}
                    className="input input-bordered"
                    placeholder="Name or USN of referrer"
                  />
                ) : alumni.refered_by ? (
                  <p className="text-sm">{alumni.refered_by}</p>
                ) : (
                  <p className="text-sm opacity-60 italic">Not specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Employment */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Current Employment</h2>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Company</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.current_company ?? ""}
                        onChange={(e) => setEditFormData((p) => ({ ...p, current_company: e.target.value }))}
                        className="input input-bordered"
                        placeholder="e.g. Google, TCS"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Designation</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.current_designation ?? ""}
                        onChange={(e) => setEditFormData((p) => ({ ...p, current_designation: e.target.value }))}
                        className="input input-bordered"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text">Work Location</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.current_work_location ?? ""}
                        onChange={(e) => setEditFormData((p) => ({ ...p, current_work_location: e.target.value }))}
                        className="input input-bordered"
                        placeholder="e.g. Bengaluru, Karnataka"
                      />
                    </div>
                  </div>
                ) : alumni.current_company || alumni.current_designation || alumni.current_work_location ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {alumni.current_company && (
                      <div>
                        <p className="text-sm opacity-60 mb-1">Company</p>
                        <p className="text-lg font-semibold text-primary">{alumni.current_company}</p>
                      </div>
                    )}
                    {alumni.current_designation && (
                      <div>
                        <p className="text-sm opacity-60 mb-1">Role</p>
                        <p className="text-lg font-semibold">{alumni.current_designation}</p>
                      </div>
                    )}
                    {alumni.current_work_location && (
                      <div>
                        <p className="text-sm opacity-60 mb-1">Location</p>
                        <p className="text-lg font-semibold">{alumni.current_work_location}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>No employment details added yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Delete profile of <strong>{alumni.full_name}</strong>?<br />
              This cannot be undone.
            </p>
            <div className="modal-action">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost" disabled={isDeleting}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-error">
                {isDeleting ? <span className="loading loading-spinner"></span> : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
        </div>
      )}
    </div>
  );
}