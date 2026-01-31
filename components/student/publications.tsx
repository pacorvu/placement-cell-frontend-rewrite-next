import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const publicationItemSchema = z.object({
  author_count: z.number().int(),
  created_at: z.string().datetime(),
  description: z.string(),
  evidence_document: z.string(),
  evidence_document_signed_url: z.string(),
  id: z.number().int(),
  mentor_name: z.string(),
  publication_date: z.string(),
  publication_name: z.string(),
  publication_type: z.string(),
  skills: z.array(z.string()),
  title: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getPublicationsResponseSchema = z.array(publicationItemSchema);

type PublicationItem = z.infer<typeof publicationItemSchema>;
type GetPublicationsResponse = z.infer<typeof getPublicationsResponseSchema>;

// Form values type for create
type CreateFormValues = {
  title: string;
  publication_name: string | null;
  publication_type: string | null;
  publication_date: string | null;
  author_count: number | null;
  mentor_name: string | null;
  skills: string[];
  description: string | null;
  evidence_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
  title: string | null;
  publication_name: string | null;
  publication_type: string | null;
  publication_date: string | null;
  author_count: number | null;
  mentor_name: string | null;
  skills: string[];
  description: string | null;
  evidence_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  author_count: true,
  description: true,
  evidence_document: true,
  mentor_name: true,
  publication_date: true,
  publication_name: true,
  publication_type: true,
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
          placeholder="Add a skill (e.g., Research, Writing)"
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

// ==================== ADD NEW PUBLICATION FORM ====================
interface AddPublicationFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddPublicationForm({
  userId,
  onSuccess,
  onError,
}: AddPublicationFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      console.log("=== CREATING NEW PUBLICATION ===");
      console.log("Values:", values);

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("title", values.title);

      if (values.publication_name !== null)
        formData.append("publication_name", values.publication_name);
      if (values.publication_type !== null)
        formData.append("publication_type", values.publication_type);
      if (values.publication_date !== null)
        formData.append("publication_date", values.publication_date);
      if (values.author_count !== null)
        formData.append("author_count", values.author_count.toString());
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.evidence_document) {
        formData.append("evidence_document", values.evidence_document);
      }

      const response = await api.post(`/publications/user`, formData, {
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
        queryKey: ["publications", userId],
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
      publication_name: null,
      publication_type: null,
      publication_date: null,
      author_count: null,
      mentor_name: null,
      skills: [],
      description: null,
      evidence_document: null,
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
            Add Publication
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new publication
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
          {/* Title */}
          <form.Field
            name="title"
            validators={{
              onBlur: z.string().min(1, "Title is required"),
            }}
          >
            {(field) => (
              <FormField
                label="Publication Title"
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
                  placeholder="e.g., Machine Learning Applications in Healthcare"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Publication Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="publication_name">
              {(field) => (
                <FormField
                  label="Publication Name"
                  htmlFor="publication_name_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="publication_name_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_name}
                    placeholder="e.g., IEEE Journal, ACM Conference"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="publication_type">
              {(field) => (
                <FormField
                  label="Publication Type"
                  htmlFor="publication_type_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="publication_type_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_type}
                    placeholder="e.g., Journal, Conference, Workshop"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Publication Date and Author Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="publication_date">
              {(field) => (
                <FormField
                  label="Publication Date"
                  htmlFor="publication_date_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="publication_date_new"
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="author_count"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(1, "Author count must be at least 1")
                  .max(100, "Author count must be at most 100")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Number of Authors"
                  htmlFor="author_count_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="author_count_new"
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
                    disabled={!FIELD_PERMISSIONS.author_count}
                    placeholder="e.g., 3"
                    min="1"
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
                  placeholder="Enter mentor/supervisor name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills/Topics"
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
                  placeholder="Describe the publication, its contribution, and key findings"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Evidence Document */}
          <div className="divider">Evidence Document (Optional)</div>

          <form.Field name="evidence_document">
            {(field) => (
              <FormField
                label="Upload Publication/Evidence"
                htmlFor="evidence_document_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="evidence_document_new"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.evidence_document}
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
                  Add Publication
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

// ==================== SINGLE PUBLICATION RECORD FORM ====================
interface PublicationRecordFormProps {
  record: PublicationItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function PublicationRecordForm({
  record,
  onSuccess,
  onError,
}: PublicationRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.publication_name !== null)
        formData.append("publication_name", values.publication_name);
      if (values.publication_type !== null)
        formData.append("publication_type", values.publication_type);
      if (values.publication_date !== null)
        formData.append("publication_date", values.publication_date);
      if (values.author_count !== null)
        formData.append("author_count", values.author_count.toString());
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.evidence_document) {
        formData.append("evidence_document", values.evidence_document);
      }

      const response = await api.patch(`/publications/${record.id}`, formData, {
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
        queryKey: ["publications", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: record.title,
      publication_name: record.publication_name,
      publication_type: record.publication_type,
      publication_date: record.publication_date,
      author_count: record.author_count,
      mentor_name: record.mentor_name,
      skills: record.skills || [],
      description: record.description,
      evidence_document: null,
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
      form.setFieldValue("publication_name", record.publication_name);
      form.setFieldValue("publication_type", record.publication_type);
      form.setFieldValue("publication_date", record.publication_date);
      form.setFieldValue("author_count", record.author_count);
      form.setFieldValue("mentor_name", record.mentor_name);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("description", record.description);
      form.setFieldValue("evidence_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("title", record.title);
    form.setFieldValue("publication_name", record.publication_name);
    form.setFieldValue("publication_type", record.publication_type);
    form.setFieldValue("publication_date", record.publication_date);
    form.setFieldValue("author_count", record.author_count);
    form.setFieldValue("mentor_name", record.mentor_name);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("description", record.description);
    form.setFieldValue("evidence_document", null);
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
              {record.publication_name || "Publication name not set"} •{" "}
              {record.publication_type || "Type not set"}
              {record.author_count &&
                ` • ${record.author_count} author${record.author_count > 1 ? "s" : ""}`}
            </p>
            {record.evidence_document_signed_url && (
              <Link
                href={record.evidence_document_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                View Publication →
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
              <span key={idx} className="badge badge-accent">
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
          {/* Title */}
          <form.Field name="title">
            {(field) => (
              <FormField
                label="Publication Title"
                htmlFor={`title_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`title_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.title}
                  placeholder="e.g., Machine Learning Applications in Healthcare"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Publication Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="publication_name">
              {(field) => (
                <FormField
                  label="Publication Name"
                  htmlFor={`publication_name_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`publication_name_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_name}
                    placeholder="e.g., IEEE Journal, ACM Conference"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="publication_type">
              {(field) => (
                <FormField
                  label="Publication Type"
                  htmlFor={`publication_type_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`publication_type_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_type}
                    placeholder="e.g., Journal, Conference, Workshop"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Publication Date and Author Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="publication_date">
              {(field) => (
                <FormField
                  label="Publication Date"
                  htmlFor={`publication_date_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`publication_date_${record.id}`}
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.publication_date}
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="author_count"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(1, "Author count must be at least 1")
                  .max(100, "Author count must be at most 100")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Number of Authors"
                  htmlFor={`author_count_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`author_count_${record.id}`}
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
                    disabled={!FIELD_PERMISSIONS.author_count}
                    placeholder="e.g., 3"
                    min="1"
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
                  placeholder="Enter mentor/supervisor name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills/Topics"
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
                  placeholder="Describe the publication, its contribution, and key findings"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Evidence Document */}
          <div className="divider">Evidence Document</div>

          {record.evidence_document_signed_url && (
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
                  Current publication document uploaded
                </div>
                <Link
                  href={record.evidence_document_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View Document
                </Link>
              </div>
            </div>
          )}

          <form.Field name="evidence_document">
            {(field) => (
              <FormField
                label="Upload New Publication/Evidence"
                htmlFor={`evidence_document_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`evidence_document_${record.id}`}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.evidence_document}
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
interface PublicationsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PublicationsForm({
  userId,
  onSuccess,
  onError,
}: PublicationsFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetPublicationsResponse>(
        `/publications/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["publications", userId],
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
        <span>Error loading publications: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Publications</h2>

      {/* Add New Publication Form */}
      <AddPublicationForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Publication Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <PublicationRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No publications found. Add your first publication above.
          </div>
        )}
      </div>
    </div>
  );
}
