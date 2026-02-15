import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { api } from "@/lib/api";
import { getFieldError } from "@/lib/form-helper";

// ==================== SCHEMAS ====================
const getPersonalDetailsResponseSchema = z.object({
  created_at: z.string().datetime(),
  date_of_birth: z.string().date().nullable(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  languages: z.array(z.string()).nullable(),
  major_name: z.string().nullable(),
  minor_name: z.string().nullable(),
  personal_email: z.string().email().nullable(),
  profile_image: z.string().nullable(),
  profile_image_signed_url: z.string().nullable(),
  program_name: z.string().nullable(),
  school_name: z.string().nullable(),
  specialization_name: z.string().nullable(),
  specially_abled: z.boolean().nullable(),
  updated_at: z.string().datetime(),
  user_id: z.number(),
  usn: z.string(),
  verification_type: z.string().nullable(),
  year_of_joining: z.number().nullable(),
});

const updatePersonalDetailsRequestSchema = z.object({
  date_of_birth: z.string().date().nullable(),
  full_name: z.string().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  languages: z.array(z.string()).nullable(),
  major_id: z.number().int().nullable(),
  minor_id: z.number().int().nullable(),
  personal_email: z.string().email().nullable().or(z.literal("")),
  profile_image: z.string().nullable(),
  program_id: z.number().int().nullable(),
  school_id: z.number().int().nullable(),
  specialization_id: z.number().int().nullable(),
  specially_abled: z.boolean().nullable(),
  verification_type: z.string().nullable(),
  year_of_joining: z.number().int().nullable(),
});

const resourcesEnumSchema = z.object({
  majors: z.object({
    mapping: z.record(z.string(), z.string()),
    total: z.number(),
  }),
  minors: z.object({
    mapping: z.record(z.string(), z.string()),
    total: z.number(),
  }),
  specializations: z.object({
    mapping: z.record(z.string(), z.string()),
    total: z.number(),
  }),
  schools: z.object({
    mapping: z.record(z.string(), z.string()),
    total: z.number(),
  }),
  programs: z.object({
    mapping: z.record(z.string(), z.string()),
    total: z.number(),
  }),
});

type GetPersonalDetailsResponse = z.infer<
  typeof getPersonalDetailsResponseSchema
>;
type UpdatePersonalDetailsRequest = z.infer<
  typeof updatePersonalDetailsRequestSchema
>;
type ResourcesEnum = z.infer<typeof resourcesEnumSchema>;

// ==================== FIELD PERMISSIONS CONFIG ====================
// Section-level permissions (override individual field permissions)
const SECTION_PERMISSIONS = {
  read_only_section: true,
  personal_information_section: true,
  academic_information_section: true,
  additional_information_section: true,
} as const;

// Individual field permissions (overridden by section permissions)
const FIELD_PERMISSIONS = {
  date_of_birth: true,
  full_name: true,
  gender: true,
  languages: true,
  major_id: true,
  minor_id: true,
  personal_email: true,
  profile_image: true,
  program_id: true,
  school_id: true,
  specialization_id: true,
  specially_abled: true,
  verification_type: true,
  year_of_joining: true,
} as const;

// Helper to check if a field is editable (section permission AND field permission)
const isFieldEditable = (
  sectionKey: keyof typeof SECTION_PERMISSIONS,
  fieldKey: keyof typeof FIELD_PERMISSIONS
): boolean => {
  return SECTION_PERMISSIONS[sectionKey] && FIELD_PERMISSIONS[fieldKey];
};

// ==================== COMPONENT ====================
interface PersonalDetailsFormProps {
  userId: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Helper function to find ID from name in mapping
function findIdByName(mapping: Record<string, string>, name: string | null): number | null {
  if (!name) return null;
  const entry = Object.entries(mapping).find(([_, value]) => value === name);
  return entry ? parseInt(entry[0]) : null;
}

export default function PersonalDetailsForm({
  userId,
  onSuccess,
  onError,
}: PersonalDetailsFormProps) {
  const queryClient = useQueryClient();
  const [languageInput, setLanguageInput] = useState("");

  // Fetch personal details
  const { data, isLoading, isError, error } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      const response = await api.get<GetPersonalDetailsResponse>(
        `/students/personal-details/user/${userId}`,
      );
      return response.data;
    },
    queryKey: ["personal-details", userId],
  });

  // Fetch resources enum
  const { data: resourcesData } = useQuery({
    queryKey: ["resources-enum"],
    queryFn: async () => {
      const response = await api.get<ResourcesEnum>("/placements/resources-enum");
      return resourcesEnumSchema.parse(response.data);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: UpdatePersonalDetailsRequest) => {
      const response = await api.patch(
        `/students/personal-details/user/${userId}`,
        {
          ...values,
          profile_image: null,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onError: (error: any) => {
      onError?.(error);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["personal-details", userId] });
      onSuccess?.(data);
    },
  });

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      date_of_birth: null,
      full_name: null,
      gender: null,
      languages: null,
      major_id: null,
      minor_id: null,
      personal_email: null,
      profile_image: null,
      program_id: null,
      school_id: null,
      specialization_id: null,
      specially_abled: null,
      verification_type: null,
      year_of_joining: null,
    } as UpdatePersonalDetailsRequest,
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value);
    },
    validators: {
      onBlur: updatePersonalDetailsRequestSchema,
    },
  });

  // Initialize form values when data loads
  useEffect(() => {
    if (data && resourcesData && !form.state.isDirty) {
      form.setFieldValue("date_of_birth", data.date_of_birth);
      form.setFieldValue("full_name", data.full_name);
      form.setFieldValue("gender", data.gender);
      form.setFieldValue("languages", data.languages);
      form.setFieldValue("personal_email", data.personal_email);
      form.setFieldValue("specially_abled", data.specially_abled);
      form.setFieldValue("verification_type", data.verification_type);
      form.setFieldValue("year_of_joining", data.year_of_joining);

      // Map names to IDs using resources enum
      form.setFieldValue("school_id", findIdByName(resourcesData.schools.mapping, data.school_name));
      form.setFieldValue("program_id", findIdByName(resourcesData.programs.mapping, data.program_name));
      form.setFieldValue("specialization_id", findIdByName(resourcesData.specializations.mapping, data.specialization_name));
      form.setFieldValue("major_id", findIdByName(resourcesData.majors.mapping, data.major_name));
      form.setFieldValue("minor_id", findIdByName(resourcesData.minors.mapping, data.minor_name));
    }
  }, [data, resourcesData, form]);

  // Reset form to initial data
  const handleReset = () => {
    if (data && resourcesData) {
      form.setFieldValue("date_of_birth", data.date_of_birth);
      form.setFieldValue("full_name", data.full_name);
      form.setFieldValue("gender", data.gender);
      form.setFieldValue("languages", data.languages);
      form.setFieldValue("personal_email", data.personal_email);
      form.setFieldValue("specially_abled", data.specially_abled);
      form.setFieldValue("verification_type", data.verification_type);
      form.setFieldValue("year_of_joining", data.year_of_joining);

      // Map names to IDs using resources enum
      form.setFieldValue("school_id", findIdByName(resourcesData.schools.mapping, data.school_name));
      form.setFieldValue("program_id", findIdByName(resourcesData.programs.mapping, data.program_name));
      form.setFieldValue("specialization_id", findIdByName(resourcesData.specializations.mapping, data.specialization_name));
      form.setFieldValue("major_id", findIdByName(resourcesData.majors.mapping, data.major_name));
      form.setFieldValue("minor_id", findIdByName(resourcesData.minors.mapping, data.minor_name));
    }
  };

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
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error loading personal details: {(error as Error)?.message}</span>
      </div>
    );
  }

  if (!resourcesData) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
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
      className="space-y-6 max-w-4xl"
    >
      {/* Read-only Section */}
      {SECTION_PERMISSIONS.read_only_section && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-sm font-semibold uppercase tracking-wide opacity-70">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Email" value={data?.email} />
              <ReadOnlyField label="USN" value={data?.usn} />
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      {SECTION_PERMISSIONS.personal_information_section && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Personal Information</h2>

            <div className="space-y-4">
              {/* Full Name */}
              <form.Field
                name="full_name"
                validators={{
                  onBlur: z.string().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Full Name"
                    htmlFor="full_name"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="full_name"
                      type="text"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value || null)}
                      onBlur={field.handleBlur}
                      disabled={!isFieldEditable("personal_information_section", "full_name")}
                      placeholder="Enter full name"
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>

              {/* Gender */}
              <form.Field
                name="gender"
                validators={{
                  onBlur: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Gender"
                    htmlFor="gender"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="gender"
                      value={field.state.value ?? ""}
                      onChange={(e) =>
                        field.handleChange(e.target.value === "" ? null : (e.target.value as any))
                      }
                      disabled={!isFieldEditable("personal_information_section", "gender")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>
                )}
              </form.Field>

              {/* Date of Birth */}
              <form.Field
                name="date_of_birth"
                validators={{
                  onBlur: z.string().date().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Date of Birth"
                    htmlFor="date_of_birth"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="date_of_birth"
                      type="date"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value || null)}
                      onBlur={field.handleBlur}
                      disabled={!isFieldEditable("personal_information_section", "date_of_birth")}
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>

              {/* Personal Email */}
              <form.Field
                name="personal_email"
                validators={{
                  onBlur: z.string().email().nullable().or(z.literal("")),
                }}
              >
                {(field) => (
                  <FormField
                    label="Personal Email"
                    htmlFor="personal_email"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="personal_email"
                      type="email"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value || null)}
                      onBlur={field.handleBlur}
                      disabled={!isFieldEditable("personal_information_section", "personal_email")}
                      placeholder="personal@example.com"
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>

              {/* Year of Joining */}
              <form.Field
                name="year_of_joining"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Year of Joining"
                    htmlFor="year_of_joining"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <input
                      id="year_of_joining"
                      type="number"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val =
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      onBlur={field.handleBlur}
                      disabled={!isFieldEditable("personal_information_section", "year_of_joining")}
                      placeholder="2024"
                      className="input input-bordered w-full"
                    />
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>
        </div>
      )}

      {/* Academic Information Section */}
      {SECTION_PERMISSIONS.academic_information_section && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Academic Information</h2>

            {/* Current Values Display */}
            {/* <div className="alert alert-info mb-4"> */}
            {/*   <div className="flex flex-col gap-1 text-sm"> */}
            {/*     <div><span className="font-semibold">Current School:</span> {data?.school_name || "Not set"}</div> */}
            {/*     <div><span className="font-semibold">Current Program:</span> {data?.program_name || "Not set"}</div> */}
            {/*     <div><span className="font-semibold">Current Specialization:</span> {data?.specialization_name || "Not set"}</div> */}
            {/*     <div><span className="font-semibold">Current Major:</span> {data?.major_name || "Not set"}</div> */}
            {/*     <div><span className="font-semibold">Current Minor:</span> {data?.minor_name || "Not set"}</div> */}
            {/*   </div> */}
            {/* </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School */}
              <form.Field
                name="school_id"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="School"
                    htmlFor="school_id"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="school_id"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      disabled={!isFieldEditable("academic_information_section", "school_id")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select School</option>
                      {resourcesData &&
                        Object.entries(resourcesData.schools.mapping).map(
                          ([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          )
                        )}
                    </select>
                  </FormField>
                )}
              </form.Field>

              {/* Program */}
              <form.Field
                name="program_id"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Program"
                    htmlFor="program_id"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="program_id"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      disabled={!isFieldEditable("academic_information_section", "program_id")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Program</option>
                      {resourcesData &&
                        Object.entries(resourcesData.programs.mapping).map(
                          ([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          )
                        )}
                    </select>
                  </FormField>
                )}
              </form.Field>

              {/* Specialization */}
              <form.Field
                name="specialization_id"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Specialization"
                    htmlFor="specialization_id"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="specialization_id"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      disabled={!isFieldEditable("academic_information_section", "specialization_id")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Specialization</option>
                      {resourcesData &&
                        Object.entries(resourcesData.specializations.mapping).map(
                          ([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          )
                        )}
                    </select>
                  </FormField>
                )}
              </form.Field>

              {/* Major */}
              <form.Field
                name="major_id"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Major"
                    htmlFor="major_id"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="major_id"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      disabled={!isFieldEditable("academic_information_section", "major_id")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Major</option>
                      {resourcesData &&
                        Object.entries(resourcesData.majors.mapping).map(
                          ([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          )
                        )}
                    </select>
                  </FormField>
                )}
              </form.Field>

              {/* Minor */}
              <form.Field
                name="minor_id"
                validators={{
                  onBlur: z.number().int().nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Minor"
                    htmlFor="minor_id"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <select
                      id="minor_id"
                      value={field.state.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                        field.handleChange(val);
                      }}
                      disabled={!isFieldEditable("academic_information_section", "minor_id")}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Minor</option>
                      {resourcesData &&
                        Object.entries(resourcesData.minors.mapping).map(
                          ([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          )
                        )}
                    </select>
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information Section */}
      {SECTION_PERMISSIONS.additional_information_section && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Additional Information</h2>

            <div className="space-y-4">
              {/* Specially Abled */}
              <form.Field
                name="specially_abled"
                validators={{
                  onBlur: z.boolean().nullable(),
                }}
              >
                {(field) => (
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        id="specially_abled"
                        checked={field.state.value ?? false}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        disabled={!isFieldEditable("additional_information_section", "specially_abled")}
                        className="checkbox"
                      />
                      <span className="label-text">Specially Abled</span>
                    </label>
                  </div>
                )}
              </form.Field>

              {/* Languages */}
              <form.Field
                name="languages"
                validators={{
                  onBlur: z.array(z.string()).nullable(),
                }}
              >
                {(field) => (
                  <FormField
                    label="Languages"
                    error={getFieldError(field.state.meta.errors)}
                  >
                    <LanguagesInput
                      value={field.state.value ?? []}
                      onChange={field.handleChange}
                      disabled={!isFieldEditable("additional_information_section", "languages")}
                      languageInput={languageInput}
                      setLanguageInput={setLanguageInput}
                    />
                  </FormField>
                )}
              </form.Field>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting && <span className="loading loading-spinner"></span>}
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Reset
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}

// ==================== HELPER COMPONENTS ====================
interface ReadOnlyFieldProps {
  label: string;
  value: string | number | undefined;
  className?: string;
}

function ReadOnlyField({ label, value, className }: ReadOnlyFieldProps) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        type="text"
        value={value || ""}
        disabled
        className="input input-bordered bg-base-200"
      />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="form-control">
      <label htmlFor={htmlFor} className="label">
        <span className="label-text">{label}</span>
      </label>
      {children}
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

interface LanguagesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  languageInput: string;
  setLanguageInput: (value: string) => void;
}

function LanguagesInput({
  value,
  onChange,
  disabled,
  languageInput,
  setLanguageInput,
}: LanguagesInputProps) {
  const addLanguage = () => {
    if (languageInput.trim()) {
      onChange([...value, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={languageInput}
          onChange={(e) => setLanguageInput(e.target.value)}
          placeholder="Add a language"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLanguage();
            }
          }}
          className="input input-bordered flex-1"
        />
        <button
          type="button"
          onClick={addLanguage}
          disabled={disabled}
          className="btn btn-primary"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((lang, index) => (
          <div key={index} className="badge badge-secondary gap-2 p-4">
            <span>{lang}</span>
            <button
              type="button"
              onClick={() => removeLanguage(index)}
              disabled={disabled}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label={`Remove ${lang}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
