import { NavLink, Link, useNavigate } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = term.trim()
    if (q) navigate(`/books?search=${encodeURIComponent(q)}`)
  }
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="h-7 w-7 text-blue-600 transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold tracking-tight">BookVault</span>
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <NavLink to="/books" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Browse</NavLink>
            <NavLink to="/library" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>My Library</NavLink>
            <NavLink to="/genres" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Categories</NavLink>
            <NavLink to="/orders" className={({isActive})=>`px-3 py-2 rounded hover:bg-blue-50 transition ${isActive?'text-blue-600 font-medium':'text-gray-700'}`}>Orders</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={submit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search books, authors..." className="pl-9 pr-3 py-2 w-56 md:w-72 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </form>
          <NavLink to="/profile" className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 transition">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-200 to-purple-200" />
            <span className="hidden md:inline text-sm">Profile</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}
