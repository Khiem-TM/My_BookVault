import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../services/apiClient'

export default function TotalUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{type:'edit'|'delete', userId:number, name?:string, email?:string}|null>(null)
  const { data } = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/identity/identity/users')).data })
  const list = useMemo(() => (data?.result||[]).filter((u:any)=>
    !search || (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  ), [data, search])
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="border rounded px-3 py-2 w-64" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((u:any) => (
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
