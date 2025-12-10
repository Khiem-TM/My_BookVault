import AdminHeader from './AdminHeader'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader/>
      <main className="flex-1">
        <Outlet/>
      </main>
    </div>
  )
}
