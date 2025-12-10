import Header from './Header'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <main className="flex-1">
        <Outlet/>
      </main>
    </div>
  )
}
