import { useEffect, useState } from "react";
import TopArtists from "./Components/TopArtists";
import ArtistMinutes from "./Components/ArtistMinutes";
import TopTracks from "./Components/TopTracks";
import Playlists from "./Components/Playlists";
import RecentlyPlayed from "./Components/RecentlyPlayed";
import UserProfile from "./Components/UserProfile";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("access_token");
    if (t) setToken(t);
  }, []);

 return (
  <div className="bg-black min-h-screen text-white p-4 space-y-6">
    <h1 className="text-3xl font-bold text-purple-400">Spotify Lifetime Stats</h1>
    {!token ? (
      <a href="/api/login">
        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 my-7 mx-12" >
          Login with Spotify
        </button>
      </a>
    ) : (
      <>
        <UserProfile token={token} />
        <TopArtists token={token} />
        <TopTracks token={token} />
        <Playlists token={token} />
        <RecentlyPlayed token={token} />
      </>
    )}
  </div>
);
}

export default App;
