import { Route, Routes } from 'react-router-dom'
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
import { JSX } from 'react'
import Layout from './shared/ui/Layout'
import AdminLayout from './features/admin/AdminLayout'
import AdminProfile from './features/admin/AdminProfile'

function Protected({ children, role }: { children: JSX.Element, role?: 'ADMIN'|'USER' }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const r = typeof window !== 'undefined' ? localStorage.getItem('role') as ('ADMIN'|'USER'|null) : null
  if (!token) return <AuthPage/>
  if (role && r !== role) return <div className="p-8">No access</div>
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage/>} />
      <Route element={<Protected><Layout/></Protected>}>
        <Route index element={<Home/>} />
        <Route path="books" element={<BooksList/>} />
        <Route path="books/:id" element={<BookDetail/>} />
        <Route path="orders" element={<Orders/>} />
        <Route path="library" element={<LibraryShelf/>} />
        <Route path="profile" element={<Profile/>} />
        <Route path="genres" element={<Genres/>} />
        <Route path="history" element={<History/>} />
      </Route>
      <Route element={<Protected role='ADMIN'><AdminLayout/></Protected>}>
        <Route path="admin" element={<AdminDashboard/>} />
        <Route path="admin/database" element={<DatabaseView/>} />
        <Route path="admin/total-books" element={<TotalBooks/>} />
        <Route path="admin/total-users" element={<TotalUsers/>} />
        <Route path="admin/total-borrows" element={<TotalBorrows/>} />
        <Route path="admin/profile" element={<AdminProfile/>} />
      </Route>
    </Routes>
  )
}
