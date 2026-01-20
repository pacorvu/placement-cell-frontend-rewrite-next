"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface CareerOverviewFormProps {
  isEditing: boolean;
}

export default function CareerOverviewForm({
  isEditing,
}: CareerOverviewFormProps) {
  const { user, isLoading } = useUser();

  const [hobbies, setHobbies] = useState<string[]>([]);
  const [hobbyInput, setHobbyInput] = useState("");

  // Populate form with user data
  useEffect(() => {
    const userHobbies = user?.profile_details?.hobbies_interests;

    if (Array.isArray(userHobbies)) {
      // Filter out null/empty strings
      setHobbies(userHobbies.filter((h): h is string => Boolean(h && h.trim())));
    } else {
      setHobbies([]);
    }
  }, [user]);

  const addHobby = () => {
    if (hobbyInput.trim()) {
      setHobbies([...hobbies, hobbyInput.trim()]);
      setHobbyInput("");
    }
  };

  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const profileDetails = user?.profile_details;

  return (
    <div className="space-y-8">
      {/* Career Objectives Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Career Objectives</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Brief Profile Summary
          </label>
          <textarea
            disabled={!isEditing}
            value={profileDetails?.brief_summary || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
            placeholder="Write a brief summary about yourself..."
            rows={4}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Key Expertise (Comma separated)
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={profileDetails?.key_expertise || ""}
            placeholder="e.g. React, Node.js, Python"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: React, Node.js, Python
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Career Objective
          </label>
          <textarea
            disabled={!isEditing}
            value={profileDetails?.career_objective || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
            placeholder="Describe your career goals and aspirations..."
            rows={5}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Hobbies & Interests
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hobbyInput}
              disabled={!isEditing}
              placeholder="Add a hobby or interest"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
              onChange={(e) => setHobbyInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHobby();
                }
              }}
            />
            <button
              type="button"
              onClick={addHobby}
              disabled={!isEditing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {hobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {hobbies.map((hobby, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  <span>{hobby}</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeHobby(index)}
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

      {/* Aspirations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Aspirations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Dream Company
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={profileDetails?.dream_company || ""}
              placeholder="e.g. Google, Microsoft, Amazon"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Expected / Dream Package (LPA)
            </label>
            <input
              type="number"
              disabled={!isEditing}
              value={profileDetails?.dream_package || ""}
              placeholder="e.g. 12"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
