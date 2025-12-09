import { Link, Route, Routes, NavLink } from 'react-router-dom'
import Home from './features/user/Home'
import BooksList from './features/user/BooksList'
import BookDetail from './features/user/BookDetail'
import Orders from './features/user/Orders'
import LibraryShelf from './features/user/LibraryShelf'
import Profile from './features/user/Profile'
import Genres from './features/user/Genres'
import History from './features/user/History'
import AdminDashboard from './features/admin/AdminDashboard'
import DatabaseView from './features/admin/DatabaseView'
import AuthPage from './features/auth/AuthPage'
import TotalBooks from './features/admin/TotalBooks'
import TotalUsers from './features/admin/TotalUsers'
import TotalBorrows from './features/admin/TotalBorrows'

function Protected({ children, role }: { children: JSX.Element, role?: 'ADMIN'|'USER' }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const r = typeof window !== 'undefined' ? localStorage.getItem('role') as ('ADMIN'|'USER'|null) : null
  if (!token) return <AuthPage/>
  if (role && r !== role) return <div className="p-8">No access</div>
  return children
}

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
          <Route path="/auth" element={<AuthPage/>} />
          <Route path="/" element={<Protected><Home/></Protected>} />
          <Route path="/books" element={<Protected><BooksList/></Protected>} />
          <Route path="/books/:id" element={<Protected><BookDetail/></Protected>} />
          <Route path="/orders" element={<Protected><Orders/></Protected>} />
          <Route path="/library" element={<Protected><LibraryShelf/></Protected>} />
          <Route path="/profile" element={<Protected><Profile/></Protected>} />
          <Route path="/genres" element={<Protected><Genres/></Protected>} />
          <Route path="/history" element={<Protected><History/></Protected>} />
          <Route path="/admin" element={<Protected role='ADMIN'><AdminDashboard/></Protected>} />
          <Route path="/admin/database" element={<Protected role='ADMIN'><DatabaseView/></Protected>} />
          <Route path="/admin/total-books" element={<Protected role='ADMIN'><TotalBooks/></Protected>} />
          <Route path="/admin/total-users" element={<Protected role='ADMIN'><TotalUsers/></Protected>} />
          <Route path="/admin/total-borrows" element={<Protected role='ADMIN'><TotalBorrows/></Protected>} />
        </Routes>
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">© MyBook</div>
      </footer>
    </div>
  )
}
