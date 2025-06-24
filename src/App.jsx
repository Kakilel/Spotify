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
    <div>
      <h1>Spotify Lifetime Stats</h1>
      {!token ? (
        <a href="/api/login">
          <button>Login with Spotify</button>
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
