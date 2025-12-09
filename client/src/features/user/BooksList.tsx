import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/apiClient'
import { Link } from 'react-router-dom'

export default function BooksList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => (await api.get('/book/books')).data
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <img src="/user/6.png" alt="design" className="h-12" />
        <h2 className="text-xl font-semibold">Books</h2>
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">{(error as any).message}</div>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(data || []).map((b: any) => (
          <Link key={b.id || b.bookId || Math.random()} to={`/books/${b.id || b.bookId || ''}`} className="border rounded p-4 hover:shadow">
            <div className="h-32 bg-gray-100 rounded mb-3"></div>
            <div className="font-medium">{b.title || b.name || 'Book'}</div>
            <div className="text-sm text-gray-500">{b.author || ''}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
