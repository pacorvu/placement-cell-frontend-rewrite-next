"use client";

import { useState } from "react";

interface Training {
  id: number;
  title: string;
  organization: string;
  certificate?: File | null;
  startDate: string;
  endDate: string;
  description: string;
}

interface TrainingWorkshopsFormProps {
  isEditing: boolean;
}

export default function TrainingWorkshopsForm({ isEditing }: TrainingWorkshopsFormProps) {
  const [items, setItems] = useState<Training[]>([]);
  const add = () => setItems((x)=>[...x,{id:Date.now(),title:'',organization:'',certificate:null,startDate:'',endDate:'',description:''}]);
  const remove = (id:number)=>setItems((x)=>x.filter(i=>i.id!==id));
  const update=(id:number,data:Partial<Training>)=>setItems((x)=>x.map(i=>i.id===id?{...i,...data}:i));

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Training & Workshops</h2>

          {items.map((it,idx)=> (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Training {idx+1}</div>
                <button type="button" className="text-error" onClick={()=>remove(it.id)}><i className="material-icons">delete</i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Title / Topic</label>
                  <input value={it.title} onChange={(e)=>update(it.id,{title:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>
                <div>
                  <label className="block text-sm text-muted">Organization / Institute</label>
                  <input value={it.organization} onChange={(e)=>update(it.id,{organization:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
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
            <button type="button" className="btn btn-ghost btn-block" onClick={add}><i className="material-icons mr-2">add</i> Add Training / Workshop</button>
          </div>
        </div>
      </div>
    </div>
  )
}
