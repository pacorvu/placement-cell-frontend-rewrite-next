"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Education {
  id: number;
  education_level: string;
  institute_name: string;
  city: string;
  board: string;
  year_of_passing: number;
  result: number;
  result_type: string;
  subjects: string;
  marksheet_file: string;
  gap_type: string;
  gap_duration_months: number;
  gap_reason: string;
}

interface EducationHistoryFormProps {
  isEditing: boolean;
}

export default function EducationHistoryForm({ isEditing }: EducationHistoryFormProps) {
  const { user, isLoading } = useUser();

  const [educations, setEducations] = useState<Education[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Education, "id">>({
    education_level: "",
    institute_name: "",
    city: "",
    board: "",
    year_of_passing: 0,
    result: 0,
    result_type: "PERCENTAGE",
    subjects: "",
    marksheet_file: "",
    gap_type: "",
    gap_duration_months: 0,
    gap_reason: "",
  });

  // Populate educations from user data
  useEffect(() => {
    const eduData = user?.education_history;

    if (Array.isArray(eduData) && eduData.length > 0) {
      const mappedEducations = eduData.map((edu, index) => ({
        id: Date.now() + index,
        education_level: edu.education_level || "",
        institute_name: edu.institute_name || "",
        city: edu.city || "",
        board: edu.board || "",
        year_of_passing: edu.year_of_passing || 0,
        result: edu.result || 0,
        result_type: edu.result_type || "PERCENTAGE",
        subjects: edu.subjects || "",
        marksheet_file: edu.marksheet_file || "",
        gap_type: edu.gap_type || "",
        gap_duration_months: edu.gap_duration_months || 0,
        gap_reason: edu.gap_reason || "",
      }));
      setEducations(mappedEducations);
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      education_level: "",
      institute_name: "",
      city: "",
      board: "",
      year_of_passing: 0,
      result: 0,
      result_type: "PERCENTAGE",
      subjects: "",
      marksheet_file: "",
      gap_type: "",
      gap_duration_months: 0,
      gap_reason: "",
    });
    setEditingId(null);
  };

  const handleAddEducation = () => {
    if (formData.institute_name && formData.education_level) {
      if (editingId !== null) {
        // Update existing
        setEducations(
          educations.map((edu) =>
            edu.id === editingId ? { ...formData, id: editingId } : edu
          )
        );
      } else {
        // Add new
        setEducations([
          ...educations,
          {
            id: Date.now(),
            ...formData,
          },
        ]);
      }
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleEditEducation = (edu: Education) => {
    setFormData({
      education_level: edu.education_level,
      institute_name: edu.institute_name,
      city: edu.city,
      board: edu.board,
      year_of_passing: edu.year_of_passing,
      result: edu.result,
      result_type: edu.result_type,
      subjects: edu.subjects,
      marksheet_file: edu.marksheet_file,
      gap_type: edu.gap_type,
      gap_duration_months: edu.gap_duration_months,
      gap_reason: edu.gap_reason,
    });
    setEditingId(edu.id);
    setShowAddForm(true);
  };

  const handleDeleteEducation = (id: number) => {
    setEducations(educations.filter((edu) => edu.id !== id));
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
                      <h3 className="font-bold text-lg">{edu.education_level}</h3>
                      <p className="text-base-content/80">
                        {edu.institute_name}
                        {edu.city && ` • ${edu.city}`}
                      </p>
                      <p className="text-base-content/60 text-sm">
                        {edu.board} • {edu.year_of_passing}
                      </p>
                      {edu.subjects && (
                        <p className="text-base-content/60 text-sm">
                          Subjects: {edu.subjects}
                        </p>
                      )}
                      <p className="text-base-content/60 text-sm">
                        Result: {edu.result} {edu.result_type}
                      </p>
                      {edu.gap_duration_months > 0 && (
                        <p className="text-base-content/60 text-sm">
                          Gap: {edu.gap_duration_months} months ({edu.gap_type})
                        </p>
                      )}
                      {edu.marksheet_file && isValidUrl(edu.marksheet_file) && (
                        <a
                          href={edu.marksheet_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <i className="material-icons text-sm">open_in_new</i>
                          View Marksheet
                        </a>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEducation(edu)}
                          className="btn btn-ghost btn-sm btn-circle text-info"
                          title="Edit"
                        >
                          <i className="material-icons text-lg">edit</i>
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="btn btn-ghost btn-sm btn-circle text-error"
                          title="Delete"
                        >
                          <i className="material-icons text-lg">delete</i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!showAddForm && educations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No education records found.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-outline btn-primary"
              disabled={!isEditing}
            >
              <i className="material-icons mr-2">add</i>
              Add Education
            </button>
          </div>
        )}

        {/* Add Another Button */}
        {educations.length > 0 && !showAddForm && isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary btn-sm"
          >
            <i className="material-icons mr-2 text-lg">add</i>
            Add Another
          </button>
        )}

        {/* Add/Edit Education Form */}
        {showAddForm && (
          <div className="card bg-base-200 border-2 border-primary">
            <div className="card-body">
              <h3 className="font-bold text-lg mb-4">
                {editingId ? "Edit Education" : "Add Education"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Education Level *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.education_level}
                    onChange={(e) =>
                      setFormData({ ...formData, education_level: e.target.value })
                    }
                  >
                    <option value="">Select Level</option>
                    <option value="10TH">10th Standard</option>
                    <option value="12TH">12th Standard</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="BACHELOR">Bachelor's Degree</option>
                    <option value="MASTER">Master's Degree</option>
                    <option value="PHD">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RV University"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.institute_name}
                    onChange={(e) =>
                      setFormData({ ...formData, institute_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Board/University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE, ICSE, VTU"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.board}
                    onChange={(e) =>
                      setFormData({ ...formData, board: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year of Passing
                  </label>
                  <input
                    type="number"
                    placeholder="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.year_of_passing || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year_of_passing: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    min="1990"
                    max="2035"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Result Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.result_type}
                    onChange={(e) =>
                      setFormData({ ...formData, result_type: e.target.value })
                    }
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="CGPA">CGPA</option>
                    <option value="GPA">GPA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Result
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.5 or 85"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.result || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        result: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Marksheet URL
                  </label>
                  <input
                    type="text"
                    placeholder="Enter marksheet URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.marksheet_file}
                    onChange={(e) =>
                      setFormData({ ...formData, marksheet_file: e.target.value })
                    }
                  />
                  {formData.marksheet_file && isValidUrl(formData.marksheet_file) && (
                    <a
                      href={formData.marksheet_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <i className="material-icons text-sm">open_in_new</i>
                      View Marksheet
                    </a>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, Physics, Chemistry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.subjects}
                    onChange={(e) =>
                      setFormData({ ...formData, subjects: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t">
                  <h4 className="font-medium mb-3">Gap Information (if applicable)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Gap Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.gap_type}
                        onChange={(e) =>
                          setFormData({ ...formData, gap_type: e.target.value })
                        }
                      >
                        <option value="">No Gap</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="MEDICAL">Medical</option>
                        <option value="PERSONAL">Personal</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Gap Duration (months)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.gap_duration_months || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gap_duration_months: e.target.value
                              ? Number(e.target.value)
                              : 0,
                          })
                        }
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Gap Reason
                      </label>
                      <input
                        type="text"
                        placeholder="Brief reason"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.gap_reason}
                        onChange={(e) =>
                          setFormData({ ...formData, gap_reason: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEducation}
                  className="btn btn-primary"
                  disabled={!formData.institute_name || !formData.education_level}
                >
                  {editingId ? "Update Education" : "Add Education"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
