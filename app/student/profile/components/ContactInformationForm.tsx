"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AxiosError } from "axios";

// Zod schema for validation - now also used for runtime checks
const urlSchema = z.string().url().or(z.literal(""));

const contactInformationSchema = z.object({
  personal_email: z.string().email("Invalid email address").or(z.literal("")),
  links: z.object({
    linkedin: urlSchema,
    portfolio: urlSchema,
    github: urlSchema,
    other: urlSchema,
  }),
});

type ContactInformationData = z.infer<typeof contactInformationSchema>;

interface ContactInformationFormProps {
  isEditing: boolean;
  onSaveComplete?: () => void;
}

export default function ContactInformationForm({
  isEditing,
  onSaveComplete,
}: ContactInformationFormProps) {
  const { user, isLoading } = useUser();

  const [personalEmail, setPersonalEmail] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({
    linkedin: "",
    portfolio: "",
    github: "",
    other: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with user data
  useEffect(() => {
    const profileComm = user?.profile_communication;

    if (profileComm) {
      setPersonalEmail(profileComm.personal_email || "");

      if (profileComm.links && typeof profileComm.links === 'object') {
        setLinks({
          linkedin: (profileComm.links as Record<string, string>).linkedin || "",
          portfolio: (profileComm.links as Record<string, string>).portfolio || "",
          github: (profileComm.links as Record<string, string>).github || "",
          other: (profileComm.links as Record<string, string>).other || "",
        });
      }
    }
  }, [user]);

  const updateLink = (key: string, value: string) => {
    setLinks({ ...links, [key]: value });
    // Clear error for this field
    if (errors[`links.${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`links.${key}`];
      setErrors(newErrors);
    }
  };

  // Use Zod for URL validation
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    return urlSchema.safeParse(url).success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.user_id) {
      toast.error("User ID not found");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data
      const data: ContactInformationData = {
        personal_email: personalEmail,
        links: {
          linkedin: links.linkedin,
          portfolio: links.portfolio,
          github: links.github,
          other: links.other,
        },
      };

      // Validate with Zod
      const validatedData = contactInformationSchema.parse(data);

      // Make PATCH request using axios
      const response = await api.patch(
        `/profile-communication/user/${user.user_id}`,
        validatedData
      );

      toast.success("Contact information updated successfully");

      // Call the callback if provided
      if (onSaveComplete) {
        onSaveComplete();
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        toast.error("Please fix the validation errors");
      } else if (error instanceof AxiosError) {
        // Handle axios errors
        const errorMessage = error.response?.data?.message || error.message || "Failed to update contact information";
        toast.error(errorMessage);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const profileCommunication = user?.profile_communication;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              College Email
            </label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={profileCommunication?.college_email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              College email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Personal Email
            </label>
            <input
              type="email"
              placeholder="personal@email.com"
              value={personalEmail}
              onChange={(e) => {
                setPersonalEmail(e.target.value);
                if (errors.personal_email) {
                  const newErrors = { ...errors };
                  delete newErrors.personal_email;
                  setErrors(newErrors);
                }
              }}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${errors.personal_email ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.personal_email && (
              <p className="text-xs text-red-500 mt-1">{errors.personal_email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Country Code
            </label>
            <input
              type="text"
              placeholder="+91"
              value={profileCommunication?.phone_country_code || "+91"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Country code cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              value={profileCommunication?.phone_number || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Phone number cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Social & Portfolio Links Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social & Portfolio Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={links.linkedin}
              onChange={(e) => updateLink("linkedin", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${errors["links.linkedin"] ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors["links.linkedin"] && (
              <p className="text-xs text-red-500 mt-1">{errors["links.linkedin"]}</p>
            )}
            {links.linkedin && isValidUrl(links.linkedin) && !errors["links.linkedin"] && (
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <i className="material-icons text-sm">open_in_new</i>
                View LinkedIn Profile
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Portfolio Website
            </label>
            <input
              type="url"
              placeholder="https://yourportfolio.com"
              value={links.portfolio}
              onChange={(e) => updateLink("portfolio", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${errors["links.portfolio"] ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors["links.portfolio"] && (
              <p className="text-xs text-red-500 mt-1">{errors["links.portfolio"]}</p>
            )}
            {links.portfolio && isValidUrl(links.portfolio) && !errors["links.portfolio"] && (
              <a
                href={links.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <i className="material-icons text-sm">open_in_new</i>
                Visit Portfolio
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={links.github}
              onChange={(e) => updateLink("github", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${errors["links.github"] ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors["links.github"] && (
              <p className="text-xs text-red-500 mt-1">{errors["links.github"]}</p>
            )}
            {links.github && isValidUrl(links.github) && !errors["links.github"] && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <i className="material-icons text-sm">open_in_new</i>
                View GitHub Profile
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Other Link
            </label>
            <input
              type="url"
              placeholder="https://other-link.com"
              value={links.other}
              onChange={(e) => updateLink("other", e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${errors["links.other"] ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors["links.other"] && (
              <p className="text-xs text-red-500 mt-1">{errors["links.other"]}</p>
            )}
            {links.other && isValidUrl(links.other) && !errors["links.other"] && (
              <a
                href={links.other}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <i className="material-icons text-sm">open_in_new</i>
                View Link
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
}
