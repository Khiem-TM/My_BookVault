export default function Home() {
  return (
    <section className="relative">
      <img src="/user/1.png" alt="design" className="w-full h-[40vh] object-cover" />
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Discover Books</h1>
          <p className="mt-2 text-gray-600">Browse and manage your library, orders and reviews.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <img src="/user/2.png" alt="section" className="rounded" />
          <img src="/user/3.png" alt="section" className="rounded" />
          <img src="/user/4.png" alt="section" className="rounded" />
          <img src="/user/5.png" alt="section" className="rounded" />
        </div>
      </div>
    </section>
  )
}
