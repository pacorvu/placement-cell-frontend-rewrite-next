import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";
import { is404Error, EmptyState } from "./all.formUI";

// ==================== SCHEMAS ====================
const otherExperienceItemSchema = z.object({
  created_at: z.string().datetime(),
  description: z.string(),
  end_date: z.string(),
  id: z.number().int(),
  location: z.string(),
  organization: z.string(),
  proof_document: z.string(),
  proof_document_signed_url: z.string(),
  skills: z.array(z.string()),
  start_date: z.string(),
  title: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const getOtherExperiencesResponseSchema = z.array(otherExperienceItemSchema);

type OtherExperienceItem = z.infer<typeof otherExperienceItemSchema>;
type GetOtherExperiencesResponse = z.infer<
  typeof getOtherExperiencesResponseSchema
>;

// Form values type for create
type CreateFormValues = {
  title: string;
  organization: string | null;
  start_month: string | null;
  start_year: string | null;
  end_month: string | null;
  end_year: string | null;
  location: string | null;
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// Form values type for update
type UpdateFormValues = {
  title: string | null;
  organization: string | null;
  start_month: string | null;
  start_year: string | null;
  end_month: string | null;
  end_year: string | null;
  location: string | null;
  skills: string[];
  description: string | null;
  proof_document: File | null;
};

// ==================== CONSTANTS ====================
const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2000 + 2 }, (_, i) => {
  const year = currentYear + 1 - i;
  return { value: year.toString(), label: year.toString() };
});

const LOCATIONS = [
  "Bangalore, India",
  "Delhi, India",
  "Mumbai, India",
  "Chennai, India",
  "Hyderabad, India",
  "Pune, India",
  "Kolkata, India",
  "Ahmedabad, India",
  "Jaipur, India",
  "Mysore, India",
  "Remote",
  "Other",
];

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  description: true,
  end_date: true,
  location: true,
  organization: true,
  proof_document: true,
  skills: true,
  start_date: true,
  title: true,
} as const;

// ==================== DATE HELPERS ====================
// Convert "YYYY-MM-DD" or "YYYY-MM" to { month, year }
function parseDateString(dateStr: string | null): {
  month: string | null;
  year: string | null;
} {
  if (!dateStr) return { month: null, year: null };
  const parts = dateStr.split("-");
  return {
    year: parts[0] || null,
    month: parts[1] || null,
  };
}

// Build "YYYY-MM-DD" (day defaults to 01) from month + year selects
function buildDateString(
  month: string | null,
  year: string | null,
): string | null {
  if (!month && !year) return null;
  const y = year || new Date().getFullYear().toString();
  const m = month || "01";
  return `${y}-${m}-01`;
}

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
          placeholder="Add a skill (e.g., Research, Public Speaking)"
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

// Month + Year select pair
interface MonthYearSelectProps {
  monthValue: string | null;
  yearValue: string | null;
  onMonthChange: (value: string | null) => void;
  onYearChange: (value: string | null) => void;
  disabled: boolean;
  idPrefix: string;
}

