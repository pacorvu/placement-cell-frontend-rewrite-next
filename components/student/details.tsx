import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const profileDetailsSchema = z.object({
  brief_summary: z.string(),
  career_objective: z.string(),
  created_at: z.string().datetime(),
  dream_company: z.string(),
  dream_package: z.number(),
  hobbies_interests: z.array(z.string()),
  key_expertise: z.string(),
  updated_at: z.string().datetime(),
  user_id: z.number().int(),
  usn: z.string(),
});

const createProfileDetailsRequestSchema = z.object({
  brief_summary: z.string().min(1, "Brief summary is required"),
  career_objective: z.string().min(1, "Career objective is required"),
  dream_company: z.string().min(1, "Dream company is required"),
  dream_package: z.number().positive("Dream package must be greater than 0"),
  hobbies_interests: z.array(z.string()),
  key_expertise: z.string().min(1, "Key expertise is required"),
});

type ProfileDetails = z.infer<typeof profileDetailsSchema>;
type CreateProfileDetailsRequest = z.infer<
  typeof createProfileDetailsRequestSchema
>;

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  brief_summary: true,
  career_objective: true,
  dream_company: true,
  dream_package: true,
  hobbies_interests: true,
  key_expertise: true,
} as const;

// ==================== HELPER COMPONENTS ====================
interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  placeholder: string;
  label?: string;
}

