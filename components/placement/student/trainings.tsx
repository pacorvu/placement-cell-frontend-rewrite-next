import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";
import { is404Error, EmptyState } from "./all.formUI";

// ==================== SCHEMAS ====================
const trainingItemSchema = z.object({
  created_at: z.string().datetime(),
  description: z.string(),
  end_date: z.string(),
  id: z.number().int(),
  institution: z.string(),
  proof_document: z.string(),
  proof_document_signed_url: z.string(),
  skills: z.array(z.string()),
  start_date: z.string(),
  title: z.string(),
  training_type: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getTrainingsResponseSchema = z.array(trainingItemSchema);

type TrainingItem = z.infer<typeof trainingItemSchema>;
type GetTrainingsResponse = z.infer<typeof getTrainingsResponseSchema>;

// Form values type for create
type CreateFormValues = {
  title: string;
  institution: string;
  training_type: string | null;
  start_date: string | null;
  end_date: string | null;
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
  title: string | null;
  institution: string | null;
  training_type: string | null;
  start_date: string | null;
  end_date: string | null;
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  description: true,
  end_date: true,
  institution: true,
  proof_document: true,
  skills: true,
  start_date: true,
  title: true,
  training_type: true,
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

// ==================== ADD NEW TRAINING FORM ====================
interface AddTrainingFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddTrainingForm({ userId, onSuccess, onError }: AddTrainingFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      console.log("=== CREATING NEW TRAINING ===");
      console.log("Values:", values);

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("title", values.title);
      formData.append("institution", values.institution);

      if (values.training_type !== null)
        formData.append("training_type", values.training_type);
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.post(`/trainings/user`, formData, {
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
        queryKey: ["trainings", userId],
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
      institution: "",
      training_type: null,
      start_date: null,
      end_date: null,
      skills: [],
      description: null,
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
            Add New Training
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new training experience
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
          {/* Title and Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="title"
              validators={{
                onBlur: z.string().min(1, "Title is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Training Title"
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
                    placeholder="e.g., Full Stack Web Development"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="institution"
              validators={{
                onBlur: z.string().min(1, "Institution is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Institution"
                  htmlFor="institution_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="institution_new"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.institution}
                    placeholder="e.g., Coursera, Udemy"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Training Type */}
          <form.Field name="training_type">
            {(field) => (
              <FormField
                label="Training Type"
                htmlFor="training_type_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="training_type_new"
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.training_type}
                  placeholder="e.g., Online Course, Workshop, Bootcamp"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Start Date and End Date */}
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

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Learned"
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
                  placeholder="Describe the training content and what you learned"
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
                label="Upload Training Certificate/Proof"
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
                  Add Training
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

// ==================== SINGLE TRAINING RECORD FORM ====================
interface TrainingRecordFormProps {
  record: TrainingItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function TrainingRecordForm({
  record,
  onSuccess,
  onError,
}: TrainingRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/trainings/${record.id}`);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      setShowDeleteConfirm(false);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["trainings", record.user_id],
      });
      onSuccess?.();
    },
  });
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.institution !== null)
        formData.append("institution", values.institution);
      if (values.training_type !== null)
        formData.append("training_type", values.training_type);
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.patch(`/trainings/${record.id}`, formData, {
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
        queryKey: ["trainings", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: record.title,
      institution: record.institution,
      training_type: record.training_type,
      start_date: record.start_date,
      end_date: record.end_date,
      skills: record.skills || [],
      description: record.description,
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
      form.setFieldValue("institution", record.institution);
      form.setFieldValue("training_type", record.training_type);
      form.setFieldValue("start_date", record.start_date);
      form.setFieldValue("end_date", record.end_date);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("description", record.description);
      form.setFieldValue("proof_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("title", record.title);
    form.setFieldValue("institution", record.institution);
    form.setFieldValue("training_type", record.training_type);
    form.setFieldValue("start_date", record.start_date);
    form.setFieldValue("end_date", record.end_date);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("description", record.description);
    form.setFieldValue("proof_document", null);
    setIsExpanded(false);
  };

  // Calculate duration
  const getDuration = () => {
    if (!record.start_date || !record.end_date) return "Duration not set";
    const start = new Date(record.start_date);
    const end = new Date(record.end_date);
    const diffMonths = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    return diffMonths > 0
      ? `${diffMonths} month${diffMonths > 1 ? "s" : ""}`
      : "Less than a month";
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
              {record.institution} • {getDuration()}
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
          {/* Title and Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="title">
              {(field) => (
                <FormField
                  label="Training Title"
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
                    placeholder="e.g., Full Stack Web Development"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="institution">
              {(field) => (
                <FormField
                  label="Institution"
                  htmlFor={`institution_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`institution_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.institution}
                    placeholder="e.g., Coursera, Udemy"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Training Type */}
          <form.Field name="training_type">
            {(field) => (
              <FormField
                label="Training Type"
                htmlFor={`training_type_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`training_type_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.training_type}
                  placeholder="e.g., Online Course, Workshop, Bootcamp"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Start Date and End Date */}
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

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Learned"
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
                  placeholder="Describe the training content and what you learned"
                  rows={4}
                  className="textarea textarea-bordered w-full"
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
                  Current training certificate uploaded
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
                label="Upload New Certificate/Proof"
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
                  disabled={!canSubmit || isSubmitting || deleteMutation.isPending}
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
                  disabled={isSubmitting || deleteMutation.isPending}
                  className="btn btn-outline"
                >
                  Cancel
                </button>

                {/* Delete button / confirmation */}
                <div className="ml-auto">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isSubmitting || deleteMutation.isPending}
                      className="btn btn-error btn-outline btn-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Training
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-error/10 border border-error rounded-lg px-3 py-2">
                      <span className="text-sm text-error font-medium">
                        Are you sure?
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className="btn btn-error btn-sm"
                      >
                        {deleteMutation.isPending && (
                          <span className="loading loading-spinner loading-xs"></span>
                        )}
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form.Subscribe>
        </form>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
interface TrainingsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function TrainingsForm({
  userId,
  onSuccess,
  onError,
}: TrainingsFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetTrainingsResponse>(
        `/trainings/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["trainings", userId],
  });
  if (is404Error(error)) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <AddTrainingForm userId={userId} onSuccess={onSuccess} onError={onError} />
        <EmptyState resourceName="projects" message="No projects found. Add your first project above." />
      </div>
    );
  }
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
        <span>Error loading trainings: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Trainings</h2>

      {/* Add New Training Form */}
      <AddTrainingForm userId={userId} onSuccess={onSuccess} onError={onError} />

      {/* Existing Training Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <TrainingRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No trainings found. Add your first training above.
          </div>
        )}
      </div>
    </div>
  );
}
