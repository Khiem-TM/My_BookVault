import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/apiClient'

export default function TotalBooks() {
  const { data } = useQuery({ queryKey: ['books'], queryFn: async () => (await api.get('/book/books')).data })
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <img src="/admin/2.png" alt="total-books" className="w-full rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-4">
        {(data||[]).map((b:any) => (
          <div key={b.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-500">{b.author}</div>
            </div>
            <button className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}