function ArrayInput({
  value,
  onChange,
  disabled,
  placeholder,
}: ArrayInputProps) {
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addItem = () => {
    if (input.trim()) {
      if (editingIndex !== null) {
        const newArray = [...value];
        newArray[editingIndex] = input.trim();
        onChange(newArray);
        setEditingIndex(null);
      } else {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
  };

  const editItem = (index: number) => {
    setInput(value[index]);
    setEditingIndex(index);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const cancelEdit = () => {
    setInput("");
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="p-4 bg-base-200 rounded-lg space-y-4">
        <div>
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
            className="input input-bordered w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addItem}
            disabled={disabled || !input.trim()}
            className="btn btn-primary btn-sm"
          >
            {editingIndex !== null ? "Update" : "Add"}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={disabled}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      {value.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Added Items ({value.length})</p>
          <div className="space-y-3">
            {value.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-base-100 border border-base-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{item}</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => editItem(index)}
                    disabled={disabled}
                    className="btn btn-ghost btn-sm"
                    title="Edit item"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={disabled}
                    className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                    title="Remove item"
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
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div className="p-6 text-center text-sm opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
          No items added yet. Add your first item above.
        </div>
      )}
    </div>
  );
}

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

// ==================== MAIN FORM COMPONENT ====================
interface ProfileDetailsFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function ProfileDetailsForm({
  userId,
  onSuccess,
  onError,
}: ProfileDetailsFormProps) {
  const queryClient = useQueryClient();

  // Fetch existing profile details
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      try {
        const response = await api.get<ProfileDetails>(
          `/profile-details/user/${userId}`,
        );
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    queryKey: ["profile-details", userId],
  });

  // Determine if we're creating or updating
  const isCreating = !data;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (values: CreateProfileDetailsRequest) => {
      console.log(
        isCreating
          ? "=== CREATING PROFILE DETAILS ==="
          : "=== UPDATING PROFILE DETAILS ===",
      );
      console.log("Values:", values);

      const payload = {
        brief_summary: values.brief_summary,
        career_objective: values.career_objective,
        dream_company: values.dream_company,
        dream_package: values.dream_package,
        hobbies_interests: values.hobbies_interests,
        key_expertise: values.key_expertise,
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = isCreating
        ? await api.post(`/profile-details/user/${userId}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        : await api.patch(`/profile-details/user/${userId}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

      console.log("Response:", response.data);
      return response.data;
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      onError?.(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-details", userId],
      });
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      brief_summary: "",
      career_objective: "",
      dream_company: "",
      dream_package: 0,
      hobbies_interests: [],
      key_expertise: "",
    } as CreateProfileDetailsRequest,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await saveMutation.mutateAsync(value);
    },
    validators: {
      onSubmit: createProfileDetailsRequestSchema,
    },
  });

  // Sync form values with fetched data
  useEffect(() => {
    if (data && !form.state.isDirty) {
      form.setFieldValue("brief_summary", data.brief_summary);
      form.setFieldValue("career_objective", data.career_objective);
      form.setFieldValue("dream_company", data.dream_company);
      form.setFieldValue("dream_package", data.dream_package);
      form.setFieldValue("hobbies_interests", data.hobbies_interests || []);
      form.setFieldValue("key_expertise", data.key_expertise);
    }
  }, [data, form]);

  const handleReset = () => {
    if (data) {
      form.setFieldValue("brief_summary", data.brief_summary);
      form.setFieldValue("career_objective", data.career_objective);
      form.setFieldValue("dream_company", data.dream_company);
      form.setFieldValue("dream_package", data.dream_package);
      form.setFieldValue("hobbies_interests", data.hobbies_interests || []);
      form.setFieldValue("key_expertise", data.key_expertise);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError && error) {
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
        <span>Error loading profile details: {(error as Error)?.message}</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 max-w-4xl"
    >
      <div className="card bg-base-100 shadow-xl">
        {/* Header */}
        <div className="card-body">
          <h2 className="card-title text-2xl">Profile Details</h2>
          <p className="text-sm opacity-70">
            {isCreating
              ? "Add your professional profile information"
              : "Update your professional profile information"}
          </p>

          <div className="space-y-4 mt-4">
            {/* Brief Summary */}
            <form.Field
              name="brief_summary"
              validators={{
                onBlur: z.string().min(1, "Brief summary is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Brief Summary"
                  htmlFor="brief_summary"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <textarea
                    id="brief_summary"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.brief_summary}
                    placeholder="Write a brief professional summary about yourself (2-3 sentences)"
                    rows={4}
                    className="textarea textarea-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            {/* Key Expertise */}
            <form.Field
              name="key_expertise"
              validators={{
                onBlur: z.string().min(1, "Key expertise is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Key Expertise"
                  htmlFor="key_expertise"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <textarea
                    id="key_expertise"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.key_expertise}
                    placeholder="Describe your core competencies and areas of expertise"
                    rows={3}
                    className="textarea textarea-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            {/* Career Objective */}
            <form.Field
              name="career_objective"
              validators={{
                onBlur: z.string().min(1, "Career objective is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Career Objective"
                  htmlFor="career_objective"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <textarea
                    id="career_objective"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.career_objective}
                    placeholder="Describe your career goals and aspirations"
                    rows={4}
                    className="textarea textarea-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            {/* Dream Company and Package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="dream_company"
                validators={{
                  onBlur: z.string().min(1, "Dream company is required"),
                }}
              >
                {(field) => (
                  <FormField
                    label="Dream Company"
                    htmlFor="dream_company"
                    required
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="dream_company"
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={!FIELD_PERMISSIONS.dream_company}
                      placeholder="e.g., Google, Microsoft, Amazon"
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="dream_package"
                validators={{
                  onBlur: z
                    .number()
                    .positive("Dream package must be greater than 0"),
                }}
              >
                {(field) => (
                  <FormField
                    label="Dream Package (in LPA)"
                    htmlFor="dream_package"
                    required
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="dream_package"
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                      onBlur={field.handleBlur}
                      disabled={!FIELD_PERMISSIONS.dream_package}
                      placeholder="e.g., 15.5"
                      min="0"
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>
            </div>

            {/* Hobbies & Interests */}
            <form.Field
              name="hobbies_interests"
              validators={{
                onBlur: z.array(z.string()),
              }}
            >
              {(field) => (
                <FormField label="Hobbies & Interests">
                  <ArrayInput
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={!FIELD_PERMISSIONS.hobbies_interests}
                    placeholder="Add a hobby or interest (e.g., Reading, Photography, Gaming)"
                  />
                  <p className="text-xs opacity-70 mt-2">
                    Add your hobbies and personal interests
                  </p>
                </FormField>
              )}
            </form.Field>
          </div>

          {/* Action Buttons */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <div className="flex gap-4 pt-4 border-t border-base-300 mt-6">
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting && (
                    <span className="loading loading-spinner"></span>
                  )}
                  {isCreating ? "Create Profile" : "Save Changes"}
                </button>
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="btn btn-outline"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  );
}
