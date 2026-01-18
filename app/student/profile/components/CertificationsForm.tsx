"use client";

import { useState } from "react";

interface Certification {
  id: number;
  title: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  certificate?: File | null;
}

interface CertificationsFormProps {
  isEditing: boolean;
}

export default function CertificationsForm({ isEditing }: CertificationsFormProps) {
  const [items, setItems] = useState<Certification[]>([]);
  const add = () => setItems((x)=>[...x,{id:Date.now(),title:'',organization:'',issueDate:'',expiryDate:'',credentialId:'',certificate:null}]);
  const remove = (id:number)=>setItems((x)=>x.filter(i=>i.id!==id));
  const update=(id:number,data:Partial<Certification>)=>setItems((x)=>x.map(i=>i.id===id?{...i,...data}:i));

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <h2 className="text-xl font-semibold">Certifications</h2>

          {items.map((it,idx)=> (
            <div key={it.id} className="mt-4 p-4 border rounded bg-base-50 relative">
              <div className="flex items-start justify-between">
                <div className="font-medium">Certification {idx+1}</div>
                <button type="button" className="text-error" onClick={()=>remove(it.id)}><i className="material-icons">delete</i></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-muted">Certification Title</label>
                  <input value={it.title} onChange={(e)=>update(it.id,{title:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Issuing Organization</label>
                  <input value={it.organization} onChange={(e)=>update(it.id,{organization:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Issue Date</label>
                  <input type="date" value={it.issueDate} onChange={(e)=>update(it.id,{issueDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Expiry Date (if any)</label>
                  <input type="date" value={it.expiryDate} onChange={(e)=>update(it.id,{expiryDate:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
                </div>

                <div>
                  <label className="block text-sm text-muted">Credential ID</label>
                  <input value={it.credentialId} onChange={(e)=>update(it.id,{credentialId:e.target.value})} disabled={!isEditing} className="w-full px-3 py-2 border rounded mt-2" />
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
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="button" className="btn btn-ghost btn-block" onClick={add}><i className="material-icons mr-2">add</i> Add Certification</button>
          </div>
        </div>
      </div>
    </div>
  )
}
