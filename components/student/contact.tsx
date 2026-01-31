import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";
import Link from "next/link";

// ==================== SCHEMAS ====================
const profileCommunicationSchema = z.object({
  phone_number: z.string(),
  links: z.record(z.string(), z.string()),
  id: z.number().int(),
  usn: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const createProfileCommunicationRequestSchema = z.object({
  phone_number: z.string().min(1, "Phone number is required"),
  links: z.record(z.string(), z.string()),
});

type ProfileCommunication = z.infer<typeof profileCommunicationSchema>;
type CreateProfileCommunicationRequest = z.infer<
  typeof createProfileCommunicationRequestSchema
>;

// ==================== FIELD PERMISSIONS CONFIG ====================
const FIELD_PERMISSIONS = {
  phone_number: true,
  links: true,
} as const;

// ==================== HELPER COMPONENTS ====================
interface LinksInputProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
}

function LinksInput({ value, onChange, disabled }: LinksInputProps) {
  const [linkKey, setLinkKey] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const addLink = () => {
    if (linkKey.trim() && linkValue.trim()) {
      if (linkKey.trim() in value && !editingKey) {
        alert("A link with this name already exists");
        return;
      }
      if (editingKey) {
        const newLinks = { ...value };
        if (editingKey !== linkKey.trim()) {
          delete newLinks[editingKey];
        }
        newLinks[linkKey.trim()] = linkValue.trim();
        onChange(newLinks);
        setEditingKey(null);
      } else {
        onChange({ ...value, [linkKey.trim()]: linkValue.trim() });
      }
      setLinkKey("");
      setLinkValue("");
    }
  };

  const editLink = (key: string) => {
    setLinkKey(key);
    setLinkValue(value[key]);
    setEditingKey(key);
  };

  const removeLink = (key: string) => {
    const newLinks = { ...value };
    delete newLinks[key];
    onChange(newLinks);
  };

  const cancelEdit = () => {
    setLinkKey("");
    setLinkValue("");
    setEditingKey(null);
  };

  const linkEntries = Object.entries(value);

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="p-4 bg-base-200 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium">Link Name</span>
            </label>
            <input
              type="text"
              value={linkKey}
              onChange={(e) => setLinkKey(e.target.value)}
              placeholder="e.g., GitHub, LinkedIn"
              disabled={disabled}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium">Link URL</span>
            </label>
            <input
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="e.g., https://github.com/username"
              disabled={disabled}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addLink}
            disabled={disabled || !linkKey.trim() || !linkValue.trim()}
            className="btn btn-primary btn-sm"
          >
            {editingKey ? "Update Link" : "Add Link"}
          </button>
          {editingKey && (
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

      {/* Links List */}
      {linkEntries.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Added Links ({linkEntries.length})
          </p>
          <div className="space-y-3">
            {linkEntries.map(([key, url]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-base-100 border border-base-300 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-sm font-medium">{key}</div>
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary-focus truncate block"
                  >
                    {url}
                  </Link>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => editLink(key)}
                    disabled={disabled}
                    className="btn btn-ghost btn-sm"
                    title="Edit link"
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
                    onClick={() => removeLink(key)}
                    disabled={disabled}
                    className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                    title="Remove link"
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

      {linkEntries.length === 0 && (
        <div className="p-6 text-center text-sm opacity-70 bg-base-200 rounded-lg border-2 border-dashed border-base-300">
          No links added yet. Add your first link above.
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
interface ProfileCommunicationFormProps {
  userId: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function ProfileCommunicationForm({
  userId,
  onSuccess,
  onError,
}: ProfileCommunicationFormProps) {
  const queryClient = useQueryClient();

  // Fetch existing profile communication
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      try {
        const response = await api.get<ProfileCommunication>(
          `/profile-communication/user/${userId}`,
        );
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    queryKey: ["profile-communication", userId],
  });

  // Determine if we're creating or updating
  const isCreating = !data;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (values: CreateProfileCommunicationRequest) => {
      console.log(
        isCreating
          ? "=== CREATING PROFILE COMMUNICATION ==="
          : "=== UPDATING PROFILE COMMUNICATION ===",
      );
      console.log("Values:", values);

      const payload = {
        phone_number: values.phone_number,
        links: values.links,
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = isCreating
        ? await api.post(`/profile-communication/user/${userId}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        : await api.patch(`/profile-communication/user/${userId}`, payload, {
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
        queryKey: ["profile-communication", userId],
      });
      onSuccess?.();
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      phone_number: "",
      links: {},
    } as CreateProfileCommunicationRequest,
    onSubmit: async ({ value }) => {
      console.log("=== FORM SUBMIT ===");
      console.log("Current form values:", value);
      await saveMutation.mutateAsync(value);
    },
    validators: {
      onSubmit: createProfileCommunicationRequestSchema,
    },
  });

  // Sync form values with fetched data
  useEffect(() => {
    if (data && !form.state.isDirty) {
      form.setFieldValue("phone_number", data.phone_number);
      form.setFieldValue("links", data.links || {});
    }
  }, [data, form]);

  // Reset form to initial data
  const handleReset = () => {
    if (data) {
      form.setFieldValue("phone_number", data.phone_number);
      form.setFieldValue("links", data.links || {});
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
        <span>
          Error loading profile communication: {(error as Error)?.message}
        </span>
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
          <h2 className="card-title text-2xl">Profile Communication</h2>
          <p className="text-sm opacity-70">
            {isCreating
              ? "Add your contact information and social links"
              : "Update your contact information and social links"}
          </p>

          <div className="space-y-4 mt-4">
            {/* Phone Number */}
            <form.Field
              name="phone_number"
              validators={{
                onBlur: z.string().min(1, "Phone number is required"),
              }}
            >
              {(field) => (
                <FormField
                  label="Phone Number"
                  htmlFor="phone_number"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <input
                    id="phone_number"
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={!FIELD_PERMISSIONS.phone_number}
                    placeholder="e.g., +91 9876543210"
                    className="input input-bordered w-full"
                  />
                </FormField>
              )}
            </form.Field>

            {/* Links */}
            <form.Field
              name="links"
              validators={{
                onBlur: z.record(z.string(), z.string()),
              }}
            >
              {(field) => (
                <FormField label="Social Links & Profiles">
                  <LinksInput
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={!FIELD_PERMISSIONS.links}
                  />
                  <p className="text-xs opacity-70 mt-2">
                    Add your social media profiles and other links. Example:
                    Link Name = "GitHub", Link URL = "https://github.com/username"
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
