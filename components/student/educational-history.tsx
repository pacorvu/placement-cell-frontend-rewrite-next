import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";
import Link from "next/link";

// ==================== SCHEMAS ====================
const educationalHistoryItemSchema = z.object({
  board: z.string().nullable(),
  city: z.string().nullable(),
  created_at: z.string().datetime(),
  education_level: z
    .enum(["10TH", "12TH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "OTHER"])
    .nullable(),
  gap_duration_months: z.number().nullable(),
  gap_reason: z.string().nullable(),
  gap_type: z
    .enum([
      "12TH_TO_GRADUATION",
      "DIPLOMA_TO_GRADUATION",
      "GRADUATION_TO_POST_GRADUATION",
    ])
    .nullable(),
  id: z.number(),
  institute_name: z.string().nullable(),
  marksheet_file: z.string().nullable(),
  marksheet_file_signed_url: z.string().nullable(),
  result: z.number().nullable(),
  result_type: z.enum(["PERCENTAGE", "CGPA"]).nullable(),
  subjects: z.string().nullable(),
  updated_at: z.string().datetime(),
  user_id: z.number(),
  usn: z.string(),
  year_of_passing: z.number().nullable(),
});

const getEducationalHistoryResponseSchema = z.array(
  educationalHistoryItemSchema,
);

type EducationalHistoryItem = z.infer<typeof educationalHistoryItemSchema>;
type GetEducationalHistoryResponse = z.infer<
  typeof getEducationalHistoryResponseSchema
>;

// Type definitions for enums
type EducationLevel = "10TH" | "12TH" | "DIPLOMA" | "GRADUATION" | "POST_GRADUATION" | "OTHER";
type ResultType = "PERCENTAGE" | "CGPA";
type GapType = "12TH_TO_GRADUATION" | "DIPLOMA_TO_GRADUATION" | "GRADUATION_TO_POST_GRADUATION";

// Form values type
type FormValues = {
  board: string | null;
  city: string | null;
  education_level: EducationLevel | null;
  gap_duration_months: number | null;
  gap_reason: string | null;
  gap_type: GapType | null;
  institute_name: string | null;
  marksheet_file: File | null;
  result: number | null;
  result_type: ResultType | null;
  subjects: string | null;
  year_of_passing: number | null;
};

// ==================== TYPE GUARD FUNCTIONS ====================
const getValidEducationLevel = (value: string | null): EducationLevel | null => {
  if (value === "10TH" || value === "12TH" || value === "DIPLOMA" ||
    value === "GRADUATION" || value === "POST_GRADUATION" || value === "OTHER") {
    return value;
  }
  return null;
};

const getValidResultType = (value: string | null): ResultType | null => {
  if (value === "PERCENTAGE" || value === "CGPA") {
    return value;
  }
  return null;
};

const getValidGapType = (value: string | null): GapType | null => {
  if (value === "12TH_TO_GRADUATION" || value === "DIPLOMA_TO_GRADUATION" ||
    value === "GRADUATION_TO_POST_GRADUATION") {
    return value;
  }
  return null;
};

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  board: true,
  city: true,
  education_level: true,
  gap_duration_months: true,
  gap_reason: true,
  gap_type: true,
  institute_name: true,
  marksheet_file: true,
  result: true,
  result_type: true,
  subjects: true,
  year_of_passing: true,
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

// ==================== ADD NEW EDUCATION RECORD FORM ====================
interface AddEducationRecordFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddEducationRecordForm({
  userId,
  onSuccess,
  onError,
}: AddEducationRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== CREATING NEW RECORD ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.board !== null) formData.append("board", values.board);
      if (values.city !== null) formData.append("city", values.city);
      if (values.education_level !== null)
        formData.append("education_level", values.education_level);
      if (values.gap_duration_months !== null)
        formData.append(
          "gap_duration_months",
          values.gap_duration_months.toString(),
        );
      if (values.gap_reason !== null)
        formData.append("gap_reason", values.gap_reason);
      if (values.gap_type !== null) formData.append("gap_type", values.gap_type);
      if (values.institute_name !== null)
        formData.append("institute_name", values.institute_name);
      if (values.result !== null)
        formData.append("result", values.result.toString());
      if (values.result_type !== null)
        formData.append("result_type", values.result_type);
      if (values.subjects !== null) formData.append("subjects", values.subjects);
      if (values.year_of_passing !== null)
        formData.append("year_of_passing", values.year_of_passing.toString());
      formData.append("user_id", userId.toString());

      if (values.marksheet_file) {
        formData.append("marksheet_file", values.marksheet_file);
      }

      const response = await api.post(`/education-history/user`, formData, {
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
        queryKey: ["education-history", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      board: null,
      city: null,
      education_level: null,
      gap_duration_months: null,
      gap_reason: null,
      gap_type: null,
      institute_name: null,
      marksheet_file: null,
      result: null,
      result_type: null,
      subjects: null,
      year_of_passing: null,
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
            Add New Educational Record
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new educational qualification
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
          {/* Education Level */}
          <form.Field name="education_level">
            {(field) => (
              <FormField
                label="Education Level"
                htmlFor="education_level_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id="education_level_new"
                  value={field.state.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : e.target.value;
                    field.handleChange(getValidEducationLevel(value) as any);
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.education_level}
                  className="select select-bordered w-full"
                >
                  <option value="">Select level</option>
                  <option value="10TH">10th</option>
                  <option value="12TH">12th</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="GRADUATION">Graduation</option>
                  <option value="POST_GRADUATION">Post Graduation</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>
            )}
          </form.Field>

          {/* Institute Name */}
          <form.Field name="institute_name">
            {(field) => (
              <FormField
                label="Institute Name"
                htmlFor="institute_name_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="institute_name_new"
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(e.target.value || null)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.institute_name}
                  placeholder="Enter institute name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* City and Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="city">
              {(field) => (
                <FormField
                  label="City"
                  htmlFor="city_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="city_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.city}
                    placeholder="Enter city"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="board">
              {(field) => (
                <FormField
                  label="Board/University"
                  htmlFor="board_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="board_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.board}
                    placeholder="Enter board/university"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Year of Passing and Result */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="year_of_passing">
              {(field) => (
                <FormField
                  label="Year of Passing"
                  htmlFor="year_of_passing_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="year_of_passing_new"
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.year_of_passing}
                    placeholder="2024"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="result">
              {(field) => (
                <FormField
                  label="Result"
                  htmlFor="result_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="result_new"
                    type="number"
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.result}
                    placeholder="85.5"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="result_type">
              {(field) => (
                <FormField
                  label="Result Type"
                  htmlFor="result_type_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <select
                    id="result_type_new"
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : e.target.value;
                      field.handleChange(getValidResultType(value) as any);
                    }}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.result_type}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select type</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="CGPA">CGPA</option>
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Subjects */}
          <form.Field name="subjects">
            {(field) => (
              <FormField
                label="Subjects"
                htmlFor="subjects_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id="subjects_new"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(e.target.value || null)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.subjects}
                  placeholder="Enter subjects (comma-separated)"
                  rows={2}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Gap Information */}
          <div className="divider">Gap Information (Optional)</div>

          <form.Field name="gap_type">
            {(field) => (
              <FormField
                label="Gap Type"
                htmlFor="gap_type_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id="gap_type_new"
                  value={field.state.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : e.target.value;
                    field.handleChange(getValidGapType(value) as any);
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.gap_type}
                  className="select select-bordered w-full"
                >
                  <option value="">No gap</option>
                  <option value="12TH_TO_GRADUATION">12th to Graduation</option>
                  <option value="DIPLOMA_TO_GRADUATION">
                    Diploma to Graduation
                  </option>
                  <option value="GRADUATION_TO_POST_GRADUATION">
                    Graduation to Post Graduation
                  </option>
                </select>
              </FormField>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="gap_duration_months">
              {(field) => (
                <FormField
                  label="Gap Duration (Months)"
                  htmlFor="gap_duration_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="gap_duration_new"
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.gap_duration_months}
                    placeholder="12"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="gap_reason">
              {(field) => (
                <FormField
                  label="Gap Reason"
                  htmlFor="gap_reason_new"
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="gap_reason_new"
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.gap_reason}
                    placeholder="Enter reason for gap"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Marksheet */}
          <div className="divider">Marksheet (Optional)</div>

          <form.Field name="marksheet_file">
            {(field) => (
              <FormField
                label="Upload Marksheet"
                htmlFor="marksheet_new"
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="marksheet_new"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.marksheet_file}
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
                  Create Record
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

// ==================== SINGLE EDUCATION RECORD FORM ====================
interface EducationRecordFormProps {
  record: EducationalHistoryItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function EducationRecordForm({
  record,
  onSuccess,
  onError,
}: EducationRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);

      const formData = new FormData();
      if (values.board !== null) formData.append("board", values.board);
      if (values.city !== null) formData.append("city", values.city);
      if (values.education_level !== null)
        formData.append("education_level", values.education_level);
      if (values.gap_duration_months !== null)
        formData.append(
          "gap_duration_months",
          values.gap_duration_months.toString(),
        );
      if (values.gap_reason !== null)
        formData.append("gap_reason", values.gap_reason);
      if (values.gap_type !== null) formData.append("gap_type", values.gap_type);
      if (values.institute_name !== null)
        formData.append("institute_name", values.institute_name);
      if (values.result !== null)
        formData.append("result", values.result.toString());
      if (values.result_type !== null)
        formData.append("result_type", values.result_type);
      if (values.subjects !== null) formData.append("subjects", values.subjects);
      if (values.year_of_passing !== null)
        formData.append("year_of_passing", values.year_of_passing.toString());

      if (values.marksheet_file) {
        formData.append("marksheet_file", values.marksheet_file);
      }

      const response = await api.patch(
        `/education-history/${record.id}`,
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
        queryKey: ["education-history", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      board: record.board,
      city: record.city,
      education_level: getValidEducationLevel(record.education_level),
      gap_duration_months: record.gap_duration_months,
      gap_reason: record.gap_reason,
      gap_type: getValidGapType(record.gap_type),
      institute_name: record.institute_name,
      marksheet_file: null,
      result: record.result,
      result_type: getValidResultType(record.result_type),
      subjects: record.subjects,
      year_of_passing: record.year_of_passing,
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
      form.setFieldValue("board", record.board);
      form.setFieldValue("city", record.city);
      form.setFieldValue("education_level", getValidEducationLevel(record.education_level) as any);
      form.setFieldValue("gap_duration_months", record.gap_duration_months);
      form.setFieldValue("gap_reason", record.gap_reason);
      form.setFieldValue("gap_type", getValidGapType(record.gap_type) as any);
      form.setFieldValue("institute_name", record.institute_name);
      form.setFieldValue("marksheet_file", null);
      form.setFieldValue("result", record.result);
      form.setFieldValue("result_type", getValidResultType(record.result_type) as any);
      form.setFieldValue("subjects", record.subjects);
      form.setFieldValue("year_of_passing", record.year_of_passing);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("board", record.board);
    form.setFieldValue("city", record.city);
    form.setFieldValue("education_level", getValidEducationLevel(record.education_level) as any);
    form.setFieldValue("gap_duration_months", record.gap_duration_months);
    form.setFieldValue("gap_reason", record.gap_reason);
    form.setFieldValue("gap_type", getValidGapType(record.gap_type) as any);
    form.setFieldValue("institute_name", record.institute_name);
    form.setFieldValue("marksheet_file", null);
    form.setFieldValue("result", record.result);
    form.setFieldValue("result_type", getValidResultType(record.result_type) as any);
    form.setFieldValue("subjects", record.subjects);
    form.setFieldValue("year_of_passing", record.year_of_passing);
    setIsExpanded(false);
  };

  const educationLevelLabel =
    record.education_level?.replace(/_/g, " ") || "Not Set";

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      {/* Header */}
      <div
        className="card-body cursor-pointer hover:bg-base-200 transition-colors p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{educationLevelLabel}</h4>
            <p className="text-sm opacity-70 mt-1">
              {record.institute_name || "Institute not set"} •{" "}
              {record.year_of_passing || "Year not set"}
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

      {/* Expandable Form - Same structure as Add form but with record ID in htmlFor */}
      {isExpanded && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="card-body pt-0 space-y-6"
        >

          {/* Education Level */}
          <form.Field name="education_level">
            {(field) => (
              <FormField
                label="Education Level"
                htmlFor={`education_level_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id={`education_level_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : e.target.value;
                    field.handleChange(getValidEducationLevel(value) as any);
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.education_level}
                  className="select select-bordered w-full"
                >
                  <option value="">Select level</option>
                  <option value="10TH">10th</option>
                  <option value="12TH">12th</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="GRADUATION">Graduation</option>
                  <option value="POST_GRADUATION">Post Graduation</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>
            )}
          </form.Field>

          {/* Institute Name */}
          <form.Field name="institute_name">
            {(field) => (
              <FormField
                label="Institute Name"
                htmlFor={`institute_name_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`institute_name_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(e.target.value || null)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.institute_name}
                  placeholder="Enter institute name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* City and Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="city">
              {(field) => (
                <FormField
                  label="City"
                  htmlFor={`city_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`city_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.city}
                    placeholder="Enter city"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="board">
              {(field) => (
                <FormField
                  label="Board/University"
                  htmlFor={`board_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`board_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.board}
                    placeholder="Enter board/university"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Year of Passing and Result */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form.Field name="year_of_passing">
              {(field) => (
                <FormField
                  label="Year of Passing"
                  htmlFor={`year_of_passing_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`year_of_passing_${record.id}`}
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.year_of_passing}
                    placeholder="2024"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="result">
              {(field) => (
                <FormField
                  label="Result"
                  htmlFor={`result_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`result_${record.id}`}
                    type="number"
                    step="0.01"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseFloat(e.target.value),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.result}
                    placeholder="85.5"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="result_type">
              {(field) => (
                <FormField
                  label="Result Type"
                  htmlFor={`result_type_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <select
                    id={`result_type_${record.id}`}
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : e.target.value;
                      field.handleChange(getValidResultType(value) as any);
                    }}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.result_type}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select type</option>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="CGPA">CGPA</option>
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Subjects */}
          <form.Field name="subjects">
            {(field) => (
              <FormField
                label="Subjects"
                htmlFor={`subjects_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <textarea
                  id={`subjects_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(e.target.value || null)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.subjects}
                  placeholder="Enter subjects (comma-separated)"
                  rows={2}
                  className="textarea textarea-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Gap Information */}
          <div className="divider">Gap Information</div>

          <form.Field name="gap_type">
            {(field) => (
              <FormField
                label="Gap Type"
                htmlFor={`gap_type_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id={`gap_type_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : e.target.value;
                    field.handleChange(getValidGapType(value) as any);
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.gap_type}
                  className="select select-bordered w-full"
                >
                  <option value="">No gap</option>
                  <option value="12TH_TO_GRADUATION">12th to Graduation</option>
                  <option value="DIPLOMA_TO_GRADUATION">
                    Diploma to Graduation
                  </option>
                  <option value="GRADUATION_TO_POST_GRADUATION">
                    Graduation to Post Graduation
                  </option>
                </select>
              </FormField>
            )}
          </form.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="gap_duration_months">
              {(field) => (
                <FormField
                  label="Gap Duration (Months)"
                  htmlFor={`gap_duration_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`gap_duration_${record.id}`}
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === "" ? null : parseInt(e.target.value, 10),
                      )
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.gap_duration_months}
                    placeholder="12"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="gap_reason">
              {(field) => (
                <FormField
                  label="Gap Reason"
                  htmlFor={`gap_reason_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`gap_reason_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.gap_reason}
                    placeholder="Enter reason for gap"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Marksheet */}
          <div className="divider">Marksheet</div>

          {record.marksheet_file_signed_url && (
            <div className="alert">
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
                  Current marksheet uploaded
                </div>
                <Link
                  href={record.marksheet_file_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View Marksheet
                </Link>
              </div>
            </div>
          )}

          <form.Field name="marksheet_file">
            {(field) => (
              <FormField
                label="Upload New Marksheet"
                htmlFor={`marksheet_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`marksheet_${record.id}`}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.handleChange(file);
                    }
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.marksheet_file}
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
interface EducationalHistoryFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function EducationalHistoryForm({
  userId,
  onSuccess,
  onError,
}: EducationalHistoryFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetEducationalHistoryResponse>(
        `/education-history/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["education-history", userId],
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
          Error loading educational history: {(error as Error)?.message}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Educational History</h2>

      {/* Add New Record Form */}
      <AddEducationRecordForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Existing Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <EducationRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No educational history records found. Add your first record above.
          </div>
        )}
      </div>
    </div>
  );
}
