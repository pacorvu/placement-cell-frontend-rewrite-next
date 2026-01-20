"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Training {
  id: number;
  title: string;
  institution: string;
  training_type: string;
  start_date: string;
  end_date: string;
  skills: string[];
  description: string;
  proof_document: string;
}

interface TrainingWorkshopsFormProps {
  isEditing: boolean;
}

export default function TrainingWorkshopsForm({ isEditing }: TrainingWorkshopsFormProps) {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Training[]>([]);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const trainingData = user?.trainings;

    if (Array.isArray(trainingData) && trainingData.length > 0) {
      const mappedTrainings = trainingData.map((training, index) => ({
        id: Date.now() + index,
        title: training.title || "",
        institution: training.institution || "",
        training_type: training.training_type || "",
        start_date: training.start_date || "",
        end_date: training.end_date || "",
        skills: Array.isArray(training.skills) ? training.skills : [],
        description: training.description || "",
        proof_document: training.proof_document || "",
      }));
      setItems(mappedTrainings);
    } else {
      setItems([]);
    }
  }, [user]);

  const add = () =>
    setItems((x) => [
      ...x,
      {
        id: Date.now(),
        title: "",
        institution: "",
        training_type: "",
        start_date: "",
        end_date: "",
        skills: [],
        description: "",
        proof_document: "",
      },
    ]);

  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));

  const update = (id: number, data: Partial<Training>) =>
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
          <h2 className="text-xl font-semibold">Training & Workshops</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Training {idx + 1}</div>
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
                  <label className="block text-sm font-medium mb-2">
                    Title / Topic
                  </label>
                  <input
                    value={it.title}
                    onChange={(e) => update(it.id, { title: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Machine Learning Fundamentals"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organization / Institute
                  </label>
                  <input
                    value={it.institution}
                    onChange={(e) => update(it.id, { institution: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Coursera, Udemy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Training Type
                  </label>
                  <select
                    value={it.training_type}
                    onChange={(e) => update(it.id, { training_type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Type</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="ONLINE_COURSE">Online Course</option>
                    <option value="BOOTCAMP">Bootcamp</option>
                    <option value="SEMINAR">Seminar</option>
                    <option value="CERTIFICATION">Certification Program</option>
                    <option value="OTHER">Other</option>
                  </select>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Skills Learned
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
                    placeholder="Describe what you learned and achieved..."
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
              No training or workshop records found. Click "Add Training / Workshop" to get
              started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={add}>
                <i className="material-icons mr-2">add</i> Add Training / Workshop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
