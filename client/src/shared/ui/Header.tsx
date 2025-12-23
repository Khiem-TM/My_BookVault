import { NavLink, useNavigate } from "react-router-dom";
import { Search, LogOut, User, Settings, X, ShoppingBag, Bell, Info } from "lucide-react";
import { useState, Fragment } from "react";
import { Dialog, Transition, Popover } from "@headlessui/react";
import { useAuthStore } from "../../store/authStore";

const NotificationPopover = () => {
    return (
        <Popover className="relative">
            <Popover.Button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors bg-transparent border-0 outline-none">
                <Bell className="h-6 w-6" />
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute right-0 z-50 mt-2 w-80">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="bg-white p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Notifications</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">Welcome to BookVault!</p>
                                        <p className="text-xs text-gray-500 mt-1">Start browsing books and create your first playlist.</p>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-gray-500 py-2">
                                    No new notifications
                                </div>
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { logout, user } = useAuthStore();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTerm.trim()) {
        navigate(`/books?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserModalOpen(false);
    navigate("/auth");
  };

  const openUserModal = () => setIsUserModalOpen(true);
  const closeUserModal = () => setIsUserModalOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink
            to="/"
            className="font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            BookVault
          </NavLink>

          {/* Search */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books, authors..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 md:gap-2 text-sm font-medium">
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              Browse
            </NavLink>
            <NavLink
              to="/playlists"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              My Library
            </NavLink>
            <NavLink
              to="/genres"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              Community
            </NavLink>
             <NavLink
              to="/chat"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              Messages
            </NavLink>
          </nav>

          {/* User Actions - Avatar & Icons */}
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
             {/* Shopping Cart (Orders) */}
             <NavLink
               to="/orders"
               className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
               title="My Orders"
             >
                <ShoppingBag className="h-6 w-6" />
             </NavLink>

             {/* Notifications */}
             <NotificationPopover />

            <button
              onClick={openUserModal}
              className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-2 ring-transparent hover:ring-blue-200 transition-all shadow-sm"
              title="User Actions"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* User Modal */}
      <Transition appear show={isUserModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeUserModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900"
                    >
                      User Menu
                    </Dialog.Title>
                    <button
                      onClick={closeUserModal}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* User Info Preview */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-2">
                       <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                       </div>
                       <div>
                          <p className="font-semibold text-gray-900">{user?.username || "Guest"}</p>
                          <p className="text-xs text-gray-500">{user?.email || "No email"}</p>
                       </div>
                    </div>

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        closeUserModal();
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium group"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        // navigate("/settings"); // Placeholder
                        closeUserModal();
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium group"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                        <Settings className="h-5 w-5" />
                      </div>
                      System Settings
                    </button>

                     <div className="h-px bg-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 transition-colors text-red-600 font-medium group"
                    >
                      <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-5 w-5" />
                      </div>
                      Log Out
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
