import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/apiClient'

export default function LibraryShelf() {
  const [shelf, setShelf] = useState('WISHLIST')
  const userId = 1
  const { data, isLoading, error } = useQuery({
    queryKey: ['library', userId, shelf],
    queryFn: async () => (await api.get(`/library/items/by-shelf`, { params: { userId, shelf } })).data
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        <img src="/user/9.png" alt="design" className="h-10" />
        <h2 className="text-xl font-semibold">Library</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {['WISHLIST','READING','READ'].map(x => (
          <button key={x} className={`px-3 py-1 rounded border ${shelf===x?'bg-blue-600 text-white':'bg-white'}`} onClick={() => setShelf(x)}>{x}</button>
        ))}
      </div>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">{(error as any).message}</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {(data || []).map((i: any) => (
          <div key={i.id || Math.random()} className="border rounded p-4">
            <div className="font-medium">Book #{i.bookId}</div>
            <div className="text-sm text-gray-500">Shelf: {i.shelf}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
