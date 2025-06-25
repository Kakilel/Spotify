import { useEffect, useState } from "react";
import TopArtists from "./Components/TopArtists";
import ArtistMinutes from "./Components/ArtistMinutes";
import TopTracks from "./Components/TopTracks";
import Playlists from "./Components/Playlists";
import RecentlyPlayed from "./Components/RecentlyPlayed";
import UserProfile from "./Components/UserProfile";
import Landing from "./Components/Landing";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "top-artists", label: "Top Artists" },
  { id: "top-tracks", label: "Top Tracks" },
  { id: "playlists", label: "Playlists" },
  { id: "recently-played", label: "Recently Played" },
  { id: "artist-minutes", label: "Artist Minutes" },
  
];

function App() {
  const [token, setToken] = useState(null);
  const [selected, setSelected] = useState("profile");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("access_token");
    if (t) setToken(t);
  }, []);

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Navbar */}
     <nav className="bg-gray-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
  <h1 className="text-2xl font-extrabold text-purple-400 tracking-tight drop-shadow-sm">
    Spotify Stats
  </h1>

  {!token ? (
   <a href=""></a>
  ) : (
    <select
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      className="bg-gray-800 text-white border border-purple-500 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
    >
      {sections.map((section) => (
        <option key={section.id} value={section.id}>
          {section.label}
        </option>
      ))}
    </select>
  )}
</nav>


      {/* Main Content */}
      <div className="p-6 space-y-6">
        {!token && <Landing/>}
        {token && selected === "profile" && <UserProfile token={token} />}
        {token && selected === "top-artists" && <TopArtists token={token} />}
        {token && selected === "top-tracks" && <TopTracks token={token} />}
        {token && selected === "playlists" && <Playlists token={token} />}
        {token && selected === "recently-played" && <RecentlyPlayed token={token} />}
      </div>
    </div>
  );
}

export default App;
