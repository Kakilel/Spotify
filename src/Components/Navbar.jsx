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
    <nav className="bg-bg-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md relative">
      <h1 className="text-2xl font-extrabold text-primary-300 tracking-tight drop-shadow-sm">
        Spotify Stats
      </h1>

      {token && user ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 bg-bg-300 text-text-100 px-4 py-2 rounded-full hover:bg-primary-200 transition"
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium">{user.displayName || user.email}</span>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-52 bg-bg-300 text-white rounded shadow-xl border border-bg-100 z-50 overflow-hidden"
              >
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-bg-300 text-text-100 px-4 py-2 border-b border-primary-200 focus:outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-primary-100 hover:text-white transition"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <a href="/api/login" className="text-accent-200 hover:underline text-sm">
          Login with Spotify
        </a>
      )}
    </nav>
  );
}

export default Navbar;
