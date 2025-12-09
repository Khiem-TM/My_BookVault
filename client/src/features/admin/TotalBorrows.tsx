export default function TotalBorrows() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <img src="/admin/4.png" alt="total-borrows" className="w-full rounded mb-6" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="border rounded p-4 flex items-center justify-between">
            <div>Borrow #{i}</div>
            <button className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}
