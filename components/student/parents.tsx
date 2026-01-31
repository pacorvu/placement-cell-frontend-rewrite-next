import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const parentItemSchema = z.object({
  created_at: z.string().datetime(),
  email: z.string().email().nullable(),
  id: z.number(),
  name: z.string().nullable(),
  occupation: z.string().nullable(),
  organisation: z.string().nullable(),
  parent_type: z.string().nullable(),
  phone_number: z.string().nullable(),
  updated_at: z.string().datetime(),
  user_id: z.number(),
  usn: z.string(),
});

const getParentDetailsResponseSchema = z.array(parentItemSchema);

const createParentRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  occupation: z.string().min(1, "Occupation is required"),
  organisation: z.string().min(1, "Organisation is required"),
  parent_type: z.string().min(1, "Parent type is required"),
  phone_number: z.string().min(1, "Phone number is required"),
});

const updateParentRequestSchema = z.object({
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  organisation: z.string().nullable().optional(),
  parent_type: z.enum(["Father", "Mother", "Guardian"]).nullable().optional(),
  phone_number: z.string().nullable().optional(),
});

type ParentItem = z.infer<typeof parentItemSchema>;
type GetParentDetailsResponse = z.infer<typeof getParentDetailsResponseSchema>;
type CreateParentRequest = z.infer<typeof createParentRequestSchema>;
type UpdateParentRequest = z.infer<typeof updateParentRequestSchema>;

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  email: true,
  name: true,
  occupation: true,
  organisation: true,
  parent_type: true,
  phone_number: true,
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
      <div className="mt-1">{children}</div>
      {error && (
        <label className="label pt-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

// ==================== ADD NEW PARENT FORM ====================
interface AddParentFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function AddParentForm({ userId, onSuccess, onError }: AddParentFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateParentRequest) => {
      console.log("=== CREATING NEW PARENT/GUARDIAN ===");
      console.log("Values:", values);
      const payload = {
        ...values,
        student_user_id: userId,
      };
      const response = await api.post(`/parent-details/user`, payload);
      console.log("Response:", response.data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parent-details", userId],
      });
      form.reset();
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      occupation: "",
      organisation: "",
      parent_type: "",
      phone_number: "",
    } as CreateParentRequest,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await createMutation.mutateAsync(value);
    },
    validators: {
      onSubmit: createParentRequestSchema,
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
            Add Parent/Guardian Details
          </h4>
          <p className="text-sm opacity-70 mt-1">
            Click to add parent or guardian information
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
          className="p-6 space-y-4 bg-base-100"
        >
          {/* Parent Type */}
          <form.Field
            name="parent_type"
            validators={{
              onBlur: z.string().min(1, "Parent type is required"),
            }}
          >
            {(field) => (
              <FormField
                label="Parent/Guardian Type"
                htmlFor="parent_type_new"
                required
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id="parent_type_new"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.parent_type}
                  className="select select-bordered w-full"
                >
                  <option value="">Select type</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </FormField>
            )}
          </form.Field>

          {/* Name */}
          <form.Field
            name="name"
            validators={{
              onBlur: z.string().min(1, "Name is required"),
            }}
          >
            {(field) => (
              <FormField
                label="Full Name"
                htmlFor="name_new"
                required
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id="name_new"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.name}
                  placeholder="Enter full name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="email"
              validators={{
                onBlur: z.string().email("Invalid email format"),
              }}
            >
              {(field) => (
                <FormField
                  label="Email"
                  htmlFor="email_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="email_new"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.email}
                    placeholder="parent@example.com"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="phone_number"
              validators={{
                onBlur: z.string().min(1, "Phone number is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Phone Number"
                  htmlFor="phone_number_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="phone_number_new"
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.phone_number}
                    placeholder="+91 9876543210"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Occupation and Organisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="occupation"
              validators={{
                onBlur: z.string().min(1, "Occupation is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Occupation"
                  htmlFor="occupation_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="occupation_new"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.occupation}
                    placeholder="e.g., Software Engineer"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="organisation"
              validators={{
                onBlur: z.string().min(1, "Organisation is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Organisation"
                  htmlFor="organisation_new"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="organisation_new"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.organisation}
                    placeholder="Enter company/organisation name"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

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
                  Add Parent/Guardian
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

// ==================== SINGLE PARENT RECORD FORM ====================
interface ParentRecordFormProps {
  record: ParentItem;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}
function ParentRecordForm({
  record,
  onSuccess,
  onError,
}: ParentRecordFormProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdateParentRequest) => {
      console.log("=== SUBMITTING TO API ===");
      console.log("Values:", values);
      const response = await api.patch(
        `/parent-details/parent/${record.user_id}`,
        values,
      );
      console.log("Response:", response.data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["parent-details", record.user_id],
      });
      setIsExpanded(false);
      onSuccess?.();
    },
  });

  // Helper function to validate parent type
  const getValidParentType = (value: string | null): "Father" | "Mother" | "Guardian" | null => {
    if (value === "Father" || value === "Mother" || value === "Guardian") {
      return value;
    }
    return null;
  };

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      email: record.email,
      name: record.name,
      occupation: record.occupation,
      organisation: record.organisation,
      parent_type: getValidParentType(record.parent_type),
      phone_number: record.phone_number,
    } as UpdateParentRequest,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await updateMutation.mutateAsync(value);
    },
    validators: {
      onSubmit: updateParentRequestSchema,
    },
  });

  // Sync form values with record when it changes
  useEffect(() => {
    if (!form.state.isDirty) {
      form.setFieldValue("email", record.email);
      form.setFieldValue("name", record.name);
      form.setFieldValue("occupation", record.occupation);
      form.setFieldValue("organisation", record.organisation);
      form.setFieldValue("parent_type", getValidParentType(record.parent_type) as any);
      form.setFieldValue("phone_number", record.phone_number);
    }
  }, [record, form]);

  const handleReset = () => {
    form.setFieldValue("email", record.email);
    form.setFieldValue("name", record.name);
    form.setFieldValue("occupation", record.occupation);
    form.setFieldValue("organisation", record.organisation);
    form.setFieldValue("parent_type", getValidParentType(record.parent_type) as any);
    form.setFieldValue("phone_number", record.phone_number);
    setIsExpanded(false);
  };

  const parentTypeLabel = record.parent_type || "Not Set";
  const parentIcon = (
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      {/* Header */}
      <div
        className="card-body cursor-pointer hover:bg-base-200 transition-colors p-6"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="opacity-70">{parentIcon}</div>
            <div>
              <h4 className="font-semibold text-lg">{parentTypeLabel}</h4>
              <p className="text-sm opacity-70 mt-1">
                {record.name || "Name not set"} •{" "}
                {record.phone_number || "Phone not set"}
              </p>
            </div>
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
          className="card-body pt-0 space-y-4"
        >
          {/* Parent Type */}
          <form.Field
            name="parent_type"
            validators={{
              onBlur: z
                .enum(["Father", "Mother", "Guardian"])
                .nullable()
                .optional(),
            }}
          >
            {(field) => (
              <FormField
                label="Parent Type"
                htmlFor={`parent_type_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <select
                  id={`parent_type_${record.id}`}
                  value={field.state.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : e.target.value;
                    // Type cast to the enum type
                    field.handleChange(value as "Father" | "Mother" | "Guardian" | null);
                  }}
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.parent_type}
                  className="select select-bordered w-full"
                >
                  <option value="">Select type</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </FormField>
            )}
          </form.Field>

          {/* Name */}
          <form.Field
            name="name"
            validators={{
              onBlur: z.string().nullable().optional(),
            }}
          >
            {(field) => (
              <FormField
                label="Name"
                htmlFor={`name_${record.id}`}
                error={getFieldError(field.state.meta.errors)}
              >
                <input
                  id={`name_${record.id}`}
                  type="text"
                  value={field.state.value ?? ""}
                  onChange={(e) =>
                    field.handleChange(e.target.value || null)
                  }
                  onBlur={field.handleBlur}
                  disabled={!FIELD_PERMISSIONS.name}
                  placeholder="Enter full name"
                  className="input input-bordered w-full"
                />
              </FormField>
            )}
          </form.Field>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="email"
              validators={{
                onBlur: z.string().email().nullable().optional(),
              }}
            >
              {(field) => (
                <FormField
                  label="Email"
                  htmlFor={`email_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`email_${record.id}`}
                    type="email"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.email}
                    placeholder="parent@example.com"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="phone_number"
              validators={{
                onBlur: z.string().nullable().optional(),
              }}
            >
              {(field) => (
                <FormField
                  label="Phone Number"
                  htmlFor={`phone_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`phone_${record.id}`}
                    type="tel"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.phone_number}
                    placeholder="+91 9876543210"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Occupation and Organisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="occupation"
              validators={{
                onBlur: z.string().nullable().optional(),
              }}
            >
              {(field) => (
                <FormField
                  label="Occupation"
                  htmlFor={`occupation_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`occupation_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.occupation}
                    placeholder="e.g., Software Engineer"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="organisation"
              validators={{
                onBlur: z.string().nullable().optional(),
              }}
            >
              {(field) => (
                <FormField
                  label="Organisation"
                  htmlFor={`organisation_${record.id}`}
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id={`organisation_${record.id}`}
                    type="text"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value || null)
                    }
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.organisation}
                    placeholder="Enter company/organisation name"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>
          </div>

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
}// ==================== MAIN COMPONENT ====================
interface ParentDetailsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function ParentDetailsForm({
  userId,
  onSuccess,
  onError,
}: ParentDetailsFormProps) {
  // Fetch parent details
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetParentDetailsResponse>(
        `/parent-details/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["parent-details", userId],
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
        <span>Error loading parent details: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Parent/Guardian Details</h2>

      {/* Add New Parent Form */}
      <AddParentForm userId={userId} onSuccess={onSuccess} onError={onError} />

      {/* Existing Parent Records */}
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((record) => (
            <ParentRecordForm
              key={record.id}
              record={record}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))
        ) : (
          <div className="p-8 text-center opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
            No parent/guardian details found. Add your first record above.
          </div>
        )}
      </div>
    </div>
  );
}
