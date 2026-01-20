"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Internship {
  id: number;
  job_role: string;
  organization: string;
  organization_details: string;
  duration_months: number;
  start_date: string;
  end_date: string;
  location: string;
  stipend: number;
  skills: string[];
  description: string;
  mentor_name: string;
  proof_document: string;
}

interface InternshipsFormProps {
  isEditing: boolean;
}

export default function InternshipsForm({ isEditing }: InternshipsFormProps) {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Internship[]>([]);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const internshipData = user?.internships;

    if (Array.isArray(internshipData) && internshipData.length > 0) {
      const mappedInternships = internshipData.map((internship, index) => ({
        id: Date.now() + index,
        job_role: internship.job_role || "",
        organization: internship.organization || "",
        organization_details: internship.organization_details || "",
        duration_months: internship.duration_months || 0,
        start_date: internship.start_date || "",
        end_date: internship.end_date || "",
        location: internship.location || "",
        stipend: internship.stipend || 0,
        skills: Array.isArray(internship.skills) ? internship.skills : [],
        description: internship.description || "",
        mentor_name: internship.mentor_name || "",
        proof_document: internship.proof_document || "",
      }));
      setItems(mappedInternships);
    } else {
      setItems([]);
    }
  }, [user]);

  const add = () =>
    setItems((x) => [
      ...x,
      {
        id: Date.now(),
        job_role: "",
        organization: "",
        organization_details: "",
        duration_months: 0,
        start_date: "",
        end_date: "",
        location: "",
        stipend: 0,
        skills: [],
        description: "",
        mentor_name: "",
        proof_document: "",
      },
    ]);

  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));

  const update = (id: number, data: Partial<Internship>) =>
    setItems((x) => x.map((i) => (i.id === id ? { ...i, ...data } : i)));

  const addSkill = (id: number) => {
    const skillInput = skillInputs[id]?.trim();
    if (skillInput) {
      const item = items.find((i) => i.id === id);
      if (item) {
        update(id, { skills: [...item.skills, skillInput] });
        setSkillInputs({ ...skillInputs, [id]: "" });
      }
    }
  };

  const removeSkill = (id: number, index: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      update(id, { skills: item.skills.filter((_, i) => i !== index) });
    }
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
          <h2 className="text-xl font-semibold">Internships</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Internship {idx + 1}</div>
                {isEditing && (
                  <button
                    type="button"
                    className="text-error hover:text-error-focus"
                    onClick={() => remove(it.id)}
                    title="Delete"
                  >
                    <i className="material-icons">delete</i>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Role</label>
                  <input
                    value={it.job_role}
                    onChange={(e) => update(it.id, { job_role: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Software Engineering Intern"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input
                    value={it.organization}
                    onChange={(e) => update(it.id, { organization: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Organization Details
                  </label>
                  <input
                    value={it.organization_details}
                    onChange={(e) => update(it.id, { organization_details: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Fortune 500 tech company, Startup in AI/ML"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    value={it.location}
                    onChange={(e) => update(it.id, { location: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Bangalore, Remote"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={it.duration_months || ""}
                    onChange={(e) =>
                      update(it.id, {
                        duration_months: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={it.start_date}
                    onChange={(e) => update(it.id, { start_date: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={it.end_date}
                    onChange={(e) => update(it.id, { end_date: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stipend (₹ per month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={it.stipend || ""}
                    onChange={(e) =>
                      update(it.id, {
                        stipend: e.target.value ? Number(e.target.value) : 0,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mentor Name (if applicable)
                  </label>
                  <input
                    value={it.mentor_name}
                    onChange={(e) => update(it.id, { mentor_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Skills / Technologies Used
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputs[it.id] || ""}
                      onChange={(e) =>
                        setSkillInputs({ ...skillInputs, [it.id]: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(it.id);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Add a skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(it.id)}
                      disabled={!isEditing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {it.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {it.skills.map((skill, skillIdx) => (
                        <div
                          key={skillIdx}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                        >
                          <span>{skill}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeSkill(it.id, skillIdx)}
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={it.description}
                    onChange={(e) => update(it.id, { description: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Describe your role, responsibilities, and achievements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
                    rows={4}
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Certificate/Proof Document Link
                  </label>
                  <input
                    type="text"
                    value={it.proof_document}
                    onChange={(e) => update(it.id, { proof_document: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter certificate URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  {it.proof_document && isValidUrl(it.proof_document) && (
                    <a
                      href={it.proof_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <i className="material-icons text-sm">open_in_new</i>
                      View Certificate
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No internships found. Click "Add Internship" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={add}>
                <i className="material-icons mr-2">add</i> Add Internship
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
