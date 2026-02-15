"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Edit2,
  Save,
  X,
  Trash2,
  Award,
  FileText,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Plus,
  Download,
  Upload,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";

// ============================================
// Type Definitions
// ============================================

interface RegistrationPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface PlacementDrive {
  id: number;
  company_name: string | null;
  company_remarks: string | null;
  year: number;
  type_of_hiring: "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER" | null;
  job_type: "DOMESTIC" | "INTERNATIONAL" | null;
  job_description: string | null;
  job_location: string | null;
  onboarded_date: string | null;
  last_date_to_registration: string | null;
  number_of_openings: number | null;
  number_of_registrations: number;
  no_shortlisted: number;
  offer_letter_status: "NOT_ISSUED" | "ISSUED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | null;
  placement_status: "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "POSTPONED" | null;
  school_name: string | null;
  program_name: string | null;
  specialization_name: string | null;
  event_datetime: string | null;
  tpo_name: string | null;
  eligibility_min_cgpa: string | null;
  eligibility_backlogs_allowed: number | null;
  stipend_min: string | null;
  stipend_max: string | null;
  stipend_avg: string | null;
  ctc_min_lpa: string | null;
  ctc_max_lpa: string | null;
  ctc_variable_percentage: string | null;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  company_name: string;
  description: string;
  company_type: string;
  address: string;
  website: string;
  linkedin: string;
  company_logo_link: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  signed_url: string | null;
}

interface ResourcesEnum {
  majors: { mapping: Record<string, string>; total: number };
  minors: { mapping: Record<string, string>; total: number };
  specializations: { mapping: Record<string, string>; total: number };
  schools: { mapping: Record<string, string>; total: number };
  programs: { mapping: Record<string, string>; total: number };
}

type ProcessStatus = "PASSED" | "FAILED" | "ABSENT" | "PENDING";

interface ProcessRecord {
  id: number;
  placement_drive_id: number;
  usn: string;
  is_eligible: boolean;
  registration_status: boolean;
  approved_status: boolean;
  oa_status: ProcessStatus;
  gd_status: ProcessStatus;
  technical_round_status: ProcessStatus;
  interview_status: ProcessStatus;
  hr_round_status: ProcessStatus;
  final_select_status: ProcessStatus;
  malpractice: boolean;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

interface ProcessGroupedResponse {
  registered: ProcessRecord[];
  eligible_not_registered: ProcessRecord[];
}

interface Student {
  usn: string;
  user_id: number;
  full_name: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  date_of_birth: string;
  specially_abled: boolean;
  languages: string[];
  personal_email: string;
  verification_type: string;
  profile_image: string;
  profile_image_signed_url: string;
  school_name: string;
  program_name: string;
  specialization_name: string;
  major_name: string;
  minor_name: string;
  email: string;
  year_of_joining: number;
  created_at: string;
  updated_at: string;
}

interface StudentsResponse {
  total: number;
  page: number;
  limit: number;
  data: Student[];
}

// ============================================
// Constants & Utilities
// ============================================

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "badge-ghost",
  OPEN: "badge-success",
  CLOSED: "badge-error",
  CANCELLED: "badge-warning",
  POSTPONED: "badge-info",
  NOT_ISSUED: "badge-ghost",
  ISSUED: "badge-info",
  ACCEPTED: "badge-success",
  REJECTED: "badge-error",
  WITHDRAWN: "badge-warning",
  PASSED: "badge-success",
  FAILED: "badge-error",
  ABSENT: "badge-warning",
  PENDING: "badge-ghost",
};

