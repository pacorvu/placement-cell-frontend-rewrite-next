import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const internshipItemSchema = z.object({
  created_at: z.string().datetime(),
  description: z.string().nullable(),
  duration_months: z.number().nullable(),
  end_date: z.string().date().nullable(),
  id: z.number(),
  job_role: z.string().nullable(),
  location: z.string().nullable(),
  mentor_name: z.string().nullable(),
  organization: z.string().nullable(),
  organization_details: z.string().nullable(),
  proof_document: z.string().nullable(),
  proof_document_signed_url: z.string().nullable(),
  skills: z.array(z.string()).nullable(),
  start_date: z.string().date().nullable(),
  stipend: z.number().nullable(),
  updated_at: z.string().datetime(),
  user_id: z.number(),
  usn: z.string(),
});

const getInternshipsResponseSchema = z.array(internshipItemSchema);

type InternshipItem = z.infer<typeof internshipItemSchema>;
type GetInternshipsResponse = z.infer<typeof getInternshipsResponseSchema>;

// Form values type
type FormValues = {
  job_role: string | null;
  organization: string | null;
  organization_details: string | null;
  duration_months: number | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  stipend: number | null;
  skills: string[];
  description: string | null;
  mentor_name: string | null;
  proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  description: true,
  duration_months: true,
  end_date: true,
  job_role: true,
  location: true,
  mentor_name: true,
  organization: true,
  organization_details: true,
  proof_document: true,
  skills: true,
  start_date: true,
  stipend: true,
} as const;

