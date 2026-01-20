"use client";

import { useUser } from "@/lib/useUser";
import { useState, useEffect } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  skills: string[];
  project_link: string;
  snaps: string[];
  mentor_name: string;
}

interface ProjectsFormProps {
  isEditing: boolean;
}

export default function ProjectsForm({ isEditing }: ProjectsFormProps) {
  const { user, isLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skillInputs, setSkillInputs] = useState<{ [key: number]: string }>({});
  const [snapInputs, setSnapInputs] = useState<{ [key: number]: string }>({});

  // Populate form with user data
  useEffect(() => {
    const projectData = user?.projects;

    if (Array.isArray(projectData) && projectData.length > 0) {
      const mappedProjects = projectData.map((project, index) => ({
        id: Date.now() + index,
        title: project.title || "",
        description: project.description || "",
        skills: Array.isArray(project.skills) ? project.skills : [],
        project_link: project.project_link || "",
        snaps: Array.isArray(project.snaps) ? project.snaps : [],
        mentor_name: project.mentor_name || "",
      }));
      setProjects(mappedProjects);
    } else {
      setProjects([]);
    }
  }, [user]);

  const addProject = () => {
    setProjects((p) => [
      ...p,
      {
        id: Date.now(),
        title: "",
        description: "",
        skills: [],
        project_link: "",
        snaps: [],
        mentor_name: "",
      },
    ]);
  };

  const removeProject = (id: number) => setProjects((p) => p.filter((x) => x.id !== id));

  const updateProject = (id: number, data: Partial<Project>) => {
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
  };

  const addSkill = (id: number) => {
    const skillInput = skillInputs[id]?.trim();
    if (skillInput) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        updateProject(id, { skills: [...project.skills, skillInput] });
        setSkillInputs({ ...skillInputs, [id]: "" });
      }
    }
  };

  const removeSkill = (id: number, index: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, { skills: project.skills.filter((_, i) => i !== index) });
    }
  };

  const addSnap = (id: number) => {
    const snapInput = snapInputs[id]?.trim();
    if (snapInput && isValidUrl(snapInput)) {
      const project = projects.find((p) => p.id === id);
      if (project) {
        updateProject(id, { snaps: [...project.snaps, snapInput] });
        setSnapInputs({ ...snapInputs, [id]: "" });
      }
    }
  };

  const removeSnap = (id: number, index: number) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, { snaps: project.snaps.filter((_, i) => i !== index) });
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
          <h2 className="text-xl font-semibold">Projects</h2>

          {projects.map((proj, idx) => (
            <div key={proj.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Project {idx + 1}</div>
                {isEditing && (
                  <button
                    type="button"
                    className="text-error hover:text-error-focus"
                    onClick={() => removeProject(proj.id)}
                    title="Delete"
                  >
                    <i className="material-icons">delete</i>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. E-commerce Website with React"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Link (GitHub/Live)
                  </label>
                  <input
                    value={proj.project_link}
                    onChange={(e) => updateProject(proj.id, { project_link: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  {proj.project_link && isValidUrl(proj.project_link) && (
                    <a
                      href={proj.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <i className="material-icons text-sm">open_in_new</i>
                      View Project
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mentor Name (if applicable)
                  </label>
                  <input
                    value={proj.mentor_name}
                    onChange={(e) => updateProject(proj.id, { mentor_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g. Dr. John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Technologies / Skills Used
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInputs[proj.id] || ""}
                      onChange={(e) =>
                        setSkillInputs({ ...skillInputs, [proj.id]: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(proj.id);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Add a technology/skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(proj.id)}
                      disabled={!isEditing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {proj.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {proj.skills.map((skill, skillIdx) => (
                        <div
                          key={skillIdx}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                        >
                          <span>{skill}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeSkill(proj.id, skillIdx)}
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
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Describe your project, your role, and key achievements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed resize-none"
                    rows={4}
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Screenshots / Images (URLs)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={snapInputs[proj.id] || ""}
                      onChange={(e) =>
                        setSnapInputs({ ...snapInputs, [proj.id]: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSnap(proj.id);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="Enter screenshot URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => addSnap(proj.id)}
                      disabled={!isEditing}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {proj.snaps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {proj.snaps.map((snap, snapIdx) => (
                        <div
                          key={snapIdx}
                          className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
                        >
                          <a
                            href={snap}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate flex-1"
                          >
                            <i className="material-icons text-sm align-middle mr-1">
                              image
                            </i>
                            {snap}
                          </a>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeSnap(proj.id, snapIdx)}
                              className="ml-2 text-error hover:text-error-focus"
                            >
                              <i className="material-icons text-sm">close</i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No projects found. Click "Add Project" to get started.
            </div>
          )}

          {isEditing && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-block" onClick={addProject}>
                <i className="material-icons mr-2">add</i> Add Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