const HIRING_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
  INTERNSHIP_PLUS_PPO: "Internship + PPO",
  CONTRACT: "Contract",
  OTHER: "Other",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toLocalDatetimeString(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function toLocalDateString(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function showToast(message: string, type: "success" | "error") {
  const toastDiv = document.createElement("div");
  toastDiv.className = "toast toast-top toast-center";
  toastDiv.innerHTML = `
    <div class="alert alert-${type}">
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toastDiv);
  setTimeout(() => toastDiv.remove(), 3000);
}

// ============================================
// Student Process Table Component
// ============================================

function StudentProcessTable({
  processes,
  onUpdate,
  onDelete,
}: {
  processes: ProcessRecord[];
  onUpdate: (id: number, data: Partial<ProcessRecord>) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th className="w-28">USN</th>
            <th className="w-20 text-center">Eligible</th>
            <th className="w-20 text-center">Approved</th>
            <th className="w-32">OA</th>
            <th className="w-32">GD</th>
            <th className="w-32">Technical</th>
            <th className="w-32">Interview</th>
            <th className="w-32">HR Round</th>
            <th className="w-32">Final Status</th>
            <th className="w-24 text-center">Malpractice</th>
            <th className="w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.id} className="hover">
              <td className="font-mono text-sm">{process.usn}</td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={process.is_eligible}
                  onChange={(e) => onUpdate(process.id, { is_eligible: e.target.checked })}
                  className="checkbox checkbox-sm"
                />
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={process.approved_status}
                  onChange={(e) => onUpdate(process.id, { approved_status: e.target.checked })}
                  className="checkbox checkbox-sm"
                />
              </td>
              <td>
                <select
                  value={process.oa_status}
                  onChange={(e) => onUpdate(process.id, { oa_status: e.target.value as ProcessStatus })}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td>
                <select
                  value={process.gd_status}
                  onChange={(e) => onUpdate(process.id, { gd_status: e.target.value as ProcessStatus })}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td>
                <select
                  value={process.technical_round_status}
                  onChange={(e) =>
                    onUpdate(process.id, { technical_round_status: e.target.value as ProcessStatus })
                  }
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td>
                <select
                  value={process.interview_status}
                  onChange={(e) => onUpdate(process.id, { interview_status: e.target.value as ProcessStatus })}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td>
                <select
                  value={process.hr_round_status}
                  onChange={(e) => onUpdate(process.id, { hr_round_status: e.target.value as ProcessStatus })}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td>
                <select
                  value={process.final_select_status}
                  onChange={(e) =>
                    onUpdate(process.id, { final_select_status: e.target.value as ProcessStatus })
                  }
                  className="select select-bordered select-sm w-full"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PASSED">PASSED</option>
                  <option value="FAILED">FAILED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={process.malpractice}
                  onChange={(e) => onUpdate(process.id, { malpractice: e.target.checked })}
                  className="checkbox checkbox-sm checkbox-error"
                />
              </td>
              <td>
                <button onClick={() => onDelete(process.id)} className="btn btn-ghost btn-sm text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Add Process Modal Component
// ============================================

function AddProcessModal({
  isOpen,
  onClose,
  placementDriveId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  placementDriveId: string;
  onSuccess: () => void;
}) {
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", studentSearch],
    queryFn: () =>
      api
        .get<StudentsResponse>("/students/personal-details/all", {
          params: { page: 1, limit: 50 },
        })
        .then((res) => res.data),
    enabled: isOpen,
  });

  // Create process mutation
  const createProcessMutation = useMutation({
    mutationFn: (data: Partial<ProcessRecord>) => api.post("/process/", data),
    onSuccess: () => {
      showToast("Student added to placement drive successfully!", "success");
      onSuccess();
      onClose();
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to add student", "error");
    },
  });

  const form = useForm({
    defaultValues: {
      usn: "",
      is_eligible: true,
      registration_status: false,
      approved_status: false,
      oa_status: "PENDING" as ProcessStatus,
      gd_status: "PENDING" as ProcessStatus,
      technical_round_status: "PENDING" as ProcessStatus,
      interview_status: "PENDING" as ProcessStatus,
      hr_round_status: "PENDING" as ProcessStatus,
      final_select_status: "PENDING" as ProcessStatus,
      malpractice: false,
      remarks: "",
    },
    onSubmit: async ({ value }) => {
      createProcessMutation.mutate({
        ...value,
        placement_drive_id: parseInt(placementDriveId),
      });
    },
  });

  const filteredStudents = studentsData?.data.filter(
    (student) =>
      student.usn.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Add Student to Placement Drive
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={createProcessMutation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student Selection */}
        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Select Student</span>
            </label>
            <input
              type="text"
              placeholder="Search by USN or name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Student List */}
          {studentsLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {filteredStudents.map((student) => (
                <div
                  key={student.usn}
                  onClick={() => {
                    setSelectedStudent(student);
                    form.setFieldValue("usn", student.usn);
                  }}
                  className={`p-3 hover:bg-base-200 cursor-pointer border-b last:border-b-0 ${selectedStudent?.usn === student.usn ? "bg-primary/10" : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{student.full_name}</p>
                      <p className="text-sm text-base-content/60 font-mono">{student.usn}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-base-content/60">{student.program_name}</p>
                      <p className="text-base-content/60">{student.specialization_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert">
              <span>No students found</span>
            </div>
          )}

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="alert alert-info">
              <div>
                <p className="font-semibold">Selected: {selectedStudent.full_name}</p>
                <p className="text-sm">{selectedStudent.usn}</p>
              </div>
            </div>
          )}

          <div className="divider"></div>

          {/* Process Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="is_eligible"
              children={(field) => (
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="label-text">Eligible</span>
                  </label>
                </div>
              )}
            />
            <form.Field
              name="registration_status"
              children={(field) => (
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="label-text">Registered</span>
                  </label>
                </div>
              )}
            />
            <form.Field
              name="approved_status"
              children={(field) => (
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="label-text">Approved</span>
                  </label>
                </div>
              )}
            />
            <form.Field
              name="malpractice"
              children={(field) => (
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="checkbox checkbox-error"
                    />
                    <span className="label-text">Malpractice</span>
                  </label>
                </div>
              )}
            />
          </div>

          <form.Field
            name="remarks"
            children={(field) => (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Remarks</span>
                </label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Additional remarks..."
                />
              </div>
            )}
          />
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost" disabled={createProcessMutation.isPending}>
            Cancel
          </button>
          <button
            onClick={() => form.handleSubmit()}
            className="btn btn-primary gap-2"
            disabled={createProcessMutation.isPending || !selectedStudent}
          >
            {createProcessMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Student
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={() => !createProcessMutation.isPending && onClose()} />
    </div>
  );
}

// ============================================
// Bulk Upload Modal Component
// ============================================

function BulkUploadModal({
  isOpen,
  onClose,
  placementDriveId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  placementDriveId: string;
  onSuccess: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Download template mutation
  const downloadTemplateMutation = useMutation({
    mutationFn: () =>
      api.get(`/process/bulk-upload/template/${placementDriveId}`, {
        responseType: "blob",
      }),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `placement_drive_${placementDriveId}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Template downloaded successfully!", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to download template", "error");
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/process/bulk-upload/${placementDriveId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      showToast("Bulk upload completed successfully!", "success");
      onSuccess();
      onClose();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to upload file", "error");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      bulkUploadMutation.mutate(selectedFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Bulk Upload Processes
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={bulkUploadMutation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="alert alert-info">
            <div>
              <p className="font-semibold mb-2">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Download the template using the button below</li>
                <li>The template contains all eligible USNs pre-populated</li>
                <li>Fill in the status columns for each student</li>
                <li>Upload the completed file (ALL eligible USNs must be present)</li>
              </ol>
            </div>
          </div>

          {/* Download Template Button */}
          <button
            onClick={() => downloadTemplateMutation.mutate()}
            className="btn btn-outline btn-primary w-full gap-2"
            disabled={downloadTemplateMutation.isPending}
          >
            {downloadTemplateMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Template
              </>
            )}
          </button>

          <div className="divider">THEN</div>

          {/* File Upload */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Upload Completed File</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />
            {selectedFile && (
              <label className="label">
                <span className="label-text-alt text-success">Selected: {selectedFile.name}</span>
              </label>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost" disabled={bulkUploadMutation.isPending}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="btn btn-primary gap-2"
            disabled={bulkUploadMutation.isPending || !selectedFile}
          >
            {bulkUploadMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={() => !bulkUploadMutation.isPending && onClose()} />
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function RegistrationPage({ params }: RegistrationPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "processes">("overview");
  const [isAddProcessModalOpen, setIsAddProcessModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // ============================================
  // Data Fetching with TanStack Query
  // ============================================

  // Fetch placement drive details
  const {
    data: drive,
    isLoading: driveLoading,
    error: driveError,
  } = useQuery({
    queryKey: ["placement-drive", id],
    queryFn: () => api.get<PlacementDrive>(`/placements/${id}`).then((res) => res.data),
  });

  // Fetch resources enum (only when edit tab is active)
  const { data: resources } = useQuery({
    queryKey: ["resources-enum"],
    queryFn: () => api.get<ResourcesEnum>("/placements/resources-enum").then((res) => res.data),
    enabled: activeTab === "edit",
  });

  // Fetch companies (only when edit tab is active)
  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () =>
      api.get<{ data: Company[] }>("/companies/all", { params: { page: 1, limit: 50 } }).then((res) => res.data),
    enabled: activeTab === "edit",
  });

  // Fetch student processes (only when processes tab is active)
  const {
    data: processData,
    isLoading: processLoading,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["placement-processes", id],
    queryFn: () => api.get<ProcessGroupedResponse>(`/process/placement-drive/${id}`).then((res) => res.data),
    enabled: activeTab === "processes",
  });

  const companies = companiesData?.data || [];

  // ============================================
  // Edit Form Setup
  // ============================================

  const editForm = useForm({
    defaultValues: {
      company_id: null as number | null,
      company_remarks: "",
      year: new Date().getFullYear(),
      type_of_hiring: "FULL_TIME" as "FULL_TIME" | "INTERNSHIP" | "INTERNSHIP_PLUS_PPO" | "CONTRACT" | "OTHER",
      job_type: "DOMESTIC" as "DOMESTIC" | "INTERNATIONAL",
      job_description: "",
      job_location: "",
      onboarded_date: "",
      last_date_to_registration: "",
      number_of_openings: null as number | null,
      number_of_registrations: null as number | null,
      no_shortlisted: null as number | null,
      offer_letter_status: "NOT_ISSUED" as "NOT_ISSUED" | "ISSUED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN",
      placement_status: "DRAFT" as "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "POSTPONED",
      school_id: null as number | null,
      program_id: null as number | null,
      specialization_id: null as number | null,
      event_datetime: "",
      eligibility_min_cgpa: null as number | null,
      eligibility_backlogs_allowed: null as number | null,
      stipend_min: null as number | null,
      stipend_max: null as number | null,
      stipend_avg: null as number | null,
      ctc_min_lpa: null as number | null,
      ctc_max_lpa: null as number | null,
      ctc_variable_percentage: null as number | null,
    },
    onSubmit: async ({ value }) => {
      updateDriveMutation.mutate(value);
    },
  });

  // Update form values when drive data changes
  if (drive && activeTab === "edit") {
    const companyId = companies.find((c) => c.company_name === drive.company_name)?.id || null;
    const schoolId = resources
      ? parseInt(Object.entries(resources.schools.mapping).find(([_, name]) => name === drive.school_name)?.[0] || "") ||
      null
      : null;
    const programId = resources
      ? parseInt(Object.entries(resources.programs.mapping).find(([_, name]) => name === drive.program_name)?.[0] || "") ||
      null
      : null;
    const specializationId = resources
      ? parseInt(
        Object.entries(resources.specializations.mapping).find(([_, name]) => name === drive.specialization_name)?.[0] ||
        ""
      ) || null
      : null;

    // Only update if values have changed to avoid infinite loops
    if (
      editForm.state.values.company_id !== companyId ||
      editForm.state.values.company_remarks !== (drive.company_remarks || "") ||
      editForm.state.values.year !== drive.year
    ) {
      editForm.setFieldValue("company_id", companyId);
      editForm.setFieldValue("company_remarks", drive.company_remarks || "");
      editForm.setFieldValue("year", drive.year);
      editForm.setFieldValue("type_of_hiring", drive.type_of_hiring || "FULL_TIME");
      editForm.setFieldValue("job_type", drive.job_type || "DOMESTIC");
      editForm.setFieldValue("job_description", drive.job_description || "");
      editForm.setFieldValue("job_location", drive.job_location || "");
      editForm.setFieldValue("onboarded_date", toLocalDateString(drive.onboarded_date));
      editForm.setFieldValue("last_date_to_registration", toLocalDatetimeString(drive.last_date_to_registration));
      editForm.setFieldValue("number_of_openings", drive.number_of_openings);
      editForm.setFieldValue("number_of_registrations", drive.number_of_registrations);
      editForm.setFieldValue("no_shortlisted", drive.no_shortlisted);
      editForm.setFieldValue("offer_letter_status", drive.offer_letter_status || "NOT_ISSUED");
      editForm.setFieldValue("placement_status", drive.placement_status || "DRAFT");
      editForm.setFieldValue("school_id", schoolId);
      editForm.setFieldValue("program_id", programId);
      editForm.setFieldValue("specialization_id", specializationId);
      editForm.setFieldValue("event_datetime", toLocalDatetimeString(drive.event_datetime));
      editForm.setFieldValue("eligibility_min_cgpa", drive.eligibility_min_cgpa ? parseFloat(drive.eligibility_min_cgpa) : null);
      editForm.setFieldValue("eligibility_backlogs_allowed", drive.eligibility_backlogs_allowed);
      editForm.setFieldValue("stipend_min", drive.stipend_min ? parseFloat(drive.stipend_min) : null);
      editForm.setFieldValue("stipend_max", drive.stipend_max ? parseFloat(drive.stipend_max) : null);
      editForm.setFieldValue("stipend_avg", drive.stipend_avg ? parseFloat(drive.stipend_avg) : null);
      editForm.setFieldValue("ctc_min_lpa", drive.ctc_min_lpa ? parseFloat(drive.ctc_min_lpa) : null);
      editForm.setFieldValue("ctc_max_lpa", drive.ctc_max_lpa ? parseFloat(drive.ctc_max_lpa) : null);
      editForm.setFieldValue(
        "ctc_variable_percentage",
        drive.ctc_variable_percentage ? parseFloat(drive.ctc_variable_percentage) : null
      );
    }
  }

  // ============================================
  // Mutations
  // ============================================
  // Download template mutation



  // Update placement drive mutation
  const updateDriveMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        company_id: data.company_id,
        company_remarks: data.company_remarks || null,
        year: data.year,
        type_of_hiring: data.type_of_hiring,
        job_type: data.job_type,
        job_description: data.job_description || null,
        job_location: data.job_location || null,
        onboarded_date: data.onboarded_date || null,
        last_date_to_registration: data.last_date_to_registration || null,
        number_of_openings: data.number_of_openings,
        number_of_registrations: data.number_of_registrations,
        no_shortlisted: data.no_shortlisted,
        offer_letter_status: data.offer_letter_status,
        placement_status: data.placement_status,
        institution_id: null,
        school_id: data.school_id,
        program_id: data.program_id,
        specialization_id: data.specialization_id,
        event_datetime: data.event_datetime || null,
        tpo_id: null,
        eligibility_min_cgpa: data.eligibility_min_cgpa,
        eligibility_backlogs_allowed: data.eligibility_backlogs_allowed,
        stipend_min: data.stipend_min,
        stipend_max: data.stipend_max,
        stipend_avg: data.stipend_avg,
        ctc_min_lpa: data.ctc_min_lpa,
        ctc_max_lpa: data.ctc_max_lpa,
        ctc_variable_percentage: data.ctc_variable_percentage,
      };
      return api.patch(`/placements/${id}`, payload);
    },
    onSuccess: () => {
      showToast("Placement drive updated successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["placement-drive", id] });
      setActiveTab("overview");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to update placement drive", "error");
    },
  });

  // Delete placement drive mutation
  const deleteDriveMutation = useMutation({
    mutationFn: () => api.delete(`/placements/${id}`),
    onSuccess: () => {
      showToast("Placement drive deleted successfully!", "success");
      setTimeout(() => router.push("/placement/drives"), 2000);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to delete placement drive", "error");
    },
  });

  // Update process record mutation
  const updateProcessMutation = useMutation({
    mutationFn: ({ processId, data }: { processId: number; data: Partial<ProcessRecord> }) =>
      api.patch(`/process/${processId}`, data),
    onSuccess: () => {
      showToast("Process updated successfully!", "success");
      refetchProcesses();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to update process", "error");
    },
  });

  // Delete process record mutation
  const deleteProcessMutation = useMutation({
    mutationFn: (processId: number) => api.delete(`/process/${processId}`),
    onSuccess: () => {
      showToast("Student removed from placement drive!", "success");
      refetchProcesses();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to remove student", "error");
    },
  });

  // ============================================
  // Event Handlers
  // ============================================

  const handleUpdateProcess = (processId: number, data: Partial<ProcessRecord>) => {
    updateProcessMutation.mutate({ processId, data });
  };

  const handleDeleteProcess = (processId: number) => {
    if (confirm("Are you sure you want to remove this student from the placement drive?")) {
      deleteProcessMutation.mutate(processId);
    }
  };

  // ============================================
  // Loading & Error States
  // ============================================

  if (driveLoading) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/60">Loading placement drive...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (driveError || !drive) {
    return (
      <div className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Error Loading Placement Drive</h2>
              <p className="text-base-content/60 mb-6">
                {driveError instanceof Error ? driveError.message : "Placement drive not found"}
              </p>
              <Link href="/placement/drives" className="btn btn-primary">
                Back to Drives
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const downloadTemplateMutation = useMutation({
    mutationFn: () =>
      api.get(`/process/bulk-upload/template/${id}`, {
        responseType: "blob",
      }),
    onSuccess: (response) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `placement_drive_${id}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Template downloaded successfully!", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || "Failed to download template", "error");
    },
  });

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen bg-base-100">
      {/* Modals */}
      <AddProcessModal
        isOpen={isAddProcessModalOpen}
        onClose={() => setIsAddProcessModalOpen(false)}
        placementDriveId={id}
        onSuccess={refetchProcesses}
      />

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        placementDriveId={id}
        onSuccess={refetchProcesses}
      />

      {/* Header Section */}
      <div className="bg-primary text-primary-content shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/placement/drives" className="btn btn-ghost btn-sm gap-2 hover:bg-white/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Drives
            </Link>

            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this placement drive? This action cannot be undone.")) {
                  deleteDriveMutation.mutate();
                }
              }}
              className="btn btn-sm gap-2 btn-error"
              disabled={deleteDriveMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {/* Drive Header Info */}
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold">{drive.company_name || "Unknown Company"}</h1>
                {drive.placement_status && (
                  <span className={`badge badge-lg ${STATUS_COLORS[drive.placement_status]}`}>
                    {drive.placement_status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                  <Calendar className="h-4 w-4" />
                  {drive.year}
                </div>
                {drive.type_of_hiring && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <Briefcase className="h-4 w-4" />
                    {HIRING_TYPE_LABELS[drive.type_of_hiring]}
                  </div>
                )}
                {drive.job_type && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <MapPin className="h-4 w-4" />
                    {drive.job_type}
                  </div>
                )}
                {drive.job_location && (
                  <div className="badge badge-lg gap-2 bg-white/20 border-white/30">
                    <MapPin className="h-4 w-4" />
                    {drive.job_location}
                  </div>
                )}
              </div>

              <div className="text-sm opacity-90">
                Created: {formatDateTime(drive.created_at)} • Updated: {formatDateTime(drive.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-base-200 border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="tabs tabs-boxed bg-transparent">
            <button
              className={`tab gap-2 ${activeTab === "overview" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Eye className="h-4 w-4" />
              Overview
            </button>
            <button
              className={`tab gap-2 ${activeTab === "edit" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              className={`tab gap-2 ${activeTab === "processes" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("processes")}
            >
              <UserCheck className="h-4 w-4" />
              Student Processes
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Registration Stats Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Registration Stats
                  </h2>
                  <div className="space-y-4 mt-4">
                    <div className="p-3 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-1">Openings</p>
                      <p className="text-2xl font-bold text-primary">{drive.number_of_openings || 0}</p>
                    </div>
                    <div className="p-3 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-1">Registrations</p>
                      <p className="text-2xl font-bold text-success">{drive.number_of_registrations}</p>
                    </div>
                    <div className="p-3 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-1">Shortlisted</p>
                      <p className="text-2xl font-bold text-info">{drive.no_shortlisted}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Eligibility
                  </h2>
                  <div className="space-y-4 mt-4">
                    <div>
                      <p className="text-xs text-base-content/60 mb-1">Minimum CGPA</p>
                      <p className="text-lg font-semibold">{drive.eligibility_min_cgpa || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60 mb-1">Backlogs Allowed</p>
                      <p className="text-lg font-semibold">{drive.eligibility_backlogs_allowed ?? "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Details Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Program Details
                  </h2>
                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="text-xs text-base-content/60">School</p>
                      <p className="text-sm font-medium">{drive.school_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60">Program</p>
                      <p className="text-sm font-medium">{drive.program_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/60">Specialization</p>
                      <p className="text-sm font-medium">{drive.specialization_name || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TPO Details */}
              {drive.tpo_name && (
                <div className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      TPO Coordinator
                    </h2>
                    <p className="text-sm mt-2">{drive.tpo_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Year</p>
                      <p className="text-base font-medium">{drive.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Job Location</p>
                      <p className="text-base font-medium">{drive.job_location || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60 mb-1">Number of Openings</p>
                      <p className="text-base font-medium">{drive.number_of_openings || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Job Description
                  </h2>
                  <div className="mt-4 p-4 bg-base-100 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{drive.job_description || "No description available"}</p>
                  </div>
                </div>
              </div>

              {/* Compensation Details Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Compensation Details
                  </h2>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="p-4 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-2">CTC Range</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{drive.ctc_min_lpa || "0"} - ₹{drive.ctc_max_lpa || "0"} LPA
                      </p>
                      {drive.ctc_variable_percentage && (
                        <p className="text-xs text-base-content/60 mt-1">Variable: {drive.ctc_variable_percentage}%</p>
                      )}
                    </div>
                    <div className="p-4 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/60 mb-2">Stipend Range</p>
                      <p className="text-2xl font-bold text-success">
                        ₹{drive.stipend_min || "0"} - ₹{drive.stipend_max || "0"}
                      </p>
                      {drive.stipend_avg && (
                        <p className="text-xs text-base-content/60 mt-1">Average: ₹{drive.stipend_avg}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Dates Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Important Dates
                  </h2>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Onboarded</p>
                        <p className="text-xs text-base-content/60">{formatDate(drive.onboarded_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-info rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event</p>
                        <p className="text-xs text-base-content/60">{formatDateTime(drive.event_datetime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Registration Date</p>
                        <p className="text-xs text-base-content/60">
                          {formatDateTime(drive.last_date_to_registration)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Remarks Card */}
              <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Status & Remarks
                  </h2>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-2">Placement Status</p>
                        {drive.placement_status && (
                          <span className={`badge ${STATUS_COLORS[drive.placement_status]}`}>
                            {drive.placement_status}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-2">Offer Letter Status</p>
                        {drive.offer_letter_status && (
                          <span className={`badge ${STATUS_COLORS[drive.offer_letter_status]}`}>
                            {drive.offer_letter_status}
                          </span>
                        )}
                      </div>
                    </div>
                    {drive.company_remarks && (
                      <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-1">Company Remarks</p>
                        <p className="text-sm">{drive.company_remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === "edit" && (
          <div className="max-w-5xl mx-auto">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Edit Placement Drive</h2>

                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <editForm.Field
                        name="company_id"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Company</span>
                            </label>
                            <select
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="select select-bordered w-full"
                            >
                              <option value="">Select Company</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.company_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <editForm.Field
                          name="year"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Year</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(parseInt(e.target.value))}
                                className="input input-bordered w-full"
                              />
                            </div>
                          )}
                        />

                        <editForm.Field
                          name="job_location"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Job Location</span>
                              </label>
                              <input
                                type="text"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="input input-bordered w-full"
                                placeholder="Bangalore"
                              />
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <editForm.Field
                          name="type_of_hiring"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Hiring Type</span>
                              </label>
                              <select
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                                className="select select-bordered w-full"
                              >
                                <option value="FULL_TIME">Full-time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="INTERNSHIP_PLUS_PPO">Internship + PPO</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                          )}
                        />

                        <editForm.Field
                          name="job_type"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Job Type</span>
                              </label>
                              <select
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                                className="select select-bordered w-full"
                              >
                                <option value="DOMESTIC">Domestic</option>
                                <option value="INTERNATIONAL">International</option>
                              </select>
                            </div>
                          )}
                        />
                      </div>

                      <editForm.Field
                        name="number_of_openings"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Number of Openings</span>
                            </label>
                            <input
                              type="number"
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="input input-bordered w-full"
                              placeholder="10"
                            />
                          </div>
                        )}
                      />

                      <editForm.Field
                        name="job_description"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Job Description</span>
                            </label>
                            <textarea
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="textarea textarea-bordered w-full"
                              rows={4}
                              placeholder="Detailed job description..."
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="divider"></div>

                  {/* Program Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Program Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <editForm.Field
                        name="school_id"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">School</span>
                            </label>
                            <select
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="select select-bordered w-full"
                            >
                              <option value="">Select School</option>
                              {resources &&
                                Object.entries(resources.schools.mapping).map(([id, name]) => (
                                  <option key={id} value={id}>
                                    {name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      />
                      <editForm.Field
                        name="program_id"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Program</span>
                            </label>
                            <select
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="select select-bordered w-full"
                            >
                              <option value="">Select Program</option>
                              {resources &&
                                Object.entries(resources.programs.mapping).map(([id, name]) => (
                                  <option key={id} value={id}>
                                    {name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      />
                      <editForm.Field
                        name="specialization_id"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Specialization</span>
                            </label>
                            <select
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="select select-bordered w-full"
                            >
                              <option value="">Select Specialization</option>
                              {resources &&
                                Object.entries(resources.specializations.mapping).map(([id, name]) => (
                                  <option key={id} value={id}>
                                    {name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="divider"></div>

                  {/* Eligibility Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Eligibility Criteria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <editForm.Field
                        name="eligibility_min_cgpa"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Minimum CGPA</span>
                            </label>
                            <input
                              type="number"
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="input input-bordered w-full"
                              placeholder="7.0"
                              step="0.1"
                            />
                          </div>
                        )}
                      />
                      <editForm.Field
                        name="eligibility_backlogs_allowed"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Backlogs Allowed</span>
                            </label>
                            <input
                              type="number"
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : null)}
                              className="input input-bordered w-full"
                              placeholder="0"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="divider"></div>

                  {/* Compensation Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Compensation Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <editForm.Field
                          name="ctc_min_lpa"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">CTC Min (LPA)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="10"
                                step="0.1"
                              />
                            </div>
                          )}
                        />
                        <editForm.Field
                          name="ctc_max_lpa"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">CTC Max (LPA)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="15"
                                step="0.1"
                              />
                            </div>
                          )}
                        />
                        <editForm.Field
                          name="ctc_variable_percentage"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Variable (%)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="10"
                              />
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <editForm.Field
                          name="stipend_min"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Stipend Min (₹)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="30000"
                              />
                            </div>
                          )}
                        />
                        <editForm.Field
                          name="stipend_max"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Stipend Max (₹)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="50000"
                              />
                            </div>
                          )}
                        />
                        <editForm.Field
                          name="stipend_avg"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Stipend Avg (₹)</span>
                              </label>
                              <input
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                                className="input input-bordered w-full"
                                placeholder="40000"
                              />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  {/* Important Dates Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Important Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <editForm.Field
                        name="onboarded_date"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Onboarded Date</span>
                            </label>
                            <input
                              type="date"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="input input-bordered w-full"
                            />
                          </div>
                        )}
                      />
                      <editForm.Field
                        name="event_datetime"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Event Date & Time</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="input input-bordered w-full"
                            />
                          </div>
                        )}
                      />
                      <editForm.Field
                        name="last_date_to_registration"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Last Registration Date</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="input input-bordered w-full"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="divider"></div>

                  {/* Status Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Status & Remarks
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <editForm.Field
                          name="placement_status"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Placement Status</span>
                              </label>
                              <select
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                                className="select select-bordered w-full"
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="OPEN">Open</option>
                                <option value="CLOSED">Closed</option>
                                <option value="CANCELLED">Cancelled</option>
                                <option value="POSTPONED">Postponed</option>
                              </select>
                            </div>
                          )}
                        />
                        <editForm.Field
                          name="offer_letter_status"
                          children={(field) => (
                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text font-medium">Offer Letter Status</span>
                              </label>
                              <select
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                                className="select select-bordered w-full"
                              >
                                <option value="NOT_ISSUED">Not Issued</option>
                                <option value="ISSUED">Issued</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="WITHDRAWN">Withdrawn</option>
                              </select>
                            </div>
                          )}
                        />
                      </div>
                      <editForm.Field
                        name="company_remarks"
                        children={(field) => (
                          <div className="form-control w-full">
                            <label className="label">
                              <span className="label-text font-medium">Company Remarks</span>
                            </label>
                            <textarea
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              className="textarea textarea-bordered w-full"
                              rows={3}
                              placeholder="Additional remarks..."
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="btn btn-ghost"
                      disabled={updateDriveMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => editForm.handleSubmit()}
                      className="btn btn-primary gap-2"
                      disabled={updateDriveMutation.isPending}
                    >
                      {updateDriveMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processes Tab */}
        {activeTab === "processes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Student Process Tracking</h2>
              <div className="flex gap-2">
                {/* Download Template Button */}
                <button
                  onClick={() => downloadTemplateMutation.mutate()}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                  disabled={downloadTemplateMutation.isPending}
                >
                  {downloadTemplateMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download Template
                    </>
                  )}
                </button>
                <button onClick={() => setIsAddProcessModalOpen(true)} className="btn btn-primary btn-sm gap-2">
                  <Plus className="h-4 w-4" />
                  Add Student
                </button>
                <button onClick={() => setIsBulkUploadModalOpen(true)} className="btn btn-secondary btn-sm gap-2">
                  <Upload className="h-4 w-4" />
                  Bulk Upload
                </button>
              </div>
            </div>

            {processLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-base-content/60">Loading student processes...</p>
                </div>
              </div>
            ) : processData ? (
              <div className="space-y-6">
                {/* Registered Students */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h3 className="text-lg font-semibold">Registered Students ({processData.registered.length})</h3>
                  </div>
                  {processData.registered.length > 0 ? (
                    <div className="card bg-base-200">
                      <div className="card-body p-4">
                        <StudentProcessTable
                          processes={processData.registered}
                          onUpdate={handleUpdateProcess}
                          onDelete={handleDeleteProcess}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="alert">
                      <span className="text-sm">No registered students yet</span>
                    </div>
                  )}
                </div>

                {/* Eligible but Not Registered */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold">
                      Eligible but Not Registered ({processData.eligible_not_registered.length})
                    </h3>
                  </div>
                  {processData.eligible_not_registered.length > 0 ? (
                    <div className="card bg-base-200">
                      <div className="card-body p-4">
                        <StudentProcessTable
                          processes={processData.eligible_not_registered}
                          onUpdate={handleUpdateProcess}
                          onDelete={handleDeleteProcess}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="alert">
                      <span className="text-sm">No eligible students pending registration</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>No process data available</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
