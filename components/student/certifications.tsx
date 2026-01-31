import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const certificationItemSchema = z.object({
  certification_type: z.string(),
  created_at: z.string().datetime(),
  expiry_date: z.string(),
  id: z.number().int(),
  issue_date: z.string(),
  organization: z.string(),
  proof_document: z.string(),
  proof_document_signed_url: z.string(),
  score: z.number(),
  skills: z.array(z.string()),
  title: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getCertificationsResponseSchema = z.array(certificationItemSchema);

type CertificationItem = z.infer<typeof certificationItemSchema>;
type GetCertificationsResponse = z.infer<
  typeof getCertificationsResponseSchema
>;

// Form values type for create
type CreateFormValues = {
  title: string;
  organization: string;
  certification_type: string | null;
  skills: string[];
  score: number | null;
  issue_date: string | null;
  expiry_date: string | null;
  proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
  title: string | null;
  organization: string | null;
  certification_type: string | null;
  skills: string[];
  score: number | null;
  issue_date: string | null;
  expiry_date: string | null;
  proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  certification_type: true,
  expiry_date: true,
  issue_date: true,
  organization: true,
  proof_document: true,
  score: true,
  skills: true,
  title: true,
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

// ==================== ADD NEW CERTIFICATION FORM ====================
interface AddCertificationFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddCertificationForm({
  userId,
  onSuccess,
  onError,
}: AddCertificationFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      console.log("=== CREATING NEW CERTIFICATION ===");
      console.log("Values:", values);

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("title", values.title);
      formData.append("organization", values.organization);

      if (values.certification_type !== null)
        formData.append("certification_type", values.certification_type);
      if (values.score !== null)
        formData.append("score", values.score.toString());
      if (values.issue_date !== null)
        formData.append("issue_date", values.issue_date);
      if (values.expiry_date !== null)
        formData.append("expiry_date", values.expiry_date);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.post(`/certifications/user`, formData, {
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
        queryKey: ["certifications", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      organization: "",
      certification_type: null,
      skills: [],
      score: null,
      issue_date: null,
      expiry_date: null,
      proof_document: null,
    } as CreateFormValues,
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
            Add New Certification
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new certification
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
          {/* Title and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="title"
              validators={{
                onBlur: z.string().min(1, "Title is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Certification Title"
                  htmlFor="title_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="title_new"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.title}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="organization"
              validators={{
                onBlur: z.string().min(1, "Organization is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Issuing Organization"
                  htmlFor="organization_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="organization_new"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.organization}
                    placeholder="e.g., Amazon Web Services"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Certification Type and Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="certification_type">
              {(field) => (
                <FormField
                  label="Certification Type"
                  htmlFor="certification_type_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="certification_type_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.certification_type}
                    placeholder="e.g., Professional, Associate"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="score"
              validators={{
                onBlur: z
                  .number()
                  .min(0, "Score must be at least 0")
                  .max(100, "Score must be at most 100")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Score"
                  htmlFor="score_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="score_new"
                    type="number"
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.score}
                    placeholder="e.g., 85.5"
                    min="0"
                    max="100"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Issue Date and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="issue_date">
              {(field) => (
                <FormField
                  label="Issue Date"
                  htmlFor="issue_date_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="issue_date_new"
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.issue_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="expiry_date">
              {(field) => (
                <FormField
                  label="Expiry Date"
                  htmlFor="expiry_date_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="expiry_date_new"
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.expiry_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Covered"
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

          {/* Proof Document */}
          <div className="divider">Proof Document (Optional)</div>

          <form.Field name="proof_document">
            {(field) => (
              <FormField
                label="Upload Certification Document"
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
                  <div className="alert alert-soft mt-2">
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
                  Add Certification
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

// ==================== SINGLE CERTIFICATION RECORD FORM ====================
interface CertificationRecordFormProps {
  record: CertificationItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function CertificationRecordForm({
  record,
  onSuccess,
  onError,
}: CertificationRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.certification_type !== null)
        formData.append("certification_type", values.certification_type);
      if (values.score !== null)
        formData.append("score", values.score.toString());
      if (values.issue_date !== null)
        formData.append("issue_date", values.issue_date);
      if (values.expiry_date !== null)
        formData.append("expiry_date", values.expiry_date);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.patch(
        `/certifications/${record.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["certifications", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: record.title,
      organization: record.organization,
      certification_type: record.certification_type,
      skills: record.skills || [],
      score: record.score,
      issue_date: record.issue_date,
      expiry_date: record.expiry_date,
      proof_document: null,
    } as UpdateFormValues,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await updateMutation.mutateAsync(value);
    },
  });

  // Sync form values with record when it changes
  useEffect(() => {
    if (!form.state.isDirty) {
      form.setFieldValue("title", record.title);
      form.setFieldValue("organization", record.organization);
      form.setFieldValue("certification_type", record.certification_type);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("score", record.score);
      form.setFieldValue("issue_date", record.issue_date);
      form.setFieldValue("expiry_date", record.expiry_date);
      form.setFieldValue("proof_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("title", record.title);
    form.setFieldValue("organization", record.organization);
    form.setFieldValue("certification_type", record.certification_type);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("score", record.score);
    form.setFieldValue("issue_date", record.issue_date);
    form.setFieldValue("expiry_date", record.expiry_date);
    form.setFieldValue("proof_document", null);
    setIsExpanded(false);
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
            <h4 className="font-semibold text-lg">{record.title}</h4>
            <p className="text-sm opacity-70 mt-1">
              {record.organization} •{" "}
              {record.issue_date
                ? new Date(record.issue_date).getFullYear()
                : "No date"}
              {record.score && ` • Score: ${record.score}`}
            </p>
            {record.proof_document_signed_url && (
              <Link
                href={record.proof_document_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                View Certificate →
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
          {/* Title and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="title">
              {(field) => (
                <FormField
                  label="Certification Title"
                  htmlFor={`title_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`title_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.title}
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="organization">
              {(field) => (
                <FormField
                  label="Issuing Organization"
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
                    placeholder="e.g., Amazon Web Services"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Certification Type and Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="certification_type">
              {(field) => (
                <FormField
                  label="Certification Type"
                  htmlFor={`certification_type_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`certification_type_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.certification_type}
                    placeholder="e.g., Professional, Associate"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="score"
              validators={{
                onBlur: z
                  .number()
                  .min(0, "Score must be at least 0")
                  .max(100, "Score must be at most 100")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Score"
                  htmlFor={`score_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`score_${record.id}`}
                    type="number"
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.score}
                    placeholder="e.g., 85.5"
                    min="0"
                    max="100"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Issue Date and Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="issue_date">
              {(field) => (
                <FormField
                  label="Issue Date"
                  htmlFor={`issue_date_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`issue_date_${record.id}`}
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.issue_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="expiry_date">
              {(field) => (
                <FormField
                  label="Expiry Date"
                  htmlFor={`expiry_date_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`expiry_date_${record.id}`}
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.expiry_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Covered"
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

          {/* Proof Document */}
          <div className="divider">Proof Document</div>

          {record.proof_document_signed_url && (
            <div className="alert alert-soft">
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
                  Current certification document uploaded
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
                label="Upload New Certification Document"
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
interface CertificationsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function CertificationsForm({
  userId,
  onSuccess,
  onError,
}: CertificationsFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetCertificationsResponse>(
        `/certifications/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["certifications", userId],
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
        <span>Error loading certifications: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Certifications</h2>

      {/* Add New Certification Form */}
      <AddCertificationForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Certification Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <CertificationRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No certifications found. Add your first certification above.
          </div>
        )}
      </div>
    </div>
  );
}
