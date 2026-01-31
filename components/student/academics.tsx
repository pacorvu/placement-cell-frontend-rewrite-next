import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";
import Link from "next/link";

// ==================== SCHEMAS ====================
const academicsItemSchema = z.object({
  academic_year: z.number().int(),
  closed_backlogs: z.number().int(),
  id: z.number().int(),
  live_backlogs: z.number().int(),
  provisional_result_upload_link: z.string(),
  provisional_result_upload_link_signed_url: z.string(),
  result_in_sgpa: z.number(),
  semester: z.number().int(),
  uploaded_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getAcademicsResponseSchema = z.array(academicsItemSchema);

type AcademicsItem = z.infer<typeof academicsItemSchema>;
type GetAcademicsResponse = z.infer<typeof getAcademicsResponseSchema>;

// Form values type for create
type CreateFormValues = {
  academic_year: number;
  semester: number;
  result_in_sgpa: number;
  closed_backlogs: number | null;
  live_backlogs: number | null;
  provisional_result_upload_link: File | null;
};

// Form values type for update
type UpdateFormValues = {
  academic_year: number | null;
  semester: number | null;
  result_in_sgpa: number | null;
  closed_backlogs: number | null;
  live_backlogs: number | null;
  provisional_result_upload_link: File | null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  academic_year: true,
  closed_backlogs: true,
  live_backlogs: true,
  provisional_result_upload_link: true,
  result_in_sgpa: true,
  semester: true,
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

// ==================== ADD NEW ACADEMICS RECORD FORM ====================
interface AddAcademicsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddAcademicsForm({
  userId,
  onSuccess,
  onError,
}: AddAcademicsFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      console.log("=== CREATING NEW SEMESTER ACADEMICS ===");
      console.log("Values:", values);

      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("academic_year", values.academic_year.toString());
      formData.append("semester", values.semester.toString());
      formData.append("result_in_sgpa", values.result_in_sgpa.toString());

      if (values.closed_backlogs !== null) {
        formData.append("closed_backlogs", values.closed_backlogs.toString());
      }
      if (values.live_backlogs !== null) {
        formData.append("live_backlogs", values.live_backlogs.toString());
      }

      if (values.provisional_result_upload_link) {
        formData.append(
          "provisional_result_upload_link",
          values.provisional_result_upload_link,
        );
      }

      const response = await api.post(`/semester-academics/user`, formData, {
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
        queryKey: ["semester-academics", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      academic_year: new Date().getFullYear(),
      semester: 1,
      result_in_sgpa: 0,
      closed_backlogs: null,
      live_backlogs: null,
      provisional_result_upload_link: null,
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
            Add Semester Academics
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new semester academic record
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
          {/* Academic Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="academic_year"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(2000, "Academic year must be at least 2000")
                  .max(2100, "Academic year must be at most 2100"),
              }}
            >
              {(field) => (
                <FormField
                  label="Academic Year"
                  htmlFor="academic_year_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="academic_year_new"
                    type="number"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10) || 0)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.academic_year}
                    placeholder="e.g., 2024"
                    min="2000"
                    max="2100"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="semester"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(1, "Semester must be at least 1")
                  .max(8, "Semester must be at most 8"),
              }}
            >
              {(field) => (
                <FormField
                  label="Semester"
                  htmlFor="semester_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <select
                    id="semester_new"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10))
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.semester}
                    className="select select-bordered w-full"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* SGPA */}
          <form.Field
            name="result_in_sgpa"
            validators={{
              onBlur: z
                .number()
                .min(0, "SGPA must be at least 0")
                .max(10, "SGPA must be at most 10"),
            }}
          >
            {(field) => (
              <FormField
                label="Result in SGPA"
                htmlFor="result_in_sgpa_new"
                required
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="result_in_sgpa_new"
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseFloat(e.target.value) || 0)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.result_in_sgpa}
                  placeholder="e.g., 8.5"
                  min="0"
                  max="10"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Backlogs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="closed_backlogs"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(0, "Closed backlogs must be at least 0")
                  .max(50, "Closed backlogs must be at most 50")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Closed Backlogs"
                  htmlFor="closed_backlogs_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="closed_backlogs_new"
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
                    disabled={!FIELD_PERMISSIONS.closed_backlogs}
                    placeholder="Enter number of closed backlogs"
                    min="0"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="live_backlogs"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(0, "Live backlogs must be at least 0")
                  .max(50, "Live backlogs must be at most 50")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Live Backlogs"
                  htmlFor="live_backlogs_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="live_backlogs_new"
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
                    disabled={!FIELD_PERMISSIONS.live_backlogs}
                    placeholder="Enter number of live backlogs"
                    min="0"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Provisional Result Upload */}
          <div className="divider">Provisional Result Document</div>

          <form.Field name="provisional_result_upload_link">
            {(field) => (
              <FormField
                label="Upload Provisional Result"
                htmlFor="provisional_result_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="provisional_result_new"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.provisional_result_upload_link}
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
                  Add Academic Record
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

// ==================== SINGLE ACADEMICS RECORD FORM ====================
interface AcademicsRecordFormProps {
  record: AcademicsItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AcademicsRecordForm({
  record,
  onSuccess,
  onError,
}: AcademicsRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.academic_year !== null)
        formData.append("academic_year", values.academic_year.toString());
      if (values.semester !== null)
        formData.append("semester", values.semester.toString());
      if (values.result_in_sgpa !== null)
        formData.append("result_in_sgpa", values.result_in_sgpa.toString());
      if (values.closed_backlogs !== null)
        formData.append("closed_backlogs", values.closed_backlogs.toString());
      if (values.live_backlogs !== null)
        formData.append("live_backlogs", values.live_backlogs.toString());

      if (values.provisional_result_upload_link) {
        formData.append(
          "provisional_result_upload_link",
          values.provisional_result_upload_link,
        );
      }

      const response = await api.patch(
        `/semester-academics/${record.id}`,
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
        queryKey: ["semester-academics", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      academic_year: record.academic_year,
      semester: record.semester,
      result_in_sgpa: record.result_in_sgpa,
      closed_backlogs: record.closed_backlogs,
      live_backlogs: record.live_backlogs,
      provisional_result_upload_link: null,
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
      form.setFieldValue("academic_year", record.academic_year);
      form.setFieldValue("semester", record.semester);
      form.setFieldValue("result_in_sgpa", record.result_in_sgpa);
      form.setFieldValue("closed_backlogs", record.closed_backlogs);
      form.setFieldValue("live_backlogs", record.live_backlogs);
      form.setFieldValue("provisional_result_upload_link", null);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("academic_year", record.academic_year);
    form.setFieldValue("semester", record.semester);
    form.setFieldValue("result_in_sgpa", record.result_in_sgpa);
    form.setFieldValue("closed_backlogs", record.closed_backlogs);
    form.setFieldValue("live_backlogs", record.live_backlogs);
    form.setFieldValue("provisional_result_upload_link", null);
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
            <h4 className="font-semibold text-lg">
              Academic Year {record.academic_year} - Semester {record.semester}
            </h4>
            <p className="text-sm opacity-70 mt-1">
              SGPA: {record.result_in_sgpa} •{" "}
              {record.live_backlogs > 0
                ? `${record.live_backlogs} Live Backlog${record.live_backlogs > 1 ? "s" : ""}`
                : "No Backlogs"}
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

          {/* Academic Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="academic_year"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(2000, "Academic year must be at least 2000")
                  .max(2100, "Academic year must be at most 2100")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Academic Year"
                  htmlFor={`academic_year_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`academic_year_${record.id}`}
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
                    disabled={!FIELD_PERMISSIONS.academic_year}
                    placeholder="e.g., 2024"
                    min="2000"
                    max="2100"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="semester"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(1, "Semester must be at least 1")
                  .max(8, "Semester must be at most 8")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Semester"
                  htmlFor={`semester_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <select
                    id={`semester_${record.id}`}
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.semester}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select semester</option>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* SGPA */}
          <form.Field
            name="result_in_sgpa"
            validators={{
              onBlur: z
                .number()
                .min(0, "SGPA must be at least 0")
                .max(10, "SGPA must be at most 10")
                .nullable(),
            }}
          >
            {(field) => (
              <FormField
                label="Result in SGPA"
                htmlFor={`result_in_sgpa_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`result_in_sgpa_${record.id}`}
                  type="number"
                  step="0.01"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? null : parseFloat(e.target.value),
                    )
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.result_in_sgpa}
                  placeholder="e.g., 8.5"
                  min="0"
                  max="10"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Backlogs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="closed_backlogs"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(0, "Closed backlogs must be at least 0")
                  .max(50, "Closed backlogs must be at most 50")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Closed Backlogs"
                  htmlFor={`closed_backlogs_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`closed_backlogs_${record.id}`}
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
                    disabled={!FIELD_PERMISSIONS.closed_backlogs}
                    placeholder="Enter number of closed backlogs"
                    min="0"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="live_backlogs"
              validators={{
                onBlur: z
                  .number()
                  .int()
                  .min(0, "Live backlogs must be at least 0")
                  .max(50, "Live backlogs must be at most 50")
                  .nullable(),
              }}
            >
              {(field) => (
                <FormField
                  label="Live Backlogs"
                  htmlFor={`live_backlogs_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`live_backlogs_${record.id}`}
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
                    disabled={!FIELD_PERMISSIONS.live_backlogs}
                    placeholder="Enter number of live backlogs"
                    min="0"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Provisional Result Upload */}
          <div className="divider">Provisional Result Document</div>

          {record.provisional_result_upload_link_signed_url && (
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
                  Current provisional result uploaded
                </div>
                <Link
                  href={record.provisional_result_upload_link_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View Document
                </Link>
              </div>
            </div>
          )}

          <form.Field name="provisional_result_upload_link">
            {(field) => (
              <FormField
                label="Upload New Provisional Result"
                htmlFor={`provisional_result_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`provisional_result_${record.id}`}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.provisional_result_upload_link}
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
interface SemesterAcademicsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function SemesterAcademicsForm({
  userId,
  onSuccess,
  onError,
}: SemesterAcademicsFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetAcademicsResponse>(
        `/semester-academics/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["semester-academics", userId],
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
          Error loading semester academics: {(error as Error)?.message}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Semester Academics</h2>

      {/* Add New Academic Record Form */}
      <AddAcademicsForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Academic Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data
            .sort((a, b) => {
              if (a.academic_year !== b.academic_year) {
                return b.academic_year - a.academic_year;
              }
              return b.semester - a.semester;
            })
            .map((record) => (
              <AcademicsRecordForm
                key={record.id}
                record={record}
                onSuccess={onSuccess}
                onError={onError}
              />
            ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No semester academic records found. Add your first record above.
          </div>
        )}
      </div>
    </div>
  );
}
