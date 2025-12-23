import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../../services/apiClient'
import { Check, X, Bell } from "lucide-react";

export default function TotalBorrows() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'requests' | 'history'>('requests')
  
  // Fetch all transactions (Admin endpoint)
  const { data, isLoading } = useQuery({ 
    queryKey: ['txs'], 
    queryFn: async () => (await api.get('/transaction')).data.result // Assuming successResponse wrapper returns { code, result: [...] }
  })
  // Filter client-side
  const list = useMemo(() => {
    const all = Array.isArray(data) ? data : [];
    return all.filter((t:any) => {
       const matchesSearch = !search || String(t.userId).toLowerCase().includes(search.toLowerCase()) || String(t.bookId).toString().includes(search);
       
       if (tab === 'requests') {
           return matchesSearch && t.status === 'PENDING';
       } else {
           return matchesSearch && t.status !== 'PENDING';
       }
    });
  }, [data, search, tab])

  const approve = useMutation({
    mutationFn: async (id: number) => api.post(`/transaction/approve/${id}`),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['txs'] });
        alert("Transaction approved!");
    },
    onError: (err: any) => alert(err.message || "Failed to approve")
  })

  // ... (keep remove/remind mutations same)
  const remove = useMutation({
    mutationFn: async (id:number) => api.delete(`/transaction/${id}`),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['txs'] });
        alert("Transaction record deleted");
    },
    onError: (err: any) => alert(err.message || "Failed to delete")
  })
  
  const remind = useMutation({
    mutationFn: async (t:any) => {
      // Mock reminder for now
      alert(`Reminder sent to user ${t.userId}`);
    }
  })

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading transactions...</div>

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Borrows</h2>
            <p className="text-gray-500 text-sm mt-1">Approve rentals and view history</p>
        </div>
        
        <div className="flex gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setTab('requests')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Requests
                </button>
                <button 
                    onClick={() => setTab('history')}
                     className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    History
                </button>
            </div>
            
            <input 
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
                placeholder="Search User ID..." 
                className="border border-gray-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
        </div>
      </div>

      <div className="space-y-4">
        {list.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">No {tab === 'requests' ? 'pending requests' : 'history records'} found.</p>
            </div>
        )}
        
        {list.map((t:any) => (
          <div key={t.id} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl p-5 border border-gray-100 flex items-center justify-between">
            <div className="flex gap-4 items-center">
               <div className={`p-3 rounded-full ${t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                   {t.status === 'PENDING' ? <Bell size={20} /> : <Check size={20} />}
               </div>
               <div>
                  <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-gray-900">{t.book?.title || `Book #${t.bookId}`}</h3>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                         t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                         t.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                         t.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                         'bg-gray-100 text-gray-600'
                       }`}>
                           {t.status}
                       </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                      User: <span className="font-mono text-gray-700 bg-gray-50 px-1 rounded">{t.userId}</span> • Rent: <span className="text-green-600 font-medium">${t.book?.rentalPrice || '0.00'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                      {new Date(t.borrowDate).toLocaleDateString()} — {new Date(t.dueDate).toLocaleDateString()}
                  </div>
               </div>
            </div>

            <div className="flex gap-2">
              {t.status === 'PENDING' && (
                  <>
                    <button 
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition shadow-sm hover:shadow" 
                        onClick={()=>approve.mutate(t.id)}
                        disabled={approve.isPending}
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button 
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition" 
                        onClick={()=>remove.mutate(t.id)}
                        disabled={remove.isPending}
                    >
                        <X size={16} /> Reject
                    </button>
                  </>
              )}
              {t.status === 'ACTIVE' && (
                  <button 
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-600 font-medium text-sm hover:bg-blue-50 transition" 
                    onClick={()=>remind.mutate(t)}
                  >
                    <Bell size={16} /> Remind
                  </button>
              )}
               {t.status !== 'PENDING' && (
                   <button 
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" 
                        onClick={()=>remove.mutate(t.id)}
                        title="Delete Record"
                    >
                        <X size={18} />
                    </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
