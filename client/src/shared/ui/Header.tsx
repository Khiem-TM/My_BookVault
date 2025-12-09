import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <img src="/user/1.png" alt="logo" className="h-8 w-8 object-cover rounded" />
        <nav className="flex gap-3 text-sm">
          <NavLink to="/books" className={({isActive})=>isActive?'text-blue-600':''}>Books</NavLink>
          <NavLink to="/genres" className={({isActive})=>isActive?'text-blue-600':''}>Genres</NavLink>
          <NavLink to="/orders" className={({isActive})=>isActive?'text-blue-600':''}>Orders</NavLink>
          <NavLink to="/library" className={({isActive})=>isActive?'text-blue-600':''}>Library</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <input placeholder="Search books" className="border rounded px-3 py-1 w-48" />
          <NavLink to="/profile" className="text-sm">Profile</NavLink>
        </div>
      </div>
    </header>
  )
}