function MonthYearSelect({
  monthValue,
  yearValue,
  onMonthChange,
  onYearChange,
  disabled,
  idPrefix,
}: MonthYearSelectProps) {
  return (
    <div className="flex gap-2">
      <select
        id={`${idPrefix}_month`}
        value={monthValue ?? ""}
        onChange={(e) => onMonthChange(e.target.value || null)}
        disabled={disabled}
        className="select select-bordered flex-1"
      >
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        id={`${idPrefix}_year`}
        value={yearValue ?? ""}
        onChange={(e) => onYearChange(e.target.value || null)}
        disabled={disabled}
        className="select select-bordered w-28"
      >
        <option value="">Year</option>
        {YEARS.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ==================== ADD NEW EXPERIENCE FORM ====================
interface AddOtherExperienceFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddOtherExperienceForm({
  userId,
  onSuccess,
  onError,
}: AddOtherExperienceFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      const formData = new FormData();
      formData.append("user_id", userId.toString());
      formData.append("title", values.title);

      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.location !== null)
        formData.append("location", values.location);
      if (values.description !== null)
        formData.append("description", values.description);

      const startDate = buildDateString(values.start_month, values.start_year);
      const endDate = buildDateString(values.end_month, values.end_year);
      if (startDate) formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }
      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.post(`/other-experiences/user`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["other-experiences", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      organization: null,
      start_month: null,
      start_year: null,
      end_month: null,
      end_year: null,
      location: null,
      skills: [],
      description: null,
      proof_document: null,
    } as CreateFormValues,
    onSubmit: async ({ value }) => {
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
            Add Other Experience
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add a new experience (research, competitions, etc.)
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
            className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                label="Experience Title"
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
                  placeholder="e.g., Research Assistant, Hackathon Winner"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Organization and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., University Lab, Competition"
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
                  <select
                    id="location_new"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.location}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Start Date">
              <form.Field name="start_month">
                {(monthField) => (
                  <form.Field name="start_year">
                    {(yearField) => (
                      <MonthYearSelect
                        monthValue={monthField.state.value}
                        yearValue={yearField.state.value}
                        onMonthChange={(v) => monthField.handleChange(v)}
                        onYearChange={(v) => yearField.handleChange(v)}
                        disabled={!FIELD_PERMISSIONS.start_date}
                        idPrefix="start_new"
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
            </FormField>

            {/* End Date */}
            <FormField label="End Date">
              <form.Field name="end_month">
                {(monthField) => (
                  <form.Field name="end_year">
                    {(yearField) => (
                      <MonthYearSelect
                        monthValue={monthField.state.value}
                        yearValue={yearField.state.value}
                        onMonthChange={(v) => monthField.handleChange(v)}
                        onYearChange={(v) => yearField.handleChange(v)}
                        disabled={!FIELD_PERMISSIONS.end_date}
                        idPrefix="end_new"
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
            </FormField>
          </div>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Gained"
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
                  placeholder="Describe your experience, responsibilities, and achievements"
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
                    if (file) field.handleChange(file);
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
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting && (
                    <span className="loading loading-spinner"></span>
                  )}
                  Add Experience
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

// ==================== SINGLE EXPERIENCE RECORD FORM ====================
interface OtherExperienceRecordFormProps {
  record: OtherExperienceItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function OtherExperienceRecordForm({
  record,
  onSuccess,
  onError,
}: OtherExperienceRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  const startParsed = parseDateString(record.start_date);
  const endParsed = parseDateString(record.end_date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/other-experiences/${record.id}`);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      setShowDeleteConfirm(false);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["other-experiences", record.user_id],
      });
      onSuccess?.();
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateFormValues) => {
      const formData = new FormData();
      if (values.title !== null) formData.append("title", values.title);
      if (values.organization !== null)
        formData.append("organization", values.organization);
      if (values.location !== null)
        formData.append("location", values.location);
      if (values.description !== null)
        formData.append("description", values.description);

      const startDate = buildDateString(values.start_month, values.start_year);
      const endDate = buildDateString(values.end_month, values.end_year);
      if (startDate) formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);

      if (values.skills.length > 0) {
        formData.append("skills", values.skills.join(","));
      }
      if (values.proof_document) {
        formData.append("proof_document", values.proof_document);
      }

      const response = await api.patch(
        `/other-experiences/${record.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
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
        queryKey: ["other-experiences", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      title: record.title,
      organization: record.organization,
      start_month: startParsed.month,
      start_year: startParsed.year,
      end_month: endParsed.month,
      end_year: endParsed.year,
      location: record.location,
      skills: record.skills || [],
      description: record.description,
      proof_document: null,
    } as UpdateFormValues,
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (!form.state.isDirty) {
      const sp = parseDateString(record.start_date);
      const ep = parseDateString(record.end_date);
      form.setFieldValue("title", record.title);
      form.setFieldValue("organization", record.organization);
      form.setFieldValue("start_month", sp.month);
      form.setFieldValue("start_year", sp.year);
      form.setFieldValue("end_month", ep.month);
      form.setFieldValue("end_year", ep.year);
      form.setFieldValue("location", record.location);
      form.setFieldValue("skills", record.skills || []);
      form.setFieldValue("description", record.description);
      form.setFieldValue("proof_document", null);
    }
  }, [record, form]);

  const handleReset = () => {
    const sp = parseDateString(record.start_date);
    const ep = parseDateString(record.end_date);
    form.setFieldValue("title", record.title);
    form.setFieldValue("organization", record.organization);
    form.setFieldValue("start_month", sp.month);
    form.setFieldValue("start_year", sp.year);
    form.setFieldValue("end_month", ep.month);
    form.setFieldValue("end_year", ep.year);
    form.setFieldValue("location", record.location);
    form.setFieldValue("skills", record.skills || []);
    form.setFieldValue("description", record.description);
    form.setFieldValue("proof_document", null);
    setIsExpanded(false);
  };

  // Formatted date range for header
  const getDateRange = () => {
    const fmt = (dateStr: string | null) => {
      if (!dateStr) return null;
      const p = parseDateString(dateStr);
      if (!p.month || !p.year) return null;
      const monthName = MONTHS.find((m) => m.value === p.month)?.label?.slice(0, 3);
      return `${monthName} ${p.year}`;
    };
    const s = fmt(record.start_date);
    const e = fmt(record.end_date);
    if (s && e) return `${s} - ${e}`;
    if (s) return `From ${s}`;
    if (e) return `Until ${e}`;
    return null;
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
              {record.organization || "No organization"} •{" "}
              {record.location || "Location not specified"}
            </p>
            {getDateRange() && (
              <p className="text-sm opacity-50 mt-0.5">{getDateRange()}</p>
            )}
            {record.proof_document_signed_url && (
              <Link
                href={record.proof_document_signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-sm mt-1 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                View Document →
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
              className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
        {/* Skills in header */}
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
                label="Experience Title"
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
                  placeholder="e.g., Research Assistant, Hackathon Winner"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Organization and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., University Lab, Competition"
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
                  <select
                    id={`location_${record.id}`}
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.location}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Start Date">
              <form.Field name="start_month">
                {(monthField) => (
                  <form.Field name="start_year">
                    {(yearField) => (
                      <MonthYearSelect
                        monthValue={monthField.state.value}
                        yearValue={yearField.state.value}
                        onMonthChange={(v) => monthField.handleChange(v)}
                        onYearChange={(v) => yearField.handleChange(v)}
                        disabled={!FIELD_PERMISSIONS.start_date}
                        idPrefix={`start_${record.id}`}
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
            </FormField>

            <FormField label="End Date">
              <form.Field name="end_month">
                {(monthField) => (
                  <form.Field name="end_year">
                    {(yearField) => (
                      <MonthYearSelect
                        monthValue={monthField.state.value}
                        yearValue={yearField.state.value}
                        onMonthChange={(v) => monthField.handleChange(v)}
                        onYearChange={(v) => yearField.handleChange(v)}
                        disabled={!FIELD_PERMISSIONS.end_date}
                        idPrefix={`end_${record.id}`}
                      />
                    )}
                  </form.Field>
                )}
              </form.Field>
            </FormField>
          </div>

          {/* Skills */}
          <form.Field name="skills">
            {(field) => (
              <FormField
                label="Skills Gained"
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
                  placeholder="Describe your experience, responsibilities, and achievements"
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
                />
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
                    if (file) field.handleChange(file);
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
                      Delete Publication
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
interface OtherExperiencesFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function OtherExperiencesForm({
  userId,
  onSuccess,
  onError,
}: OtherExperiencesFormProps) {
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetOtherExperiencesResponse>(
        `/other-experiences/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["other-experiences", userId],
  });
  if (is404Error(error)) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <AddOtherExperienceForm userId={userId} onSuccess={onSuccess} onError={onError} />
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
        <span>
          Error loading other experiences: {(error as Error)?.message}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Other Experiences</h2>

      <AddOtherExperienceForm
        userId={userId}
        onSuccess={onSuccess}
        onError={onError}
      />

      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <OtherExperienceRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No other experiences found. Add your first experience above.
          </div>
        )}
      </div>
    </div>
  );
}
