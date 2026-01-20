"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Certification {
  id: number;
  title: string;
  organization: string;
  certification_type: string;
  skills: string[];
  score: string | number;
  issue_date: string;
  expiry_date: string;
  proof_document: string;
}

interface CertificationsFormProps {
  isEditing: boolean;
}

export default function CertificationsForm({ isEditing }: CertificationsFormProps) {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Certification[]>([]);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const certData = user?.certifications;

    if (Array.isArray(certData) && certData.length > 0) {
      const mappedCerts = certData.map((cert, index) => ({
        id: Date.now() + index,
        title: cert.title || "",
        organization: cert.organization || "",
        certification_type: cert.certification_type || "",
        skills: Array.isArray(cert.skills) ? cert.skills : [],
        score: cert.score || "",
        issue_date: cert.issue_date || "",
        expiry_date: cert.expiry_date || "",
        proof_document: cert.proof_document || "",
      }));
      setItems(mappedCerts);
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
        organization: "",
        certification_type: "",
        skills: [],
        score: "",
        issue_date: "",
        expiry_date: "",
        proof_document: "",
      },
    ]);

  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));

  const update = (id: number, data: Partial<Certification>) =>
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
          <h2 className="text-xl font-semibold">Certifications</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Certification {idx + 1}</div>
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
                    Certification Title
                  </label>
                  <input
                    value={it.title}
                    onChange={(e) => update(it.id, { title: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Issuing Organization
                  </label>
                  <input
                    value={it.organization}
                    onChange={(e) => update(it.id, { organization: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Certification Type
                  </label>
                  <select
                    value={it.certification_type}
                    onChange={(e) => update(it.id, { certification_type: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Type</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Score (if applicable)
                  </label>
                  <input
                    type="text"
                    value={it.score}
                    onChange={(e) => update(it.id, { score: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. 95% or A+"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={it.issue_date}
                    onChange={(e) => update(it.id, { issue_date: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry Date (if any)
                  </label>
                  <input
                    type="date"
                    value={it.expiry_date}
                    onChange={(e) => update(it.id, { expiry_date: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Skills Demonstrated
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
              No certifications found. Click "Add Certification" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={add}>
                <i className="material-icons mr-2">add</i> Add Certification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
