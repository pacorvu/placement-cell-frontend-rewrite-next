"use client";

import { useState } from "react";

interface Internship {
  id: number;
  company: string;
  role: string;
  location: string;
  certificate?: File | null;
  startDate: string;
  endDate: string;
  description: string;
}

interface InternshipsFormProps {
  isEditing: boolean;
}

export default function InternshipsForm({ isEditing }: InternshipsFormProps) {
  const [items, setItems] = useState<Internship[]>([]);

  const add = () => setItems((x) => [...x, { id: Date.now(), company: "", role: "", location: "", certificate: null, startDate: "", endDate: "", description: "" }]);
  const remove = (id: number) => setItems((x) => x.filter((i) => i.id !== id));
  const update = (id: number, data: Partial<Internship>) => setItems((x) => x.map(i => i.id===id ? {...i,...data} : i));

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Internships</h2>

          {items.map((it, idx) => (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Internship {idx+1}</div>
                <button type="button" className="text-error" onClick={()=>remove(it.id)}><i className="material-icons">delete</i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Company Name</label>
                  <input value={it.company} onChange={(e)=>update(it.id,{company:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Role</label>
                  <input value={it.role} onChange={(e)=>update(it.id,{role:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Location</label>
                  <input value={it.location} onChange={(e)=>update(it.id,{location:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Upload Certificate</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="btn btn-sm btn-outline">
                      Choose file
                      <input type="file" className="hidden" onChange={(e)=>update(it.id,{certificate:e.target.files?.[0] ?? null})} />
                    </label>
                    <span className="text-sm text-gray-500">{it.certificate?.name ?? 'No file chosen'}</span>
                  </div>
                </div> 

                <div>
                  <label className="block text-sm text-muted">Start Date</label>
                  <input type="date" value={it.startDate} onChange={(e)=>update(it.id,{startDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">End Date</label>
                  <input type="date" value={it.endDate} onChange={(e)=>update(it.id,{endDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted">Description</label>
                  <textarea value={it.description} onChange={(e)=>update(it.id,{description:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2 resize-none" rows={4}></textarea>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={add}><i className="material-icons mr-2">add</i> Add Internship</button>
          </div>
        </div>
      </div>
    </div>
  )
}
