"use client";

import { useState } from "react";

interface Publication {
  id: number;
  title: string;
  journal: string;
  publicationDate: string;
  link: string;
  description: string;
}

interface PublicationsFormProps { isEditing: boolean }

export default function PublicationsForm({ isEditing }: PublicationsFormProps) {
  const [items, setItems] = useState<Publication[]>([]);
  const add = () => setItems((x)=>[...x,{id:Date.now(),title:'',journal:'',publicationDate:'',link:'',description:''}]);
  const remove=(id:number)=>setItems((x)=>x.filter(i=>i.id!==id));
  const update=(id:number,data:Partial<Publication>)=>setItems((x)=>x.map(i=>i.id===id?{...i,...data}:i));

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Publications</h2>

          {items.map((it,idx)=> (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Publication {idx+1}</div>
                <button type="button" className="text-error" onClick={()=>remove(it.id)}><i className="material-icons">delete</i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Title</label>
                  <input value={it.title} onChange={(e)=>update(it.id,{title:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Journal / Conference Name</label>
                  <input value={it.journal} onChange={(e)=>update(it.id,{journal:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Publication Date</label>
                  <input type="date" value={it.publicationDate} onChange={(e)=>update(it.id,{publicationDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Link (DOI / URL)</label>
                  <input value={it.link} onChange={(e)=>update(it.id,{link:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-muted">Description</label>
                  <textarea value={it.description} onChange={(e)=>update(it.id,{description:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2 resize-none" rows={4}></textarea>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={add}><i className="material-icons mr-2">add</i> Add Publication</button>
          </div>
        </div>
      </div>
    </div>
  )
}
