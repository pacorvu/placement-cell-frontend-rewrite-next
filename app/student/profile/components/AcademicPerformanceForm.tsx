"use client";

import { useState } from "react";

interface AcademicSemester {
  id: number;
  academicYear: string;
  semester: string;
  sgpa: string;
  marksheet?: File | null;
  liveBacklogs: number;
  closedBacklogs: number;
  open: boolean;
}

interface AcademicPerformanceFormProps {
  isEditing: boolean;
}

export default function AcademicPerformanceForm({ isEditing }: AcademicPerformanceFormProps) {
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);

  const addSemester = () => {
    setSemesters((s) => [
      ...s,
      {
        id: Date.now(),
        academicYear: "",
        semester: String(s.length + 1),
        sgpa: "",
        marksheet: null,
        liveBacklogs: 0,
        closedBacklogs: 0,
        open: true,
      },
    ]);
  };

  const removeSemester = (id: number) => {
    setSemesters((s) => s.filter((sem) => sem.id !== id));
  };

  const updateSemester = (id: number, data: Partial<AcademicSemester>) => {
    setSemesters((s) => s.map((sem) => (sem.id === id ? { ...sem, ...data } : sem)));
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Academic Performance</h2>

          {semesters.map((sem, idx) => (
            <div key={sem.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Semester {idx + 1}</div>
                <button
                  type="button"
                  className="text-error"
                  onClick={() => removeSemester(sem.id)}
                  title="Delete"
                >
                  <i className="material-icons">delete</i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Academic Year</label>
                  <input
                    value={sem.academicYear}
                    onChange={(e) => updateSemester(sem.id, { academicYear: e.target.value })}
                    placeholder="e.g. 2023-2024"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted">Semester</label>
                  <input
                    value={sem.semester}
                    onChange={(e) => updateSemester(sem.id, { semester: e.target.value })}
                    placeholder="e.g. 5"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted">SGPA</label>
                  <input
                    value={sem.sgpa}
                    onChange={(e) => updateSemester(sem.id, { sgpa: e.target.value })}
                    placeholder="e.g. 8.5"
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted">Upload Marksheet</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="btn btn-sm btn-outline">
                      Choose file
                      <input type="file" className="hidden" onChange={(e) => updateSemester(sem.id, { marksheet: e.target.files?.[0] ?? null })} />
                    </label>
                    <span className="text-sm text-gray-500">{sem.marksheet?.name ?? 'No file chosen'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted">Live Backlogs</label>
                  <input
                    type="number"
                    value={sem.liveBacklogs}
                    onChange={(e) => updateSemester(sem.id, { liveBacklogs: Number(e.target.value) })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted">Closed Backlogs</label>
                  <input
                    type="number"
                    value={sem.closedBacklogs}
                    onChange={(e) => updateSemester(sem.id, { closedBacklogs: Number(e.target.value) })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded mt-2"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={addSemester}>
              <i className="material-icons mr-2">add</i> Add Semester
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
