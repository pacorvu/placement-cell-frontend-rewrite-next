import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const extracurricularItemSchema = z.object({
  achievements: z.array(z.string()),
  activity_name: z.string(),
  activity_type: z.string(),
  created_at: z.string().datetime(),
  description: z.string(),
  end_date: z.string(),
  id: z.number().int(),
  organization: z.string(),
  proof_document: z.string(),
  proof_document_signed_url: z.string(),
  role: z.string(),
  skills: z.array(z.string()),
  start_date: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getExtracurricularResponseSchema = z.array(extracurricularItemSchema);

type ExtracurricularItem = z.infer<typeof extracurricularItemSchema>;
type GetExtracurricularResponse = z.infer<
  typeof getExtracurricularResponseSchema
>;

// Form values type for create
type CreateFormValues = {
  activity_name: string;
  activity_type: string | null;
  role: string | null;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  achievements: string[];
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
  activity_name: string | null;
  activity_type: string | null;
  role: string | null;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  achievements: string[];
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  achievements: true,
  activity_name: true,
  activity_type: true,
  description: true,
  end_date: true,
  organization: true,
  proof_document: true,
  role: true,
  skills: true,
  start_date: true,
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

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  placeholder: string;
  badgeClass?: string;
}

function ArrayInput({
  value,
  onChange,
  disabled,
  placeholder,
  badgeClass = "badge-info",
}: ArrayInputProps) {
  const [input, setInput] = useState("");

  const addItem = () => {
    if (input.trim() && !value.includes(input.trim())) {
      onChange([...value, input.trim()]);
      setInput("");
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          className="input input-bordered flex-1"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={disabled || !input.trim()}
          className="btn btn-primary"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <div key={index} className={`badge ${badgeClass} gap-2 p-3`}>
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
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

// ==================== ADD NEW ACTIVITY FORM ====================
interface AddExtracurricularFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddExtracurricularForm({
  userId,
  onSuccess,
  onError,
}: AddExtracurricularFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      console.log("=== CREATING NEW EXTRACURRICULAR ACTIVITY ===");
      console.log("Values:", values);

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("activity_name", values.activity_name);

      if (values.activity_type !== null)
        formData.append("activity_type", values.activity_type);
      if (values.role !== null) formData.append("role", values.role);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.achievements.length > 0) {
        formData.append("achievements", values.achievements.join(","));
      }

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.post(
        `/extra-curricular-activities/user`,
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
      console.error("Create error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["extra-curricular-activities", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      activity_name: "",
      activity_type: null,
      role: null,
      organization: null,
      start_date: null,
      end_date: null,
      achievements: [],
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
            Add Extra-Curricular Activity
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new extra-curricular activity
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
          {/* Activity Name */}
          <form.Field
            name="activity_name"
            validators={{
              onBlur: z.string().min(1, "Activity name is required"),
            }}
          >
            {(field) => (
              <FormField
                label="Activity Name"
                htmlFor="activity_name_new"
                required
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="activity_name_new"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.activity_name}
                  placeholder="e.g., Debate Club, Sports Team, Student Council"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Activity Type and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="activity_type">
              {(field) => (
                <FormField
                  label="Activity Type"
                  htmlFor="activity_type_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="activity_type_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.activity_type}
                    placeholder="e.g., Club, Sports, Volunteer, Cultural"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <FormField
                  label="Role"
                  htmlFor="role_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="role_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.role}
                    placeholder="e.g., President, Member, Captain"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Organization */}
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
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.organization}
                  placeholder="e.g., University Club, NGO Name"
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

          {/* Achievements */}
          <form.Field name="achievements">
            {(field) => (
              <FormField
                label="Achievements"
                error={getFieldError(field.state.meta.errors)}
              >
                <ArrayInput
                  value={field.state.value}
                  onChange={(achievements) => field.handleChange(achievements)}
                  disabled={!FIELD_PERMISSIONS.achievements}
                  placeholder="Add an achievement (e.g., Won first prize)"
                  badgeClass="badge-success"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Developed"
                error={getFieldError(field.state.meta.errors)}
              >
                <ArrayInput
                  value={field.state.value}
                  onChange={(skills) => field.handleChange(skills)}
                  disabled={!FIELD_PERMISSIONS.skills}
                  placeholder="Add a skill (e.g., Leadership, Teamwork)"
                  badgeClass="badge-info"
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
                  placeholder="Describe your role, responsibilities, and contributions"
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
                label="Upload Certificate/Proof"
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
                  Add Activity
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

// ==================== SINGLE ACTIVITY RECORD FORM ====================
interface ExtracurricularRecordFormProps {
  record: ExtracurricularItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function ExtracurricularRecordForm({
  record,
  onSuccess,
  onError,
}: ExtracurricularRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.activity_name !== null)
        formData.append("activity_name", values.activity_name);
      if (values.activity_type !== null)
        formData.append("activity_type", values.activity_type);
      if (values.role !== null) formData.append("role", values.role);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.start_date !== null)
        formData.append("start_date", values.start_date);
      if (values.end_date !== null) formData.append("end_date", values.end_date);
      if (values.description !== null)
        formData.append("description", values.description);

      if (values.achievements.length > 0) {
        formData.append("achievements", values.achievements.join(","));
      }

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }

      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.patch(
        `/extra-curricular-activities/${record.id}`,
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
        queryKey: ["extra-curricular-activities", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      activity_name: record.activity_name,
      activity_type: record.activity_type,
      role: record.role,
      organization: record.organization,
      start_date: record.start_date,
      end_date: record.end_date,
      achievements: record.achievements || [],
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
      form.setFieldValue("activity_name", record.activity_name);
      form.setFieldValue("activity_type", record.activity_type);
      form.setFieldValue("role", record.role);
      form.setFieldValue("organization", record.organization);
      form.setFieldValue("start_date", record.start_date);
      form.setFieldValue("end_date", record.end_date);
      form.setFieldValue("achievements", record.achievements || []);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("description", record.description);
      form.setFieldValue("proof_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("activity_name", record.activity_name);
    form.setFieldValue("activity_type", record.activity_type);
    form.setFieldValue("role", record.role);
    form.setFieldValue("organization", record.organization);
    form.setFieldValue("start_date", record.start_date);
    form.setFieldValue("end_date", record.end_date);
    form.setFieldValue("achievements", record.achievements || []);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("description", record.description);
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
            <h4 className="font-semibold text-lg">{record.activity_name}</h4>
            <p className="text-sm opacity-70 mt-1">
              {record.role && `${record.role} • `}
              {record.organization || "No organization"}
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
        {/* Display achievements in header */}
        {record.achievements && record.achievements.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {record.achievements.slice(0, 3).map((achievement, idx) => (
              <span key={idx} className="badge badge-success gap-1">
                🏆 {achievement}
              </span>
            ))}
            {record.achievements.length > 3 && (
              <span className="badge badge-ghost">
                +{record.achievements.length - 3} more
              </span>
            )}
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
          {/* Activity Name */}
          <form.Field name="activity_name">
            {(field) => (
              <FormField
                label="Activity Name"
                htmlFor={`activity_name_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`activity_name_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.activity_name}
                  placeholder="e.g., Debate Club, Sports Team, Student Council"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Activity Type and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="activity_type">
              {(field) => (
                <FormField
                  label="Activity Type"
                  htmlFor={`activity_type_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`activity_type_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.activity_type}
                    placeholder="e.g., Club, Sports, Volunteer, Cultural"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <FormField
                  label="Role"
                  htmlFor={`role_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`role_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.role}
                    placeholder="e.g., President, Member, Captain"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Organization */}
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
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.organization}
                  placeholder="e.g., University Club, NGO Name"
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

          {/* Achievements */}
          <form.Field name="achievements">
            {(field) => (
              <FormField
                label="Achievements"
                error={getFieldError(field.state.meta.errors)}
              >
                <ArrayInput
                  value={field.state.value}
                  onChange={(achievements) => field.handleChange(achievements)}
                  disabled={!FIELD_PERMISSIONS.achievements}
                  placeholder="Add an achievement (e.g., Won first prize)"
                  badgeClass="badge-success"
                />
              </FormField>
            )}
          </form.Field>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Developed"
                error={getFieldError(field.state.meta.errors)}
              >
                <ArrayInput
                  value={field.state.value}
                  onChange={(skills) => field.handleChange(skills)}
                  disabled={!FIELD_PERMISSIONS.skills}
                  placeholder="Add a skill (e.g., Leadership, Teamwork)"
                  badgeClass="badge-info"
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
                  placeholder="Describe your role, responsibilities, and contributions"
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
                  Current certificate uploaded
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
interface ExtracurricularFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function ExtracurricularForm({
  userId,
  onSuccess,
  onError,
}: ExtracurricularFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetExtracurricularResponse>(
        `/extra-curricular-activities/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["extra-curricular-activities", userId],
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
        <span>
          Error loading extra-curricular activities: {(error as Error)?.message}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Extra-Curricular Activities</h2>

      {/* Add New Activity Form */}
      <AddExtracurricularForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Activity Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <ExtracurricularRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No extra-curricular activities found. Add your first activity above.
          </div>
        )}
      </div>
    </div>
  );
}
