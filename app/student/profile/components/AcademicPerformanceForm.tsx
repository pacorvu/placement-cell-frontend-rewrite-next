"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface AcademicSemester {
  id: number;
  academic_year: number;
  semester: number;
  result_in_sgpa: number;
  provisional_result_upload_link: string;
  live_backlogs: number;
  closed_backlogs: number;
}

interface AcademicPerformanceFormProps {
  isEditing: boolean;
}

export default function AcademicPerformanceForm({ isEditing }: AcademicPerformanceFormProps) {
  const { user, isLoading } = useUser();
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);

  // Populate form with user data
  useEffect(() => {
    const semesterData = user?.semester_academics;

    if (Array.isArray(semesterData) && semesterData.length > 0) {
      // Map the data to include an id for React key management
      const mappedSemesters = semesterData.map((sem, index) => ({
        id: Date.now() + index, // Generate unique IDs
        academic_year: sem.academic_year || 0,
        semester: sem.semester || 0,
        result_in_sgpa: sem.result_in_sgpa || 0,
        provisional_result_upload_link: sem.provisional_result_upload_link || "",
        live_backlogs: sem.live_backlogs || 0,
        closed_backlogs: sem.closed_backlogs || 0,
      }));
      setSemesters(mappedSemesters);
    } else {
      setSemesters([]);
    }
  }, [user]);

  const addSemester = () => {
    setSemesters((s) => [
      ...s,
      {
        id: Date.now(),
        academic_year: new Date().getFullYear(),
        semester: s.length + 1,
        result_in_sgpa: 0,
        provisional_result_upload_link: "",
        live_backlogs: 0,
        closed_backlogs: 0,
      },
    ]);
  };

  const removeSemester = (id: number) => {
    setSemesters((s) => s.filter((sem) => sem.id !== id));
  };

  const updateSemester = (id: number, data: Partial<AcademicSemester>) => {
    setSemesters((s) => s.map((sem) => (sem.id === id ? { ...sem, ...data } : sem)));
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

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Academic Performance</h2>

          {semesters.map((sem, idx) => (
            <div key={sem.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Semester {idx + 1}</div>
                {isEditing && (
                  <button
                    type="button"
                    className="text-error hover:text-error-focus"
                    onClick={() => removeSemester(sem.id)}
                    title="Delete"
                  >
                    <i className="material-icons">delete</i>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    value={sem.academic_year || ""}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        academic_year: e.target.value ? Number(e.target.value) : 0
                      })
                    }
                    placeholder="e.g. 2024"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Semester
                  </label>
                  <input
                    type="number"
                    value={sem.semester || ""}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        semester: e.target.value ? Number(e.target.value) : 0
                      })
                    }
                    placeholder="e.g. 5"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    SGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sem.result_in_sgpa || ""}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        result_in_sgpa: e.target.value ? Number(e.target.value) : 0
                      })
                    }
                    placeholder="e.g. 8.5"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Provisional Result Upload Link
                  </label>
                  <input
                    type="text"
                    value={sem.provisional_result_upload_link || ""}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        provisional_result_upload_link: e.target.value
                      })
                    }
                    placeholder="Enter marksheet URL"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  {sem.provisional_result_upload_link && isValidUrl(sem.provisional_result_upload_link) && (
                    <a
                      href={sem.provisional_result_upload_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <i className="material-icons text-sm">open_in_new</i>
                      View Marksheet
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Live Backlogs
                  </label>
                  <input
                    type="number"
                    value={sem.live_backlogs}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        live_backlogs: e.target.value ? Number(e.target.value) : 0
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Closed Backlogs
                  </label>
                  <input
                    type="number"
                    value={sem.closed_backlogs}
                    onChange={(e) =>
                      updateSemester(sem.id, {
                        closed_backlogs: e.target.value ? Number(e.target.value) : 0
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ))}

          {semesters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No semester records found. Click "Add Semester" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={addSemester}
              >
                <i className="material-icons mr-2">add</i> Add Semester
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
