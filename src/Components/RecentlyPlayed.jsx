import { useEffect, useState } from "react";
import axios from "axios";

function RecentlyPlayed({ token }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTracks(res.data.items));
  }, [token]);

  return (
    <div>
      <h2>Recently Played</h2>
      <ul>
        {tracks.map((item, i) => (
          <li key={i}>
            {item.track.name} – {item.track.artists[0].name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentlyPlayed;
