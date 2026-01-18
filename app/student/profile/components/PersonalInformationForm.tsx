"use client";

import { useState } from "react";

interface PersonalInformationFormProps {
  isEditing: boolean;
}

export default function PersonalInformationForm({
  isEditing,
}: PersonalInformationFormProps) {
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState("");

  const addLanguage = () => {
    if (languageInput.trim()) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Personal Details</h2>
        {/* + (!isEditing ? "opacity-60 pointer-events-none" : "") */}
        <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 "}>
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            >
              <option>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              disabled={true}
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
              disabled
              placeholder="Add a language"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Academic Identity Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Academic Identity</h2>
        {/* + (!isEditing ? "opacity-60 pointer-events-none" : "") */}
        <div className={"grid grid-cols-1 md:grid-cols-2 gap-4 "}>
          <div>
            <label className="block text-sm font-medium mb-2">
              School Name
            </label>
            <input
              type="text"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Year of Joining
            </label>
            <input
              type="number"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Program</label>
            <input
              type="text"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Specialization
            </label>
            <input
              type="text"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Major</label>
            <input
              type="text"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minor</label>
            <input
              type="text"
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
