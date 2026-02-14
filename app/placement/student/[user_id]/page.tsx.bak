"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Briefcase,
  FileText,
  Link2,
  Plus,
  Edit2,
  Save,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Languages,
  Building,
  Target,
  Heart,
  TrendingUp,
  BookOpen,
  Users,
  Upload,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

interface StudentPageProps {
  params: Promise<{
    user_id: string;
  }>;
}

interface PersonalDetails {
  usn: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  specially_abled: boolean;
  languages: string[];
  personal_email: string;
  verification_type: string | null;
  profile_image: string | null;
  profile_image_signed_url: string | null;
  school_name: string;
  year_of_joining: number;
  program_name: string;
  specialization_name: string;
  major_name: string;
  minor_name: string | null;
}

interface ProfileDetails {
  brief_summary: string;
  key_expertise: string;
  hobbies_interests: string[];
  career_objective: string;
  dream_package: number;
  dream_company: string;
}

interface ProfileCommunication {
  phone_number: string;
  links: Record<string, string>;
}

interface ParentDetail {
  id?: number;
  parent_type: string;
  name: string;
  occupation: string;
  organisation: string;
  email: string;
  phone_number: string;
}

interface EducationHistory {
  id?: number;
  education_level: string;
  institute_name: string;
  city: string;
  board: string;
  year_of_passing: number;
  result: number;
  result_type: string;
  subjects: string;
  marksheet_file: string | null;
  marksheet_file_signed_url: string | null;
  gap_type: string | null;
  gap_duration_months: number;
  gap_reason: string | null;
}

interface SemesterAcademic {
  id?: number;
  academic_year: number;
  semester: number;
  result_in_sgpa: number;
  closed_backlogs: number;
  live_backlogs: number;
  provisional_result_upload_link: string;
  provisional_result_upload_link_signed_url: string;
}

interface Project {
  id?: number;
  title: string;
  description: string;
  skills: string[];
  project_link: string;
  snaps: string[];
  snaps_signed_urls: string[];
  mentor_name: string;
}

interface Internship {
  id?: number;
  job_role: string;
  organization: string;
  organization_details: string | null;
  duration_months: number;
  start_date: string;
  end_date: string;
  location: string;
  stipend: number;
  skills: string[];
  description: string | null;
  mentor_name: string | null;
  proof_document: string;
  proof_document_signed_url: string;
}

interface Training {
  id?: number;
  title: string;
  institution: string;
  training_type: string;
  start_date: string;
  end_date: string;
  skills: string[];
  description: string | null;
  proof_document: string;
  proof_document_signed_url: string;
}

interface Certification {
  id?: number;
  title: string;
  organization: string;
  certification_type: string;
  skills: string[];
  score: number;
  issue_date: string;
  expiry_date: string;
  proof_document: string;
  proof_document_signed_url: string;
}

interface Publication {
  id?: number;
  title: string;
  publication_name: string;
  publication_type: string;
  publication_date: string;
  author_count: number;
  mentor_name: string;
  skills: string[];
  description: string | null;
  evidence_document: string;
  evidence_document_signed_url: string;
}

interface ExtraCurricularActivity {
  id?: number;
  activity_name: string;
  activity_type: string;
  role: string;
  organization: string;
  start_date: string;
  end_date: string;
  achievements: string[];
  skills: string[];
  description: string | null;
  proof_document: string;
  proof_document_signed_url: string;
}

interface OtherExperience {
  id?: number;
  title: string;
  organization: string;
  start_date: string;
  end_date: string | null;
  location: string;
  skills: string[];
  description: string | null;
  proof_document: string;
  proof_document_signed_url: string;
}

interface StudentData {
  user_id: number;
  role_name: string;
  personal_details: PersonalDetails;
  profile_details: ProfileDetails;
  profile_communication: ProfileCommunication;
  parent_details: ParentDetail[];
  education_history: EducationHistory[];
  semester_academics: SemesterAcademic[];
  projects: Project[];
  internships: Internship[];
  trainings: Training[];
  certifications: Certification[];
  publications: Publication[];
  extra_curricular_activities: ExtraCurricularActivity[];
  other_experiences: OtherExperience[];
}

