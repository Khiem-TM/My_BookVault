import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/apiClient'
import { useMemo, useState } from 'react'

export default function TotalBooks() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<any|null>(null)
  const { data } = useQuery({ queryKey: ['books'], queryFn: async () => (await api.get('/book/books')).data })
  const list = useMemo(() => (data||[]).filter((b:any)=>
    !search || (b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()))
  ), [data, search])
  const update = useMutation({
    mutationFn: async ({ id, payload }: { id:number, payload:any }) => api.put(`/book/books/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] })
  })
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Manage Books</h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books..." className="border rounded px-3 py-2 w-64" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((b:any) => (
          <div key={b.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-500">{b.author}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={()=>setEditing({ ...b })}>Edit</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>setEditing({ view: true, ...b })}>View</button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded p-6 w-[520px]">
            {editing.view ? (
              <>
                <h3 className="text-lg font-semibold mb-3">Book Detail</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>Title: {editing.title}</div>
                  <div>Author: {editing.author}</div>
                  <div>ISBN: {editing.isbn}</div>
                  <div>Status: {editing.status}</div>
                  <div>Categories: {(editing.categories||[]).join(', ')}</div>
                  <div>Description: {editing.description}</div>
                </div>
                <div className="flex justify-end mt-4"><button className="px-3 py-1 rounded border" onClick={()=>setEditing(null)}>Close</button></div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-3">Edit Book #{editing.id}</h3>
                <input className="w-full border rounded px-3 py-2 mb-3" defaultValue={editing.title} onChange={e=>editing.title=e.target.value} />
                <input className="w-full border rounded px-3 py-2 mb-3" defaultValue={editing.author} onChange={e=>editing.author=e.target.value} />
                <textarea className="w-full border rounded px-3 py-2 mb-3" defaultValue={editing.description} onChange={e=>editing.description=e.target.value} />
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-1 rounded border" onClick={()=>setEditing(null)}>Cancel</button>
                  <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>{ update.mutate({ id: editing.id, payload: { title: editing.title, author: editing.author, description: editing.description } }); setEditing(null) }}>Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
