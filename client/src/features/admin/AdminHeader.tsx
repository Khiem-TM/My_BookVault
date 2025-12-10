import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { api } from '../../services/apiClient'

export default function AdminHeader() {
  const navigate = useNavigate()
  async function logout() {
    const token = localStorage.getItem('token')
    try { if (token) await api.post('/identity/identity/auth/logout', { token }) } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/auth')
  }
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">Admin</div>
        <nav className="flex items-center gap-2 text-sm">
          <NavLink to="/admin" end className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Dashboard</NavLink>
          <NavLink to="/admin/total-books" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Total Books</NavLink>
          <NavLink to="/admin/total-borrows" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Total Borrow</NavLink>
          <NavLink to="/admin/total-users" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Total User</NavLink>
          <NavLink to="/admin/profile" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Profile</NavLink>
        </nav>
        <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 text-red-600 transition">
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline text-sm">Logout</span>
        </button>
      </div>
    </header>
  )
}
