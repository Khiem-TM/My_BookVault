import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/apiClient'

export default function History() {
  const userId = 1
  const { data, isLoading, error } = useQuery({
    queryKey: ['history', userId],
    queryFn: async () => (await api.get(`/transaction/transactions/by-user/${userId}`)).data
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <img src="/user/7.png" alt="history" className="w-full rounded mb-6" />
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">{(error as any).message}</div>}
      <div className="space-y-3">
        {(data||[]).map((t:any) => (
          <div key={t.id} className="border rounded p-4">
            <div className="font-medium">{t.action || 'BORROW'}</div>
            <div className="text-sm text-gray-500">bookId: {t.bookId}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
