import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "/firebase";

function Navbar({ token, user, setToken, selected, setSelected, sections }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    signOut(auth)
      .then(() => {
        setToken(null);
        window.history.replaceState({}, document.title, "/");
      })
      .catch((err) => console.error("Error signing out:", err));
  };

  return (
    <nav className="bg-gray-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md relative">
      <h1 className="text-2xl font-extrabold text-purple-400 tracking-tight drop-shadow-sm">
        Spotify Stats
      </h1>

      {token && user ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700"
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm">{user.displayName || user.email}</span>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-20"
              >
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-2 border-b border-purple-500 focus:outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <a href="/api/login"></a>
      )}
    </nav>
  );
}

export default Navbar;
