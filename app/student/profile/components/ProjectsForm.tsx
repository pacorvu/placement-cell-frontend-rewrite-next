"use client";

import { useState } from "react";

interface Project {
  id: number;
  title: string;
  role: string;
  technologies: string;
  projectLink: string;
  proof?: File | null;
  startDate: string;
  endDate: string;
  description: string;
}

interface ProjectsFormProps {
  isEditing: boolean;
}

export default function ProjectsForm({ isEditing }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = () => {
    setProjects((p) => [
      ...p,
      {
        id: Date.now(),
        title: "",
        role: "",
        technologies: "",
        projectLink: "",
        proof: null,
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeProject = (id: number) => setProjects((p) => p.filter((x) => x.id !== id));

  const updateProject = (id: number, data: Partial<Project>) => {
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...data } : x)));
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Projects</h2>

          {projects.map((proj, idx) => (
            <div key={proj.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Project {idx + 1}</div>
                <button type="button" className="text-error" onClick={() => removeProject(proj.id)}>
                  <i className="material-icons">delete</i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Project Title</label>
                  <input value={proj.title} onChange={(e)=>updateProject(proj.id,{title:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Role</label>
                  <input value={proj.role} onChange={(e)=>updateProject(proj.id,{role:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Technologies (comma separated)</label>
                  <input value={proj.technologies} onChange={(e)=>updateProject(proj.id,{technologies:e.target.value})} disabled={!isEditing} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Project Link (GitHub/Live)</label>
                  <input value={proj.projectLink} onChange={(e)=>updateProject(proj.id,{projectLink:e.target.value})} disabled={!isEditing} placeholder="https://github.com/username/project" className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Upload Proof (Screenshot/Certificate)</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="btn btn-sm btn-outline">
                      Choose file
                      <input type="file" className="hidden" onChange={(e)=>updateProject(proj.id,{proof:e.target.files?.[0] ?? null})} />
                    </label>
                    <span className="text-sm text-gray-500">{proj.proof?.name ?? 'No file chosen'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted">Start Date</label>
                  <input type="date" value={proj.startDate} onChange={(e)=>updateProject(proj.id,{startDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">End Date</label>
                  <input type="date" value={proj.endDate} onChange={(e)=>updateProject(proj.id,{endDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted">Description</label>
                  <textarea value={proj.description} onChange={(e)=>updateProject(proj.id,{description:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2 resize-none" rows={4}></textarea>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={addProject}>
              <i className="material-icons mr-2">add</i> Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
