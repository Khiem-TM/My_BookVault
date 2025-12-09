import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../services/apiClient'

export default function TotalUsers() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{type:'edit'|'delete', userId:number, name?:string, email?:string}|null>(null)
  const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/identity/users')).data })
  const save = useMutation({
    mutationFn: async (payload: { userId:number, name?:string, email?:string }) => api.put(`/identity/users/${payload.userId}`, { name: payload.name, email: payload.email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  })
  const del = useMutation({
    mutationFn: async (userId: number) => api.delete(`/identity/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <img src="/admin/3.png" alt="total-users" className="w-full rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-4">
        {(data||[]).map((u:any) => (
          <div key={u.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.name || `User #${u.id}`}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={()=>setModal({type:'edit', userId:u.id, name:u.name, email:u.email})}>Edit</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>setModal({type:'delete', userId:u.id})}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-[420px]">
            {modal.type==='edit' && (
              <>
                <h3 className="text-lg font-semibold mb-3">Edit User #{modal.userId}</h3>
                <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Name" defaultValue={modal.name} onChange={e=>modal.name=e.target.value} />
                <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Email" defaultValue={modal.email} onChange={e=>modal.email=e.target.value} />
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>{ if(modal){ save.mutate({ userId: modal.userId, name: modal.name, email: modal.email }); setModal(null) } }}>Save</button>
                </div>
              </>
            )}
            {modal.type==='delete' && (
              <>
                <h3 className="text-lg font-semibold mb-3">Delete User #{modal.userId}?</h3>
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={()=>setModal(null)}>Cancel</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>{ if(modal){ del.mutate(modal.userId); setModal(null) } }}>Confirm</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
