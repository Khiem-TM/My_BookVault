import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/apiClient'

export default function BookDetail() {
  const { id } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => (await api.get(`/book/books/${id}`)).data,
    enabled: !!id
  })

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <img src="/user/7.png" alt="design" className="w-full rounded mb-6" />
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">{(error as any).message}</div>}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">{data.title || 'Book'}</h1>
            <p className="text-gray-600">{data.author || ''}</p>
            <button className="mt-4 px-4 py-2 rounded bg-blue-600 text-white">Add to Orders</button>
          </div>
        </div>
      )}
    </section>
  )
}
