"use client";

import { useState } from "react";

interface Experience { id:number; title:string; date:string; proof?:File|null; description:string }
interface OtherExperiencesFormProps { isEditing:boolean }

export default function OtherExperiencesForm({ isEditing }: OtherExperiencesFormProps){
  const [items,setItems]=useState<Experience[]>([]);
  const add=()=>setItems(x=>[...x,{id:Date.now(),title:'',date:'',proof:null,description:''}]);
  const remove=(id:number)=>setItems(x=>x.filter(i=>i.id!==id));
  const update=(id:number,data:Partial<Experience>)=>setItems(x=>x.map(i=>i.id===id?{...i,...data}:i));

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Other Experiences</h2>

          {items.map((it,idx)=> (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Experience {idx+1}</div>
                <button type="button" className="text-error" onClick={()=>remove(it.id)}><i className="material-icons">delete</i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Title / Event Name</label>
                  <input value={it.title} onChange={(e)=>update(it.id,{title:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Date</label>
                  <input type="date" value={it.date} onChange={(e)=>update(it.id,{date:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted">Upload Proof</label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="btn btn-sm btn-outline">
                      Choose file
                      <input type="file" className="hidden" onChange={(e)=>update(it.id,{proof:e.target.files?.[0] ?? null})} />
                    </label>
                    <span className="text-sm text-gray-500">{it.proof?.name ?? 'No file chosen'}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted">Description</label>
                  <textarea value={it.description} onChange={(e)=>update(it.id,{description:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2 resize-none" rows={4}></textarea>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={add}><i className="material-icons mr-2">add</i> Add Experience</button>
          </div>
        </div>
      </div>
    </div>
  )
}
