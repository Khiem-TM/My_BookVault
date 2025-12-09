export default function BookCard({ book }: { book: any }) {
  return (
    <div className="border rounded p-4 hover:shadow transition">
      <div className="h-32 bg-gray-100 rounded mb-3"></div>
      <div className="font-medium">{book.title || 'Book'}</div>
      <div className="text-sm text-gray-500">{book.author || ''}</div>
    </div>
  )
}
