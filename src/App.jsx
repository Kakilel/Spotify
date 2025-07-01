import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

import Login from "./Components/Login";
import Dash from "./Components/Dash";
import SpotDash from "./Components/SpotDash";
import Landing from "./Components/Landing";
import Github from "./Components/Github";
import UserProfile from "./Components/UserProfile";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("access_token");
    if (t) setToken(t);
  }, []);

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <Router>
      <div className="bg-black min-h-screen text-white relative">
        <Routes>
          <Route
            path="/"
            element={<Dash user={user} onLogin={setUser} />}
          />
          <Route path="/spotdash" element={user ? (
                <SpotDash
                  token={token}
                  user={user}
                  selected={selected}
                  setSelected={setSelected}
                  setToken={setToken}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        <Route path='/spotify' element={token ? (
          <UserProfile token={token}/>
        ) : (
          <Navigate to='/'/>
        )}/>
          <Route path="/github" element={<Github />} />
        </Routes>

        {/* Modal Login */}
        <AnimatePresence>
          {!user && showLogin && (
            <motion.div
              key="login-modal"
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-400"
                >
                  &times;
                </button>
                <Login
                  onLogin={(user) => {
                    setUser(user);
                    setShowLogin(false);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