function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  if (!name) return "NA";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ImageModal({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
      <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 btn btn-circle btn-sm"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

export default function StudentPage({ params }: StudentPageProps) {
  const { user_id } = use(params);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<StudentData>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["personal", "profile", "academics"])
  );
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/student/user/${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student profile");
        }

        const data: StudentData = await response.json();
        setStudent(data);
        setEditedData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user_id]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/student/user/${user_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      setStudent(updatedData);
      setEditedData(updatedData);
      setIsEditing(false);

      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(student || {});
    setIsEditing(false);
  };

  const updateField = (section: keyof StudentData, field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const updateArrayItem = (
    section: keyof StudentData,
    index: number,
    field: string,
    value: any
  ) => {
    setEditedData((prev) => {
      const array = (prev[section] as any[]) || [];
      const newArray = [...array];
      newArray[index] = {
        ...newArray[index],
        [field]: value,
      };
      return {
        ...prev,
        [section]: newArray,
      };
    });
  };

  const addArrayItem = (section: keyof StudentData, item: any) => {
    setEditedData((prev) => {
      const array = (prev[section] as any[]) || [];
      return {
        ...prev,
        [section]: [...array, item],
      };
    });
  };

  const removeArrayItem = (section: keyof StudentData, index: number) => {
    setEditedData((prev) => {
      const array = (prev[section] as any[]) || [];
      return {
        ...prev,
        [section]: array.filter((_, i) => i !== index),
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/60">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                {error ? "Error Loading Profile" : "Student not found"}
              </h2>
              <p className="text-base-content/60 mb-6">
                {error || "The student profile you're looking for doesn't exist."}
              </p>
              <Link href="/placement/student" className="btn btn-primary">
                Back to Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? editedData : student;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* Header */}
      <div className=" text-primary-content shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/placement/student"
              className="btn btn-ghost btn-sm gap-2 hover:bg-white/10"
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
              Back to Students
            </Link>

            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="btn btn-sm gap-2 btn-ghost hover:bg-white/10"
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary-content ring-offset-base-100 ring-offset-2 bg-base-200">
                {displayData.personal_details?.profile_image_signed_url ? (
                  <img
                    src={displayData.personal_details.profile_image_signed_url}
                    alt={displayData.personal_details?.full_name || "Profile"}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedImage(displayData.personal_details?.profile_image_signed_url || null)
                    }
                  />
                ) : (
                  <div className="bg-linear-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-4xl font-bold">
                    {getInitials(displayData.personal_details?.full_name || "")}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={displayData.personal_details?.full_name || ""}
                  onChange={(e) =>
                    updateField("personal_details", "full_name", e.target.value)
                  }
                  className="input input-bordered w-full max-w-md mb-2 text-2xl font-bold"
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {displayData.personal_details?.full_name || "N/A"}
                </h1>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <User className="h-4 w-4" />
                  {displayData.personal_details?.usn || "N/A"}
                </div>
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <GraduationCap className="h-4 w-4" />
                  {displayData.personal_details?.program_name || "N/A"} -{" "}
                  {displayData.personal_details?.specialization_name || "N/A"}
                </div>
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <Calendar className="h-4 w-4" />
                  Batch {displayData.personal_details?.year_of_joining || "N/A"}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={displayData.profile_details?.brief_summary || ""}
                  onChange={(e) =>
                    updateField("profile_details", "brief_summary", e.target.value)
                  }
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Brief summary about yourself"
                />
              ) : (
                <p className="text-lg opacity-90">
                  {displayData.profile_details?.brief_summary || "No summary provided"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact
                </h2>
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-base-content/60 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/60 mb-1">Personal Email</p>
                      {isEditing ? (
                        <input
                          type="email"
                          value={displayData.personal_details?.personal_email || ""}
                          onChange={(e) =>
                            updateField("personal_details", "personal_email", e.target.value)
                          }
                          className="input input-bordered input-sm w-full"
                          placeholder="email@example.com"
                        />
                      ) : (
                        <a
                          href={`mailto:${displayData.personal_details?.personal_email || ""}`}
                          className="text-sm link link-primary break-all"
                        >
                          {displayData.personal_details?.personal_email || "N/A"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-base-content/60 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 mb-1">Phone</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={displayData.profile_communication?.phone_number || ""}
                          onChange={(e) =>
                            updateField("profile_communication", "phone_number", e.target.value)
                          }
                          className="input input-bordered input-sm w-full"
                          placeholder="Phone number"
                        />
                      ) : (
                        <p className="text-sm">
                          {displayData.profile_communication?.phone_number || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Languages className="h-5 w-5 text-base-content/60 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-base-content/60 mb-1">Languages</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.personal_details?.languages?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(
                              "personal_details",
                              "languages",
                              e.target.value.split(",").map((l) => l.trim())
                            )
                          }
                          className="input input-bordered input-sm w-full"
                          placeholder="English, Spanish, etc."
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {displayData.personal_details?.languages?.map((lang, idx) => (
                            <span key={idx} className="badge badge-sm">
                              {lang}
                            </span>
                          )) || <span className="text-sm text-base-content/60">N/A</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Links
                </h2>
                <div className="space-y-2 mt-4">
                  {isEditing ? (
                    <>
                      {Object.entries(displayData.profile_communication?.links || {}).map(
                        ([key, url], idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={key}
                              onChange={(e) => {
                                const newLinks = { ...displayData.profile_communication?.links };
                                delete newLinks[key];
                                newLinks[e.target.value] = url;
                                updateField("profile_communication", "links", newLinks);
                              }}
                              className="input input-bordered input-sm flex-1"
                              placeholder="Platform"
                            />
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => {
                                updateField("profile_communication", "links", {
                                  ...displayData.profile_communication?.links,
                                  [key]: e.target.value,
                                });
                              }}
                              className="input input-bordered input-sm flex-2"
                              placeholder="URL"
                            />
                            <button
                              onClick={() => {
                                const newLinks = { ...displayData.profile_communication?.links };
                                delete newLinks[key];
                                updateField("profile_communication", "links", newLinks);
                              }}
                              className="btn btn-sm btn-error btn-outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => {
                          updateField("profile_communication", "links", {
                            ...displayData.profile_communication?.links,
                            "": "",
                          });
                        }}
                        className="btn btn-sm btn-outline gap-2 w-full"
                      >
                        <Plus className="h-4 w-4" />
                        Add Link
                      </button>
                    </>
                  ) : (
                    <>
                      {Object.entries(displayData.profile_communication?.links || {})
                        .filter(([_, url]) => url)
                        .map(([key, url]) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm link link-primary p-2 hover:bg-base-300 rounded-lg transition-colors"
                          >
                            <Link2 className="h-4 w-4 shrink-0" />
                            <span className="capitalize truncate">{key}</span>
                            <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                          </a>
                        ))}
                      {Object.keys(displayData.profile_communication?.links || {}).length === 0 && (
                        <p className="text-sm text-base-content/60 text-center py-4">
                          No links added
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Career Goals */}
            <div className="card bg-primary text-primary-content shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Career Goals
                </h2>
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-xs opacity-70 mb-1">Dream Company</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.profile_details?.dream_company || ""}
                        onChange={(e) =>
                          updateField("profile_details", "dream_company", e.target.value)
                        }
                        className="input input-bordered input-sm w-full bg-white text-black"
                        placeholder="Dream Company"
                      />
                    ) : (
                      <p className="text-lg font-semibold">
                        {displayData.profile_details?.dream_company || "N/A"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs opacity-70 mb-1">Dream Package</p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={displayData.profile_details?.dream_package || 0}
                        onChange={(e) =>
                          updateField("profile_details", "dream_package", Number(e.target.value))
                        }
                        className="input input-bordered input-sm w-full bg-white text-black"
                        placeholder="Dream Package"
                      />
                    ) : (
                      <p className="text-2xl font-bold">
                        ₹
                        {displayData.profile_details?.dream_package?.toLocaleString("en-IN") ||
                          "0"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hobbies */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Hobbies & Interests
                </h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayData.profile_details?.hobbies_interests?.join(", ") || ""}
                    onChange={(e) =>
                      updateField(
                        "profile_details",
                        "hobbies_interests",
                        e.target.value.split(",").map((h) => h.trim())
                      )
                    }
                    className="input input-bordered input-sm w-full mt-4"
                    placeholder="Reading, Gaming, etc."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {displayData.profile_details?.hobbies_interests?.map((hobby, idx) => (
                      <span key={idx} className="badge badge-primary badge-outline">
                        {hobby}
                      </span>
                    )) || <p className="text-sm text-base-content/60">No hobbies added</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Parent Details */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Parent Details
                </h2>
                <div className="space-y-4 mt-4">
                  {isEditing ? (
                    <>
                      {displayData.parent_details?.map((parent, idx) => (
                        <div key={idx} className="p-3 bg-base-100 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <select
                              value={parent.parent_type}
                              onChange={(e) =>
                                updateArrayItem("parent_details", idx, "parent_type", e.target.value)
                              }
                              className="select select-bordered select-sm"
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Guardian">Guardian</option>
                            </select>
                            <button
                              onClick={() => removeArrayItem("parent_details", idx)}
                              className="btn btn-sm btn-error btn-outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={parent.name}
                            onChange={(e) =>
                              updateArrayItem("parent_details", idx, "name", e.target.value)
                            }
                            className="input input-bordered input-sm w-full"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={parent.occupation}
                            onChange={(e) =>
                              updateArrayItem("parent_details", idx, "occupation", e.target.value)
                            }
                            className="input input-bordered input-sm w-full"
                            placeholder="Occupation"
                          />
                          <input
                            type="text"
                            value={parent.organisation}
                            onChange={(e) =>
                              updateArrayItem("parent_details", idx, "organisation", e.target.value)
                            }
                            className="input input-bordered input-sm w-full"
                            placeholder="Organisation"
                          />
                          <input
                            type="email"
                            value={parent.email}
                            onChange={(e) =>
                              updateArrayItem("parent_details", idx, "email", e.target.value)
                            }
                            className="input input-bordered input-sm w-full"
                            placeholder="Email"
                          />
                          <input
                            type="tel"
                            value={parent.phone_number}
                            onChange={(e) =>
                              updateArrayItem("parent_details", idx, "phone_number", e.target.value)
                            }
                            className="input input-bordered input-sm w-full"
                            placeholder="Phone"
                          />
                        </div>
                      )) || <p className="text-sm text-base-content/60">No parent details added</p>}
                      <button
                        onClick={() =>
                          addArrayItem("parent_details", {
                            parent_type: "Father",
                            name: "",
                            occupation: "",
                            organisation: "",
                            email: "",
                            phone_number: "",
                          })
                        }
                        className="btn btn-sm btn-outline gap-2 w-full"
                      >
                        <Plus className="h-4 w-4" />
                        Add Parent
                      </button>
                    </>
                  ) : (
                    <>
                      {displayData.parent_details?.map((parent, idx) => (
                        <div key={idx} className="p-3 bg-base-100 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="badge badge-sm badge-primary">
                              {parent.parent_type}
                            </span>
                            <h3 className="font-semibold">{parent.name || "N/A"}</h3>
                          </div>
                          <p className="text-sm text-base-content/70">
                            {parent.occupation || "N/A"}
                          </p>
                          <p className="text-sm text-base-content/60">
                            {parent.organisation || "N/A"}
                          </p>
                          <div className="flex flex-col gap-1 mt-2 text-xs text-base-content/60">
                            <span>{parent.email || "N/A"}</span>
                            <span>{parent.phone_number || "N/A"}</span>
                          </div>
                        </div>
                      )) || <p className="text-sm text-base-content/60">No parent details added</p>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("profile")}
                >
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    Profile Details
                  </h2>
                  {expandedSections.has("profile") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {expandedSections.has("profile") && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Key Expertise</p>
                      {isEditing ? (
                        <textarea
                          value={displayData.profile_details?.key_expertise || ""}
                          onChange={(e) =>
                            updateField("profile_details", "key_expertise", e.target.value)
                          }
                          className="textarea textarea-bordered w-full"
                          rows={3}
                          placeholder="Your key areas of expertise"
                        />
                      ) : (
                        <p className="text-base">
                          {displayData.profile_details?.key_expertise || "Not specified"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Career Objective</p>
                      {isEditing ? (
                        <textarea
                          value={displayData.profile_details?.career_objective || ""}
                          onChange={(e) =>
                            updateField("profile_details", "career_objective", e.target.value)
                          }
                          className="textarea textarea-bordered w-full"
                          rows={3}
                          placeholder="Your career goals and objectives"
                        />
                      ) : (
                        <p className="text-base">
                          {displayData.profile_details?.career_objective || "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Performance */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("academics")}
                >
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    Academic Performance
                  </h2>
                  {expandedSections.has("academics") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {expandedSections.has("academics") && (
                  <div className="space-y-4 mt-4">
                    {displayData.semester_academics?.map((sem, idx) => (
                      <div key={idx} className="p-4 bg-base-100 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">
                            Semester {sem.semester} - Year {sem.academic_year}
                          </h3>
                          <div className="badge badge-lg badge-primary">
                            SGPA: {sem.result_in_sgpa}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-base-content/60">Closed Backlogs</p>
                            <p className="font-medium">{sem.closed_backlogs}</p>
                          </div>
                          <div>
                            <p className="text-base-content/60">Live Backlogs</p>
                            <p className="font-medium">{sem.live_backlogs}</p>
                          </div>
                        </div>
                        {sem.provisional_result_upload_link_signed_url && (
                          <a
                            href={sem.provisional_result_upload_link_signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline gap-2 mt-3"
                          >
                            <FileText className="h-4 w-4" />
                            View Result
                          </a>
                        )}
                      </div>
                    )) || (
                      <p className="text-sm text-base-content/60 text-center py-4">
                        No academic records
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Education History */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("education")}
                >
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <Building className="h-6 w-6 text-primary" />
                    Education History
                  </h2>
                  {expandedSections.has("education") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {expandedSections.has("education") && (
                  <div className="space-y-4 mt-4">
                    {displayData.education_history?.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-4 border-l-4 border-primary bg-base-100 rounded-r-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{edu.education_level}</h3>
                          <span className="badge badge-outline">{edu.year_of_passing}</span>
                        </div>
                        <p className="font-medium text-base-content/80">
                          {edu.institute_name || "N/A"}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {edu.city} • {edu.board}
                        </p>
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="badge badge-lg badge-success">
                            {edu.result} {edu.result_type}
                          </div>
                          <p className="text-sm text-base-content/60">{edu.subjects || "N/A"}</p>
                        </div>
                        {edu.marksheet_file_signed_url && (
                          <a
                            href={edu.marksheet_file_signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline gap-2 mt-3"
                          >
                            <FileText className="h-4 w-4" />
                            View Marksheet
                          </a>
                        )}
                        {edu.gap_type && (
                          <div className="mt-3 p-2 bg-warning/10 rounded">
                            <p className="text-sm font-medium">
                              Gap: {edu.gap_duration_months} months
                            </p>
                            <p className="text-xs text-base-content/60">
                              {edu.gap_reason || "No reason specified"}
                            </p>
                          </div>
                        )}
                      </div>
                    )) || (
                      <p className="text-sm text-base-content/60 text-center py-4">
                        No education history
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("projects")}
                >
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Projects ({displayData.projects?.length || 0})
                  </h2>
                  {expandedSections.has("projects") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {expandedSections.has("projects") && (
                  <div className="space-y-6 mt-4">
                    {displayData.projects?.map((project, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-base-100 rounded-lg border-l-4 border-secondary"
                      >
                        <h3 className="font-bold text-lg mb-2">{project.title || "N/A"}</h3>
                        <p className="text-sm text-base-content/70 mb-3">
                          {project.description || "No description"}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.skills?.map((skill, skillIdx) => (
                            <span key={skillIdx} className="badge badge-sm badge-primary">
                              {skill}
                            </span>
                          )) || null}
                        </div>
                        {project.snaps_signed_urls && project.snaps_signed_urls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                            {project.snaps_signed_urls.map((snap, snapIdx) => (
                              <div
                                key={snapIdx}
                                className="aspect-video bg-base-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(snap)}
                              >
                                <img
                                  src={snap}
                                  alt={`Project snapshot ${snapIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          {project.project_link && (
                            <a
                              href={project.project_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary flex items-center gap-1"
                            >
                              <Link2 className="h-4 w-4" />
                              View Project
                            </a>
                          )}
                          {project.mentor_name && (
                            <span className="text-base-content/60">
                              Mentor: {project.mentor_name}
                            </span>
                          )}
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-base-content/60 text-center py-4">No projects</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Internships */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("internships")}
                >
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Internships ({displayData.internships?.length || 0})
                  </h2>
                  {expandedSections.has("internships") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>

                {expandedSections.has("internships") && (
                  <div className="space-y-6 mt-4">
                    {displayData.internships?.map((internship, idx) => (
                      <div key={idx} className="p-4 bg-base-100 rounded-lg">
                        <div className="flex items-start justify-between mb-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg">{internship.job_role || "N/A"}</h3>
                            <p className="text-base-content/70">{internship.organization || "N/A"}</p>
                          </div>
                          <div className="badge badge-lg badge-success whitespace-nowrap">
                            ₹{internship.stipend?.toLocaleString("en-IN") || "0"}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-base-content/60 mb-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 shrink-0" />
                            {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            {internship.location || "N/A"}
                          </span>
                        </div>
                        {internship.description && (
                          <p className="text-sm mb-3">{internship.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {internship.skills?.map((skill, skillIdx) => (
                            <span key={skillIdx} className="badge badge-sm badge-outline">
                              {skill}
                            </span>
                          )) || null}
                        </div>
                        {internship.proof_document_signed_url && (
                          <a
                            href={internship.proof_document_signed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            View Certificate
                          </a>
                        )}
                      </div>
                    )) || (
                      <p className="text-sm text-base-content/60 text-center py-4">
                        No internships
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Trainings */}
            {displayData.trainings && displayData.trainings.length > 0 && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("trainings")}
                  >
                    <h2 className="card-title text-xl flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      Trainings ({displayData.trainings.length})
                    </h2>
                    {expandedSections.has("trainings") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  {expandedSections.has("trainings") && (
                    <div className="space-y-4 mt-4">
                      {displayData.trainings.map((training, idx) => (
                        <div key={idx} className="p-4 bg-base-100 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{training.title || "N/A"}</h3>
                            <span className="badge badge-outline">
                              {training.training_type || "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-base-content/70 mb-2">
                            {training.institution || "N/A"}
                          </p>
                          <p className="text-xs text-base-content/60 mb-3">
                            {formatDate(training.start_date)} - {formatDate(training.end_date)}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {training.skills?.map((skill, skillIdx) => (
                              <span key={skillIdx} className="badge badge-sm badge-warning">
                                {skill}
                              </span>
                            )) || null}
                          </div>
                          {training.proof_document_signed_url && (
                            <a
                              href={training.proof_document_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View Certificate
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {displayData.certifications && displayData.certifications.length > 0 && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("certifications")}
                  >
                    <h2 className="card-title text-xl flex items-center gap-2">
                      <Award className="h-6 w-6 text-primary" />
                      Certifications ({displayData.certifications.length})
                    </h2>
                    {expandedSections.has("certifications") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  {expandedSections.has("certifications") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {displayData.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-base-100 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-semibold mb-1">{cert.title || "N/A"}</h3>
                          <p className="text-sm text-base-content/60 mb-2">
                            {cert.organization || "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="badge badge-sm badge-primary">
                              {cert.certification_type || "N/A"}
                            </span>
                            <span className="badge badge-sm badge-outline">
                              Score: {cert.score || "N/A"}
                            </span>
                          </div>
                          <p className="text-xs text-base-content/60 mb-2">
                            Issued: {formatDate(cert.issue_date)}
                          </p>
                          {cert.proof_document_signed_url && (
                            <a
                              href={cert.proof_document_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Publications */}
            {displayData.publications && displayData.publications.length > 0 && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("publications")}
                  >
                    <h2 className="card-title text-xl flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" />
                      Publications ({displayData.publications.length})
                    </h2>
                    {expandedSections.has("publications") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  {expandedSections.has("publications") && (
                    <div className="space-y-4 mt-4">
                      {displayData.publications.map((pub, idx) => (
                        <div key={idx} className="p-4 bg-base-100 rounded-lg">
                          <h3 className="font-bold text-lg mb-2">{pub.title || "N/A"}</h3>
                          <div className="flex items-center gap-3 mb-2 text-sm text-base-content/70 flex-wrap">
                            <span>{pub.publication_name || "N/A"}</span>
                            <span>•</span>
                            <span>{pub.publication_type || "N/A"}</span>
                            <span>•</span>
                            <span>{formatDate(pub.publication_date)}</span>
                          </div>
                          <p className="text-sm text-base-content/60 mb-3">
                            {pub.author_count || 0} authors • Mentor: {pub.mentor_name || "N/A"}
                          </p>
                          {pub.description && <p className="text-sm mb-3">{pub.description}</p>}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {pub.skills?.map((skill, skillIdx) => (
                              <span key={skillIdx} className="badge badge-sm badge-info">
                                {skill}
                              </span>
                            )) || null}
                          </div>
                          {pub.evidence_document_signed_url && (
                            <a
                              href={pub.evidence_document_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extra Curricular Activities */}
            {displayData.extra_curricular_activities &&
              displayData.extra_curricular_activities.length > 0 && (
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection("activities")}
                    >
                      <h2 className="card-title text-xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Extra Curricular ({displayData.extra_curricular_activities.length})
                      </h2>
                      {expandedSections.has("activities") ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>

                    {expandedSections.has("activities") && (
                      <div className="space-y-4 mt-4">
                        {displayData.extra_curricular_activities.map((activity, idx) => (
                          <div key={idx} className="p-4 bg-base-100 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">
                                {activity.activity_name || "N/A"}
                              </h3>
                              <span className="badge badge-outline">
                                {activity.activity_type || "N/A"}
                              </span>
                            </div>
                            <p className="text-sm text-base-content/70 mb-2">
                              {activity.role || "N/A"} at {activity.organization || "N/A"}
                            </p>
                            <div className="text-sm text-base-content/60 mb-3">
                              {formatDate(activity.start_date)} - {formatDate(activity.end_date)}
                            </div>
                            {activity.achievements && activity.achievements.length > 0 && (
                              <div className="space-y-1 mb-3">
                                <p className="text-sm font-medium">Achievements:</p>
                                {activity.achievements.map((achievement, achIdx) => (
                                  <p key={achIdx} className="text-sm flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    {achievement}
                                  </p>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {activity.skills?.map((skill, skillIdx) => (
                                <span key={skillIdx} className="badge badge-sm badge-secondary">
                                  {skill}
                                </span>
                              )) || null}
                            </div>
                            {activity.proof_document_signed_url && (
                              <a
                                href={activity.proof_document_signed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View Certificate
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Other Experiences */}
            {displayData.other_experiences && displayData.other_experiences.length > 0 && (
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection("experiences")}
                  >
                    <h2 className="card-title text-xl flex items-center gap-2">
                      <Briefcase className="h-6 w-6 text-primary" />
                      Other Experiences ({displayData.other_experiences.length})
                    </h2>
                    {expandedSections.has("experiences") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>

                  {expandedSections.has("experiences") && (
                    <div className="space-y-4 mt-4">
                      {displayData.other_experiences.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-base-100 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2">{exp.title || "N/A"}</h3>
                          <p className="text-sm text-base-content/70 mb-2">
                            {exp.organization || "N/A"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-base-content/60 mb-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 shrink-0" />
                              {formatDate(exp.start_date)} -{" "}
                              {exp.end_date ? formatDate(exp.end_date) : "Present"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 shrink-0" />
                              {exp.location || "N/A"}
                            </span>
                          </div>
                          {exp.description && <p className="text-sm mb-3">{exp.description}</p>}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {exp.skills?.map((skill, skillIdx) => (
                              <span key={skillIdx} className="badge badge-sm badge-error badge-outline">
                                {skill}
                              </span>
                            )) || null}
                          </div>
                          {exp.proof_document_signed_url && (
                            <a
                              href={exp.proof_document_signed_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              View Document
                            </a>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}