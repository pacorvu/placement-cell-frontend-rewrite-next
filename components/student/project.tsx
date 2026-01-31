import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const projectItemSchema = z.object({
  created_at: z.string().datetime(),
  description: z.string().nullable(),
  id: z.number(),
  mentor_name: z.string().nullable(),
  project_link: z.string().nullable(),
  skills: z.array(z.string()).nullable(),
  snaps: z.array(z.string()).nullable(),
  snaps_signed_urls: z.array(z.string()).nullable(),
  title: z.string().nullable(),
  updated_at: z.string().datetime(),
  user_id: z.number(),
  usn: z.string(),
});

const getProjectsResponseSchema = z.array(projectItemSchema);

type ProjectItem = z.infer<typeof projectItemSchema>;
type GetProjectsResponse = z.infer<typeof getProjectsResponseSchema>;

// Form values type
type FormValues = {
  title: string | null;
  description: string | null;
  skills: string[];
  project_link: string | null;
  mentor_name: string | null;
  snaps: File[];
  replace_snaps: boolean;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  description: true,
  mentor_name: true,
  project_link: true,
  replace_snaps: true,
  skills: true,
  snaps: true,
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

interface ImagePreviewProps {
  images: string[];
  onRemove?: (index: number) => void;
  disabled?: boolean;
}

function ImagePreview({ images, onRemove, disabled }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((url, index) => (
        <div key={index} className="relative group card bg-base-200">
          <figure className="aspect-square">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </figure>
          {onRemove && !disabled && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn btn-circle btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== ADD NEW PROJECT FORM ====================
interface AddProjectFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddProjectForm({ userId, onSuccess, onError }: AddProjectFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== CREATING NEW PROJECT ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.description !== null)
        formData.append("description", values.description);
      if (values.project_link !== null)
        formData.append("project_link", values.project_link);
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      formData.append("user_id", userId.toString());

      if (values.snaps.length > 0) {
        values.snaps.forEach((file) => {
          formData.append("snaps", file);
        });
      }

      const response = await api.post(`/projects/user`, formData, {
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
        queryKey: ["projects", userId],
      });
      form.reset();
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: null,
      description: null,
      skills: [],
      project_link: null,
      mentor_name: null,
      snaps: [],
      replace_snaps: false,
    } as FormValues,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await createMutation.mutateAsync(value);
    },
  });

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const currentSnaps = form.getFieldValue("snaps") || [];
    form.setFieldValue("snaps", [...currentSnaps, ...newFiles] as any);

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const currentSnaps = form.getFieldValue("snaps") || [];
    form.setFieldValue(
      "snaps",
      currentSnaps.filter((_, i) => i !== index) as any,
    );
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
            Add New Project
          </h4>
          <p className="text-sm opacity-70 mt-1">Click to add a new project</p>
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
          <form.Field name="title">
            {(field) => (
              <FormField
                label="Project Title"
                htmlFor="title_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="title_new"
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.title}
                  placeholder="e.g., E-commerce Website"
                  className="input input-bordered w-full"
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
                  placeholder="Describe your project, its features, and technologies used"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Project Link and Mentor Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="project_link">
              {(field) => (
                <FormField
                  label="Project Link"
                  htmlFor="project_link_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="project_link_new"
                    type="url"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.project_link}
                    placeholder="https://github.com/username/project"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

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
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.mentor_name}
                    placeholder="Enter mentor's name (optional)"
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
                label="Skills & Technologies"
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

          {/* Project Images */}
          <div className="divider">Project Screenshots (Optional)</div>

          <form.Field name="snaps">
            {(field) => (
              <FormField
                label="Upload Images"
                htmlFor="snaps_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="snaps_new"
                  type="file"
                  multiple
                  onChange={(e) => handleImagesChange(e.target.files)}
                  disabled={!FIELD_PERMISSIONS.snaps}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="file-input file-input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Max file size: 10MB per image. Formats: JPG, PNG, WebP
                  </span>
                </label>
                {previewUrls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Selected images ({previewUrls.length}):
                    </p>
                    <ImagePreview
                      images={previewUrls}
                      onRemove={removeImage}
                      disabled={!FIELD_PERMISSIONS.snaps}
                    />
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
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    form.reset();
                    setPreviewUrls([]);
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

// ==================== SINGLE PROJECT FORM ====================
interface ProjectFormProps {
  record: ProjectItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function ProjectForm({ record, onSuccess, onError }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.description !== null)
        formData.append("description", values.description);
      if (values.project_link !== null)
        formData.append("project_link", values.project_link);
      if (values.mentor_name !== null)
        formData.append("mentor_name", values.mentor_name);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      formData.append("replace_snaps", values.replace_snaps.toString());

      if (values.snaps.length > 0) {
        values.snaps.forEach((file) => {
          formData.append("snaps", file);
        });
      }

      const response = await api.patch(`/projects/${record.id}`, formData, {
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
        queryKey: ["projects", record.user_id],
      });
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      title: record.title,
      description: record.description,
      skills: record.skills || [],
      project_link: record.project_link,
      mentor_name: record.mentor_name,
      snaps: [],
      replace_snaps: false,
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
      form.setFieldValue("title", record.title);
      form.setFieldValue("description", record.description);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("project_link", record.project_link);
      form.setFieldValue("mentor_name", record.mentor_name);
      form.setFieldValue("snaps", [] as any);
      form.setFieldValue("replace_snaps", false);
    }
  }, [record, form]);

  const handleReset = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    form.setFieldValue("title", record.title);
    form.setFieldValue("description", record.description);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("project_link", record.project_link);
    form.setFieldValue("mentor_name", record.mentor_name);
    form.setFieldValue("snaps", [] as any);
    form.setFieldValue("replace_snaps", false);
    setPreviewUrls([]);
    setIsExpanded(false);
  };

  const handleImagesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const currentSnaps = form.getFieldValue("snaps") || [];
    form.setFieldValue("snaps", [...currentSnaps, ...newFiles] as any);

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    const currentSnaps = form.getFieldValue("snaps") || [];
    form.setFieldValue(
      "snaps",
      currentSnaps.filter((_, i) => i !== index) as any,
    );
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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
              {record.title || "Untitled Project"}
            </h4>
            {record.description && (
              <p className="text-sm opacity-70 mt-1 line-clamp-2">
                {record.description}
              </p>
            )}
            {record.project_link && (
              <Link
                href={`${record.project_link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                View Project →
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
          {/* Title */}
          <form.Field name="title">
            {(field) => (
              <FormField
                label="Project Title"
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
                  placeholder="e.g., E-commerce Website"
                  className="input input-bordered w-full"
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
                  placeholder="Describe your project, its features, and technologies used"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Project Link and Mentor Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="project_link">
              {(field) => (
                <FormField
                  label="Project Link"
                  htmlFor={`project_link_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`project_link_${record.id}`}
                    type="url"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.project_link}
                    placeholder="https://github.com/username/project"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

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
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.mentor_name}
                    placeholder="Enter mentor's name (optional)"
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
                label="Skills & Technologies"
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

          {/* Project Images */}
          <div className="divider">Project Screenshots</div>

          {/* Existing images */}
          {record.snaps_signed_urls && record.snaps_signed_urls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current images:</p>
              <ImagePreview images={record.snaps_signed_urls} />
            </div>
          )}

          {/* Replace snaps toggle */}
          <form.Field name="replace_snaps">
            {(field) => (
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    disabled={!FIELD_PERMISSIONS.replace_snaps}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">
                    Replace existing images (instead of adding to them)
                  </span>
                </label>
              </div>
            )}
          </form.Field>

          <form.Field name="snaps">
            {(field) => (
              <FormField
                label={
                  form.getFieldValue("replace_snaps")
                    ? "Upload New Images (Replace All)"
                    : "Upload Additional Images"
                }
                htmlFor={`snaps_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`snaps_${record.id}`}
                  type="file"
                  multiple
                  onChange={(e) => handleImagesChange(e.target.files)}
                  disabled={!FIELD_PERMISSIONS.snaps}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="file-input file-input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">
                    Max file size: 10MB per image. Formats: JPG, PNG, WebP
                  </span>
                </label>
                {previewUrls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      New images to upload ({previewUrls.length}):
                    </p>
                    <ImagePreview
                      images={previewUrls}
                      onRemove={removeNewImage}
                      disabled={!FIELD_PERMISSIONS.snaps}
                    />
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
interface ProjectsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function ProjectsForm({
  userId,
  onSuccess,
  onError,
}: ProjectsFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetProjectsResponse>(
        `/projects/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["projects", userId],
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
        <span>Error loading projects: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Projects</h2>

      {/* Add New Project Form */}
      <AddProjectForm userId={userId} onSuccess={onSuccess} onError={onError} />

      {/* Existing Project Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <ProjectForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No projects found. Add your first project above.
          </div>
        )}
      </div>
    </div>
  );
}
