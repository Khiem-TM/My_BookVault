import { useEffect, useState } from 'react'
import { api } from '../../services/apiClient'

export default function AdminProfile() {
  const [data, setData] = useState<any>()
  useEffect(() => { api.get('/identity/identity/users/my-info').then(r=>setData(r.data.result)) }, [])
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-200 to-purple-200" />
        <div>
          <div className="text-xl font-semibold">{data?.username || 'Admin'}</div>
          <div className="text-gray-600">{data?.email}</div>
        </div>
      </div>
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">User ID</div>
          <div className="font-medium">{data?.id}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">Email Verified</div>
          <div className="font-medium">{String(data?.emailVerified)}</div>
        </div>
      </div>
    </section>
  )
}
