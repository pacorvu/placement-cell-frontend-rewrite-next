"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Activity {
  id: number;
  activity_name: string;
  activity_type: string;
  role: string;
  organization: string;
  start_date: string;
  end_date: string;
  achievements: string[];
  skills: string[];
  description: string;
  proof_document: string;
}

interface ExtraCurricularFormProps {
  isEditing: boolean;
}

export default function ExtraCurricularForm({ isEditing }: ExtraCurricularFormProps) {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Activity[]>([]);
  const [achievementInputs, setAchievementInputs] = useState<{ [key: number]: string }>({});
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const activityData = user?.extra_curricular_activities;

    if (Array.isArray(activityData) && activityData.length > 0) {
      const mappedActivities = activityData.map((activity, index) => ({
        id: Date.now() + index,
        activity_name: activity.activity_name || "",
        activity_type: activity.activity_type || "",
        role: activity.role || "",
        organization: activity.organization || "",
        start_date: activity.start_date || "",
        end_date: activity.end_date || "",
        achievements: Array.isArray(activity.achievements) ? activity.achievements : [],
        skills: Array.isArray(activity.skills) ? activity.skills : [],
        description: activity.description || "",
        proof_document: activity.proof_document || "",
      }));
      setItems(mappedActivities);
    } else {
      setItems([]);
    }
  }, [user]);

  const add = () =>
    setItems((x) => [
      ...x,
      {
        id: Date.now(),
        activity_name: "",
        activity_type: "",
        role: "",
        organization: "",
        start_date: "",
        end_date: "",
        achievements: [],
        skills: [],
        description: "",
        proof_document: "",
      },
    ]);

  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));

  const update = (id: number, data: Partial<Activity>) =>
    setItems((x) => x.map((i) => (i.id === id ? { ...i, ...data } : i)));

  const addAchievement = (id: number) => {
    const achievementInput = achievementInputs[id]?.trim();
    if (achievementInput) {
      const item = items.find((i) => i.id === id);
      if (item) {
        update(id, { achievements: [...item.achievements, achievementInput] });
        setAchievementInputs({ ...achievementInputs, [id]: "" });
      }
    }
  };

  const removeAchievement = (id: number, index: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      update(id, { achievements: item.achievements.filter((_, i) => i !== index) });
    }
  };

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
          <h2 className="text-xl font-semibold">Extra-Curricular Activities</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Activity {idx + 1}</div>
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
                  <label className="block text-sm font-medium mb-2">Activity Name</label>
                  <input
                    value={it.activity_name}
                    onChange={(e) => update(it.id, { activity_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Annual Tech Fest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Activity Type</label>
                  <select
                    value={it.activity_type}
                    onChange={(e) => update(it.id, { activity_type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Type</option>
                    <option value="SPORTS">Sports</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="VOLUNTEER">Volunteer Work</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="CLUB">Club/Society</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    value={it.role}
                    onChange={(e) => update(it.id, { role: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. President, Member, Participant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input
                    value={it.organization}
                    onChange={(e) => update(it.id, { organization: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Computer Science Club"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Achievements</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={achievementInputs[it.id] || ""}
                      onChange={(e) =>
                        setAchievementInputs({ ...achievementInputs, [it.id]: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAchievement(it.id);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Add an achievement"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => addAchievement(it.id)}
                      disabled={!isEditing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {it.achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {it.achievements.map((achievement, achIdx) => (
                        <div
                          key={achIdx}
                          className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full"
                        >
                          <span>{achievement}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeAchievement(it.id, achIdx)}
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
                  <label className="block text-sm font-medium mb-2">Skills Gained</label>
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
                    placeholder="Describe your role and contributions..."
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
                    placeholder="Enter certificate or proof URL"
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
              No activities found. Click "Add Activity" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={add}>
                <i className="material-icons mr-2">add</i> Add Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
