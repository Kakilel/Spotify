import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import Login from "./Components/Login"; // your Firebase login page
import Navbar from "./Components/Navbar";
import Landing from "./Components/Landing";
import UserProfile from "./Components/UserProfile";
import TopArtists from "./Components/TopArtists";
import ArtistMinutes from "./Components/ArtistMinutes";
import TopTracks from "./Components/TopTracks";
import Playlists from "./Components/Playlists";
import RecentlyPlayed from "./Components/RecentlyPlayed";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "top-artists", label: "Top Artists" },
  { id: "top-tracks", label: "Top Tracks" },
  { id: "playlists", label: "Playlists" },
  { id: "recently-played", label: "Recently Played" },
  { id: "artist-minutes", label: "Artist Minutes" },
];

function Dashboard({ token, user, selected, setSelected, setToken }) {
  return (
    <>
      <Navbar
        token={token}
        user={user}
        setToken={setToken}
        selected={selected}
        setSelected={setSelected}
        sections={sections}
      />
      <div className="p-6 space-y-6">
        {!token && <Landing />}
        {token && selected === "profile" && <UserProfile token={token} />}
        {token && selected === "top-artists" && <TopArtists token={token} userId={user?.uid} />}
        {token && selected === "top-tracks" && <TopTracks token={token} />}
        {token && selected === "playlists" && <Playlists token={token} />}
        {token && selected === "recently-played" && <RecentlyPlayed token={token} />}
        {token && selected === "artist-minutes" && (
          <ArtistMinutes
            token={token}
            artistId=""
            artistName="..."
            userId={user?.uid}
          />
        )}
      </div>
    </>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState("profile");
  const [loading, setLoading] = useState(true);

  // Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Spotify token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("access_token");
    if (t) setToken(t);
  }, []);

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <Router>
      <div className="bg-black min-h-screen text-white">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
