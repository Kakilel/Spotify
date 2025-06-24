import { useEffect, useState } from "react";
import axios from "axios";

function Playlists({ token }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPlaylists(res.data.items));
  }, [token]);

  return (
    <div>
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  );
}

export default Playlists;
