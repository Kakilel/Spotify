import { useEffect, useState } from "react";
import axios from "axios";

function TopTracks({ token }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setTracks(res.data.items));
  }, [token]);

  return (
    <div>
      <h2>Top Tracks</h2>
      <ul>
        {tracks.map(track => (
          <li key={track.id}>{track.name} – {track.artists[0].name}</li>
        ))}
      </ul>
    </div>
  );
}

export default TopTracks;
