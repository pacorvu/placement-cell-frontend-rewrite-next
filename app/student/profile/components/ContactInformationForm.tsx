"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface ContactInformationFormProps {
  isEditing: boolean;
}

export default function ContactInformationForm({
  isEditing,
}: ContactInformationFormProps) {
  const { user, isLoading } = useUser();

  const [personalEmail, setPersonalEmail] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({
    linkedin: "",
    portfolio: "",
    github: "",
    other: "",
  });

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
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
    <div className="space-y-8">
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
              onChange={(e) => setPersonalEmail(e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            {links.linkedin && isValidUrl(links.linkedin) && (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            {links.portfolio && isValidUrl(links.portfolio) && (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            {links.github && isValidUrl(links.github) && (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            {links.other && isValidUrl(links.other) && (
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
    </div>
  );
}