// ==================== HELPER COMPONENTS ====================
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="form-control w-full">
      <label htmlFor={htmlFor} className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>
      {children}
      {error && (
        <label className="label pt-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

interface SkillsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}

function SkillsInput({ value, onChange, disabled }: SkillsInputProps) {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !value.includes(skillInput.trim())) {
      onChange([...value, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          placeholder="Add a skill (e.g., React, Python)"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          className="input input-bordered flex-1"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={disabled || !skillInput.trim()}
          className="btn btn-primary"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <div key={index} className="badge badge-primary gap-2 p-3">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                disabled={disabled}
                className="btn btn-ghost btn-xs btn-circle"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ADD NEW INTERNSHIP RECORD FORM ====================
interface AddInternshipRecordFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddInternshipRecordForm({
  userId,
  onSuccess,
  onError,
}: AddInternshipRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== CREATING NEW INTERNSHIP ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.job_role !== null) formData.append("job_role", values.job_role);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.organization_details !== null)
        formData.append("organization_details", values.organization_details);
      if (values.duration_months !== null)
        formData.append("duration_months", values.duration_months.toString());
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.location !== null) formData.append("location", values.location);
      if (values.stipend !== null)
        formData.append("stipend", values.stipend.toString());
      if (values.description !== null)
        formData.append("description", values.description);
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      formData.append("user_id", userId.toString());

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.post(`/internships/user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["internships", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      job_role: null,
      organization: null,
      organization_details: null,
      duration_months: null,
      start_date: null,
      end_date: null,
      location: null,
      stipend: null,
      skills: [],
      description: null,
      mentor_name: null,
      proof_document: null,
    } as FormValues,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await createMutation.mutateAsync(value);
    },
  });

  return (
    <div className="border-2 border-dashed border-primary rounded-lg overflow-hidden bg-primary/5">
      {/* Header */}
      <div
        className="bg-primary/10 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-primary/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Internship
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new internship experience
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          <svg
            className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="p-6 space-y-6 bg-base-100"
        >
          {/* Job Role and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="job_role">
              {(field) => (
                <FormField
                  label="Job Role"
                  htmlFor="job_role_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="job_role_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.job_role}
                    placeholder="e.g., Software Development Intern"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="organization">
              {(field) => (
                <FormField
                  label="Organization"
                  htmlFor="organization_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="organization_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.organization}
                    placeholder="Enter organization name"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Organization Details */}
          <form.Field name="organization_details">
            {(field) => (
              <FormField
                label="Organization Details"
                htmlFor="organization_details_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id="organization_details_new"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.organization_details}
                  placeholder="Brief description of the organization"
                  rows={2}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Duration, Location, Stipend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="duration_months">
              {(field) => (
                <FormField
                  label="Duration (Months)"
                  htmlFor="duration_months_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="duration_months_new"
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.duration_months}
                    placeholder="6"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <FormField
                  label="Location"
                  htmlFor="location_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="location_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.location}
                    placeholder="Bangalore, India"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="stipend">
              {(field) => (
                <FormField
                  label="Stipend (₹)"
                  htmlFor="stipend_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="stipend_new"
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.stipend}
                    placeholder="15000"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="start_date">
              {(field) => (
                <FormField
                  label="Start Date"
                  htmlFor="start_date_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="start_date_new"
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.start_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="end_date">
              {(field) => (
                <FormField
                  label="End Date"
                  htmlFor="end_date_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="end_date_new"
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.end_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Mentor Name */}
          <form.Field name="mentor_name">
            {(field) => (
              <FormField
                label="Mentor Name"
                htmlFor="mentor_name_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="mentor_name_new"
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.mentor_name}
                  placeholder="Enter mentor's name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills"
                error={getFieldError(field.state.meta.errors)}
              >
                <SkillsInput
                  value={field.state.value}
                  onChange={(skills) => field.handleChange(skills)}
                  disabled={!FIELD_PERMISSIONS.skills}
                />
              </FormField>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <FormField
                label="Description"
                htmlFor="description_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id="description_new"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.description}
                  placeholder="Describe your role and responsibilities"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Proof Document */}
          <div className="divider">Proof Document (Optional)</div>

          <form.Field name="proof_document">
            {(field) => (
              <FormField
                label="Upload Proof Document"
                htmlFor="proof_document_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="proof_document_new"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.proof_document}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-input file-input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Max file size: 10MB. Formats: PDF, JPG, PNG
                  </span>
                </label>
                {field.state.value && (
                  <div className="alert alert-info mt-2">
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
                    <span>Selected: {field.state.value.name}</span>
                  </div>
                )}
              </FormField>
            )}
          </form.Field>

          {/* Action Buttons */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting && (
                    <span className="loading loading-spinner"></span>
                  )}
                  Create Internship
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsExpanded(false);
                  }}
                  disabled={isSubmitting}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </form.Subscribe>
        </form>
      )}
    </div>
  );
}

// ==================== SINGLE INTERNSHIP RECORD FORM ====================
interface InternshipRecordFormProps {
  record: InternshipItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function InternshipRecordForm({
  record,
  onSuccess,
  onError,
}: InternshipRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.job_role !== null) formData.append("job_role", values.job_role);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.organization_details !== null)
        formData.append("organization_details", values.organization_details);
      if (values.duration_months !== null)
        formData.append("duration_months", values.duration_months.toString());
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.location !== null) formData.append("location", values.location);
      if (values.stipend !== null)
        formData.append("stipend", values.stipend.toString());
      if (values.description !== null)
        formData.append("description", values.description);
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.patch(`/internships/${record.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["internships", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      job_role: record.job_role,
      organization: record.organization,
      organization_details: record.organization_details,
      duration_months: record.duration_months,
      start_date: record.start_date,
      end_date: record.end_date,
      location: record.location,
      stipend: record.stipend,
      skills: record.skills || [],
      description: record.description,
      mentor_name: record.mentor_name,
      proof_document: null,
    } as FormValues,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await updateMutation.mutateAsync(value);
    },
  });

  // Sync form values with record when it changes
  useEffect(() => {
    if (!form.state.isDirty) {
      form.setFieldValue("job_role", record.job_role);
      form.setFieldValue("organization", record.organization);
      form.setFieldValue("organization_details", record.organization_details);
      form.setFieldValue("duration_months", record.duration_months);
      form.setFieldValue("start_date", record.start_date);
      form.setFieldValue("end_date", record.end_date);
      form.setFieldValue("location", record.location);
      form.setFieldValue("stipend", record.stipend);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("description", record.description);
      form.setFieldValue("mentor_name", record.mentor_name);
      form.setFieldValue("proof_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("job_role", record.job_role);
    form.setFieldValue("organization", record.organization);
    form.setFieldValue("organization_details", record.organization_details);
    form.setFieldValue("duration_months", record.duration_months);
    form.setFieldValue("start_date", record.start_date);
    form.setFieldValue("end_date", record.end_date);
    form.setFieldValue("location", record.location);
    form.setFieldValue("stipend", record.stipend);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("description", record.description);
    form.setFieldValue("mentor_name", record.mentor_name);
    form.setFieldValue("proof_document", null);
    setIsExpanded(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      {/* Header */}
      <div
        className="card-body cursor-pointer hover:bg-base-200 transition-colors p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">
              {record.job_role || "Job Role Not Set"}
            </h4>
            <p className="text-sm opacity-70 mt-1">
              {record.organization || "Organization not set"}
              {record.duration_months && ` • ${record.duration_months} months`}
              {(record.start_date || record.end_date) && (
                <span>
                  {" "}
                  • {formatDate(record.start_date)} -{" "}
                  {formatDate(record.end_date)}
                </span>
              )}
            </p>
            {record.proof_document_signed_url && (
              <Link
                href={record.proof_document_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                View Proof Document →
              </Link>
            )}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <svg
              className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {/* Display skills in header */}
        {record.skills && record.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {record.skills.map((skill, idx) => (
              <span key={idx} className="badge badge-secondary">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="card-body pt-0 space-y-6"
        >
          {/* Job Role and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="job_role">
              {(field) => (
                <FormField
                  label="Job Role"
                  htmlFor={`job_role_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`job_role_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.job_role}
                    placeholder="e.g., Software Development Intern"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="organization">
              {(field) => (
                <FormField
                  label="Organization"
                  htmlFor={`organization_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`organization_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.organization}
                    placeholder="Enter organization name"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Organization Details */}
          <form.Field name="organization_details">
            {(field) => (
              <FormField
                label="Organization Details"
                htmlFor={`organization_details_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id={`organization_details_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.organization_details}
                  placeholder="Brief description of the organization"
                  rows={2}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Duration, Location, Stipend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="duration_months">
              {(field) => (
                <FormField
                  label="Duration (Months)"
                  htmlFor={`duration_months_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`duration_months_${record.id}`}
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.duration_months}
                    placeholder="6"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <FormField
                  label="Location"
                  htmlFor={`location_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`location_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.location}
                    placeholder="Bangalore, India"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="stipend">
              {(field) => (
                <FormField
                  label="Stipend (₹)"
                  htmlFor={`stipend_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`stipend_${record.id}`}
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.stipend}
                    placeholder="15000"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="start_date">
              {(field) => (
                <FormField
                  label="Start Date"
                  htmlFor={`start_date_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`start_date_${record.id}`}
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.start_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="end_date">
              {(field) => (
                <FormField
                  label="End Date"
                  htmlFor={`end_date_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`end_date_${record.id}`}
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.end_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Mentor Name */}
          <form.Field name="mentor_name">
            {(field) => (
              <FormField
                label="Mentor Name"
                htmlFor={`mentor_name_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`mentor_name_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.mentor_name}
                  placeholder="Enter mentor's name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills"
                error={getFieldError(field.state.meta.errors)}
              >
                <SkillsInput
                  value={field.state.value}
                  onChange={(skills) => field.handleChange(skills)}
                  disabled={!FIELD_PERMISSIONS.skills}
                />
              </FormField>
            )}
          </form.Field>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <FormField
                label="Description"
                htmlFor={`description_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id={`description_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.description}
                  placeholder="Describe your role and responsibilities"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Proof Document */}
          <div className="divider">Proof Document</div>

          {record.proof_document_signed_url && (
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
                <div className="text-sm font-medium">
                  Current proof document uploaded
                </div>
                <Link
                  href={record.proof_document_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View Document
                </Link>
              </div>
            </div>
          )}

          <form.Field name="proof_document">
            {(field) => (
              <FormField
                label="Upload New Proof Document"
                htmlFor={`proof_document_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`proof_document_${record.id}`}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.proof_document}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="file-input file-input-bordered w-full"
                />
                {field.state.value && (
                  <div className="alert alert-success mt-2">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Selected: {field.state.value.name}</span>
                  </div>
                )}
              </FormField>
            )}
          </form.Field>

          {/* Action Buttons */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <div className="flex gap-4 pt-4 border-t border-base-300">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting && (
                    <span className="loading loading-spinner"></span>
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </form.Subscribe>
        </form>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
interface InternshipFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function InternshipForm({
  userId,
  onSuccess,
  onError,
}: InternshipFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetInternshipsResponse>(
        `/internships/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["internships", userId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
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
        <span>Error loading internships: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Internships</h2>

      {/* Add New Internship Form */}
      <AddInternshipRecordForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Internship Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <InternshipRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No internship records found. Add your first internship above.
          </div>
        )}
      </div>
    </div>
  );
}
