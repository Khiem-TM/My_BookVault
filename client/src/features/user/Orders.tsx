import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/apiClient'

export default function Orders() {
  const qc = useQueryClient()
  const userId = 1
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => (await api.get(`/order/orders/by-user/${userId}`)).data
  })
  const create = useMutation({
    mutationFn: async () => (await api.post('/order/orders', { userId, bookId: 1001 })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', userId] })
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <img src="/user/8.png" alt="design" className="h-10" />
        <h2 className="text-xl font-semibold">Orders</h2>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">{(error as any).message}</div>}
      <button className="mb-4 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => create.mutate()}>Create Order</button>
      <div className="grid md:grid-cols-2 gap-4">
        {(data || []).map((o: any) => (
          <div key={o.id || Math.random()} className="border rounded p-4">
            <div className="font-medium">Order #{o.id}</div>
            <div className="text-sm text-gray-500">Status: {o.status || 'PENDING'}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
