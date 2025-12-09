import { Link, Route, Routes, NavLink } from 'react-router-dom'
import Home from './features/user/Home'
import BooksList from './features/user/BooksList'
import BookDetail from './features/user/BookDetail'
import Orders from './features/user/Orders'
import LibraryShelf from './features/user/LibraryShelf'
import AdminDashboard from './features/admin/AdminDashboard'
import DatabaseView from './features/admin/DatabaseView'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">MyBook</Link>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/books" className={({isActive}) => isActive ? 'text-blue-600' : ''}>Books</NavLink>
            <NavLink to="/library" className={({isActive}) => isActive ? 'text-blue-600' : ''}>Library</NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? 'text-blue-600' : ''}>Orders</NavLink>
            <NavLink to="/admin" className={({isActive}) => isActive ? 'text-blue-600' : ''}>Admin</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/books" element={<BooksList/>} />
          <Route path="/books/:id" element={<BookDetail/>} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/library" element={<LibraryShelf/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/admin/database" element={<DatabaseView/>} />
        </Routes>
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">© MyBook</div>
      </footer>
    </div>
  )
}
