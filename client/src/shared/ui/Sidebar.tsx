import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="border-r w-56 p-4 space-y-2">
      <NavLink to="/" className="block">
        Home
      </NavLink>
      <NavLink to="/books" className="block">
        Books
      </NavLink>
      <NavLink to="/playlists" className="block">
        My Playlists
      </NavLink>
      <NavLink to="/library" className="block">
        My Library
      </NavLink>
      <NavLink to="/orders" className="block">
        Orders
      </NavLink>
      <NavLink to="/genres" className="block">
        Genres
      </NavLink>
      <NavLink to="/history" className="block">
        History
      </NavLink>
      <NavLink to="/profile" className="block">
        Profile
      </NavLink>
      <div className="pt-2 text-xs text-gray-500">
        Chatbot, Group chat (placeholder)
      </div>
    </aside>
  );
}
