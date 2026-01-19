"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  city: string;
  startYear: string;
  endYear: string;
  grade: string;
  subjects: string;
}

interface EducationHistoryFormProps {
  isEditing: boolean;
}

export default function EducationHistoryForm({ isEditing }: EducationHistoryFormProps) {
  const { user, isLoading } = useUser();

  const [educations, setEducations] = useState<Education[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    city: "",
    startYear: "",
    endYear: "",
    grade: "",
    subjects: "",
  });

  // Populate educations from cached user data
  useEffect(() => {
    if (user?.education_history && user.education_history.length > 0) {
      const mappedEducations = user.education_history.map((edu, index) => ({
        id: index + 1,
        institution: edu.institute_name,
        degree: edu.education_level,
        field: edu.board,
        city: edu.city,
        startYear: edu.year_of_passing ? String(edu.year_of_passing - 1) : "", // Approximate start year
        endYear: edu.year_of_passing ? String(edu.year_of_passing) : "",
        grade: `${edu.result} ${edu.result_type}`,
        subjects: edu.subjects,
      }));
      setEducations(mappedEducations);
    }
  }, [user]);

  const handleAddEducation = () => {
    if (formData.institution && formData.degree) {
      setEducations([
        ...educations,
        {
          id: Date.now(),
          ...formData,
        },
      ]);
      setFormData({
        institution: "",
        degree: "",
        field: "",
        city: "",
        startYear: "",
        endYear: "",
        grade: "",
        subjects: "",
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteEducation = (id: number) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading education history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-base-content">
            Education History
          </h2>
        </div>

        {/* Existing Education List */}
        {educations.length > 0 && (
          <div className="space-y-4 mb-6">
            {educations.map((edu) => (
              <div
                key={edu.id}
                className="card bg-base-200 border border-base-300"
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{edu.degree}</h3>
                      <p className="text-base-content/80">
                        {edu.institution}
                        {edu.city && `, ${edu.city}`}
                      </p>
                      <p className="text-base-content/60 text-sm">
                        {edu.field} • {edu.startYear || "N/A"} - {edu.endYear}
                      </p>
                      {edu.subjects && (
                        <p className="text-base-content/60 text-sm">
                          Subjects: {edu.subjects}
                        </p>
                      )}
                      <p className="text-base-content/60 text-sm">
                        Grade: {edu.grade}
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="btn btn-ghost btn-sm btn-circle text-error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Education Button */}
        {!showAddForm && educations.length === 0 && (
          <div className="text-center py-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-outline btn-primary"
              disabled={!isEditing}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Education
            </button>
          </div>
        )}

        {educations.length > 0 && !showAddForm && isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary btn-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Another
          </button>
        )}

        {/* Add Education Form */}
        {showAddForm && (
          <div className="card bg-base-200 border-2 border-primary">
            <div className="card-body">
              <h3 className="font-bold text-lg mb-4">Add Education</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Institution Name *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RV University"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData({ ...formData, institution: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Education Level *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10th, 12th, Bachelor's, Master's"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({ ...formData, degree: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Board/University
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE, ICSE, VTU"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.field}
                    onChange={(e) =>
                      setFormData({ ...formData, field: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">City</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Grade/Percentage
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8.5 CGPA or 85%"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Year of Passing
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.endYear}
                    onChange={(e) =>
                      setFormData({ ...formData, endYear: e.target.value })
                    }
                    min="1990"
                    max="2035"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium text-base-content/70">
                      Subjects (comma separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Physics, Chemistry"
                    className="input input-bordered bg-base-100 mt-2"
                    value={formData.subjects}
                    onChange={(e) =>
                      setFormData({ ...formData, subjects: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      institution: "",
                      degree: "",
                      field: "",
                      city: "",
                      startYear: "",
                      endYear: "",
                      grade: "",
                      subjects: "",
                    });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEducation}
                  className="btn btn-primary"
                  disabled={!formData.institution || !formData.degree}
                >
                  Add Education
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
