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
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [speciallyAbled, setSpeciallyAbled] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [yearOfJoining, setYearOfJoining] = useState<number>(0);
  const [programName, setProgramName] = useState("");
  const [specializationName, setSpecializationName] = useState("");
  const [majorName, setMajorName] = useState("");
  const [minorName, setMinorName] = useState("");

  // Populate form with user data
  useEffect(() => {
    const personalDetails = user?.personal_details;

    if (personalDetails) {
      // Languages
      const langs = personalDetails.languages;
      if (Array.isArray(langs)) {
        setLanguages(langs.filter((l): l is string => Boolean(l && l.trim())));
      }

      // Personal Details
      setGender(personalDetails.gender || "");
      setDateOfBirth(personalDetails.date_of_birth || "");
      setSpeciallyAbled(personalDetails.specially_abled || false);

      // Academic Identity
      setSchoolName(personalDetails.school_name || "");
      setYearOfJoining(personalDetails.year_of_joining || 0);
      setProgramName(personalDetails.program_name || "");
      setSpecializationName(personalDetails.specialization_name || "");
      setMajorName(personalDetails.major_name || "");
      setMinorName(personalDetails.minor_name || "");
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

        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">USN</label>
            <input
              type="text"
              disabled
              value={personalDetails?.usn || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">USN cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              disabled
              value={personalDetails?.full_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              disabled={!isEditing}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
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
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={speciallyAbled}
              onChange={(e) => setSpeciallyAbled(e.target.checked)}
              disabled={!isEditing}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium">Specially Abled</span>
          </label>
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
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. School of Computer Science"
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
              value={yearOfJoining || ""}
              onChange={(e) =>
                setYearOfJoining(e.target.value ? Number(e.target.value) : 0)
              }
              placeholder="e.g. 2021"
              min="2000"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Program</label>
            <input
              type="text"
              disabled={!isEditing}
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. B.Tech, M.Tech"
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
              value={specializationName}
              onChange={(e) => setSpecializationName(e.target.value)}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Major</label>
            <input
              type="text"
              disabled={!isEditing}
              value={majorName}
              onChange={(e) => setMajorName(e.target.value)}
              placeholder="e.g. Artificial Intelligence"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Minor (Optional)
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={minorName}
              onChange={(e) => setMinorName(e.target.value)}
              placeholder="e.g. Data Science"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
