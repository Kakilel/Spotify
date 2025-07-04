import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import {
  FaSpotify,
  FaGithub,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const AVAILABLE_APPS = [
  { name: "Spotify", icon: <FaSpotify className="text-green-400" />, path: "/spotify" },
  { name: "GitHub", icon: <FaGithub className="text-gray-300" />, path: "/github" },
  { name: "Instagram", icon: <FaInstagram className="text-pink-500" />, path: "/instagram" },
  { name: "Twitter", icon: <FaTwitter className="text-blue-400" />, path: "/twitter" },
];

function Dash({ user, onLogin }) {
  const [showApps, setShowApps] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [addedApps, setAddedApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const navigate = useNavigate();

  // Memoized available apps
  const appOptions = useMemo(() =>
    AVAILABLE_APPS.filter(app => !addedApps.find(a => a.name === app.name)),
    [addedApps]
  );

  // Fetch user apps once
  useEffect(() => {
    if (!user) return;

    const loadUserApps = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const storedAppNames = docSnap.data()?.apps || [];
          const userApps = storedAppNames
            .map(name => AVAILABLE_APPS.find(app => app.name === name))
            .filter(Boolean);
          setAddedApps(userApps);
        }
      } catch (err) {
        console.error("Error loading user apps:", err);
      }
    };

    loadUserApps();
  }, [user]);

  // Save when addedApps changes
  useEffect(() => {
    if (!user || addedApps.length === 0) return;

    const saveUserApps = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { apps: addedApps.map(app => app.name) }, { merge: true });
      } catch (err) {
        console.error("Error saving user apps:", err);
      }
    };

    saveUserApps();
  }, [addedApps, user]);

  // OAuth redirect handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    if (token) {
      window.history.replaceState(null, null, "/spotify?access_token=" + token);
      navigate("/spotify?access_token=" + token);
    }
  }, [navigate]);

  const addApp = useCallback((name) => {
    if (!addedApps.find(app => app.name === name)) {
      const foundApp = AVAILABLE_APPS.find(app => app.name === name);
      if (foundApp) {
        setAddedApps(prev => [...prev, foundApp]);
        setSelectedApp("");
      }
    }
  }, [addedApps]);

  const removeApp = useCallback((name) => {
    setAddedApps(prev => prev.filter(app => app.name !== name));
  }, []);

  return (
    <div className="min-h-screen bg-bg-100 text-text-100 relative">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-bg-200">
        <h1 className="text-2xl font-bold text-primary-300">Cink</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={() => setShowApps(p => !p)} className="text-text-100 hover:text-primary-300">Apps</button>
              <button onClick={() => signOut(auth)} className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 text-sm">Logout</button>
            </>
          ) : (
            <button onClick={() => setShowLoginForm(true)} className="bg-accent-100 px-4 py-2 rounded hover:bg-accent-200 text-text-100">Login</button>
          )}
        </div>
      </nav>

      {/* Apps Dropdown */}
      <AnimatePresence>
        {showApps && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-6 top-16 bg-bg-300 shadow-lg rounded-lg w-56 z-50"
          >
            <ul className="divide-y divide-bg-200">
              {addedApps.length === 0 ? (
                <li className="px-4 py-2 text-text-200 text-sm">No apps added</li>
              ) : (
                addedApps.map(app => (
                  <li
                    key={app.name}
                    className="px-4 py-2 hover:bg-primary-200 cursor-pointer flex justify-between items-center"
                    onClick={() => navigate(app.path)}
                  >
                    <div className="flex items-center gap-2">
                      {app.icon}
                      {app.name}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeApp(app.name);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {!user && showLoginForm && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="relative">
              <button
                onClick={() => setShowLoginForm(false)}
                className="absolute top-2 right-2 text-text-100 text-2xl font-bold hover:text-primary-200 z-10"
              >
                &times;
              </button>
              <Login onLogin={(user) => { onLogin(user); setShowLoginForm(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest View */}
      {!user && !showLoginForm && (
        <section className="flex flex-col items-center justify-center text-center px-4 py-20">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold mb-4 text-primary-200 drop-shadow">
            Welcome to Cink
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            className="text-text-200 max-w-xl text-lg">
            Sync and manage all your favorite platforms in one dashboard.
          </motion.p>
          <motion.button
            onClick={() => setShowLoginForm(true)}
            className="mt-8 bg-accent-100 px-6 py-3 rounded-full font-semibold text-text-100 hover:bg-accent-200 transition"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </section>
      )}

      {/* Authenticated View */}
      {user && (
        <section className="px-6 py-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-primary-300">Welcome back, {user.email}</h2>
          <p className="text-text-200 mb-6">Add apps to your dashboard. Click an app to manage it individually.</p>

          <div className="bg-bg-300 p-6 rounded-lg shadow-md">
            <label htmlFor="app-select" className="block text-sm mb-2">Choose an app to add:</label>
            <select
              id="app-select"
              onChange={(e) => addApp(e.target.value)}
              value={selectedApp}
              className="w-full bg-bg-200 text-text-100 rounded px-4 py-2 mb-4"
            >
              <option value="">Select an app</option>
              {appOptions.map(app => (
                <option key={app.name} value={app.name}>{app.name}</option>
              ))}
            </select>

            {addedApps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-text-100">Your Apps:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {addedApps.map(app => (
                    <div
                      key={app.name}
                      onClick={() => navigate(app.path)}
                      className="bg-bg-200 p-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-primary-100 transition"
                    >
                      {app.icon}
                      <span className="text-text-100 font-medium">{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dash;
