"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface PersonalInformationFormProps {
  isEditing: boolean;
}

export default function PersonalInformationForm({
  isEditing,
}: PersonalInformationFormProps) {
  const { user, isLoading } = useUser();

  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");

  // Populate form with user data
  useEffect(() => {
    const langs = user?.personal_details?.languages;

    if (Array.isArray(langs)) {
      // Filter out null/empty strings just in case
      setLanguages(langs.filter((l): l is string => Boolean(l && l.trim())));
    } else {
      setLanguages([]);
    }
  }, [user]);

  const addLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const personalDetails = user?.personal_details;

  return (
    <div className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              disabled={!isEditing}
              value={personalDetails?.gender || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              disabled={!isEditing}
              value={personalDetails?.date_of_birth || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Languages Known
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={languageInput}
              disabled={!isEditing}
              placeholder="Add a language"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLanguage();
                }
              }}
            />
            <button
              type="button"
              onClick={addLanguage}
              disabled={!isEditing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  <span>{lang}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Academic Identity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Academic Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              School Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={personalDetails?.school_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Year of Joining
            </label>
            <input
              type="number"
              disabled={!isEditing}
              value={personalDetails?.year_of_joining || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Program</label>
            <input
              type="text"
              disabled={!isEditing}
              value={personalDetails?.program_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Specialization
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={personalDetails?.specialization_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Major</label>
            <input
              type="text"
              disabled={!isEditing}
              value={personalDetails?.major_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minor</label>
            <input
              type="text"
              disabled={!isEditing}
              value={personalDetails?.minor_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
