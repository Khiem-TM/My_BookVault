import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <img src="/admin/1.png" alt="admin" className="rounded" />
        <img src="/admin/2.png" alt="admin" className="rounded" />
        <img src="/admin/3.png" alt="admin" className="rounded" />
        <img src="/admin/4.png" alt="admin" className="rounded" />
        <img src="/admin/5.png" alt="admin" className="rounded" />
      </div>
      <div className="mt-6">
        <Link to="/admin/database" className="px-4 py-2 rounded bg-blue-600 text-white">Database View</Link>
      </div>
    </section>
  )
}
