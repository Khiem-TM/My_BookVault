import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../services/apiClient'

export default function TotalBorrows() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const { data } = useQuery({ queryKey: ['txs'], queryFn: async () => (await api.get('/transaction/transactions')).data })
  const list = useMemo(() => (data||[]).filter((t:any)=>
    !search || String(t.userId).includes(search) || String(t.bookId).includes(search)
  ), [data, search])
  const approve = useMutation({
    mutationFn: async (t:any) => api.post('/transaction/transactions/borrow', { userId: t.userId, bookId: t.bookId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['txs'] })
  })
  const reject = useMutation({
    mutationFn: async (id:number) => api.delete(`/transaction/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['txs'] })
  })
  const remind = useMutation({
    mutationFn: async (t:any) => {
      const u = await api.get(`/identity/identity/users/${t.userId}`)
      return api.post('/notification/notification/email/send', { to: { email: u.data.result.email }, subject: 'Borrow reminder', htmlContent: 'Please return your book on time.' })
    }
  })
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Manage Borrows</h2>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by userId/bookId" className="border rounded px-3 py-2 w-64" />
      </div>
      <div className="space-y-3">
        {list.map((t:any) => (
          <div key={t.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Tx #{t.id}</div>
              <div className="text-sm text-gray-500">user: {t.userId} • book: {t.bookId} • status: {t.status}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={()=>approve.mutate(t)}>Approve</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>reject.mutate(t.id)}>Reject</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>remind.mutate(t)}>Remind</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
