"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Publication {
  id: number;
  title: string;
  publication_name: string;
  publication_type: string;
  publication_date: string;
  author_count: number;
  mentor_name: string;
  skills: string[];
  description: string;
  evidence_document: string;
}

interface PublicationsFormProps {
  isEditing: boolean;
}

export default function PublicationsForm({ isEditing }: PublicationsFormProps) {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Publication[]>([]);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const pubData = user?.publications;

    if (Array.isArray(pubData) && pubData.length > 0) {
      const mappedPubs = pubData.map((pub, index) => ({
        id: Date.now() + index,
        title: pub.title || "",
        publication_name: pub.publication_name || "",
        publication_type: pub.publication_type || "",
        publication_date: pub.publication_date || "",
        author_count: pub.author_count || 1,
        mentor_name: pub.mentor_name || "",
        skills: Array.isArray(pub.skills) ? pub.skills : [],
        description: pub.description || "",
        evidence_document: pub.evidence_document || "",
      }));
      setItems(mappedPubs);
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
        publication_name: "",
        publication_type: "",
        publication_date: "",
        author_count: 1,
        mentor_name: "",
        skills: [],
        description: "",
        evidence_document: "",
      },
    ]);

  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));

  const update = (id: number, data: Partial<Publication>) =>
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
          <h2 className="text-xl font-semibold">Publications</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Publication {idx + 1}</div>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    value={it.title}
                    onChange={(e) => update(it.id, { title: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Deep Learning Approaches for Image Classification"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Journal / Conference Name
                  </label>
                  <input
                    value={it.publication_name}
                    onChange={(e) => update(it.id, { publication_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. IEEE Transactions on Neural Networks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Publication Type
                  </label>
                  <select
                    value={it.publication_type}
                    onChange={(e) => update(it.id, { publication_type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Type</option>
                    <option value="JOURNAL">Journal Article</option>
                    <option value="CONFERENCE">Conference Paper</option>
                    <option value="WORKSHOP">Workshop Paper</option>
                    <option value="POSTER">Poster</option>
                    <option value="PREPRINT">Preprint</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={it.publication_date}
                    onChange={(e) => update(it.id, { publication_date: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Authors
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={it.author_count}
                    onChange={(e) =>
                      update(it.id, {
                        author_count: e.target.value ? Number(e.target.value) : 1,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mentor / Advisor Name
                  </label>
                  <input
                    value={it.mentor_name}
                    onChange={(e) => update(it.id, { mentor_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Dr. John Smith"
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
                    placeholder="Provide a brief description of your publication..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
                    rows={4}
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Link (DOI / URL / Evidence Document)
                  </label>
                  <input
                    value={it.evidence_document}
                    onChange={(e) => update(it.id, { evidence_document: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. https://doi.org/10.1234/example or publication URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  {it.evidence_document && isValidUrl(it.evidence_document) && (
                    <a
                      href={it.evidence_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <i className="material-icons text-sm">open_in_new</i>
                      View Publication
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No publications found. Click "Add Publication" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={add}>
                <i className="material-icons mr-2">add</i> Add Publication
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
