import { useEffect, useState } from "react";
import axios from "axios";
import ArtistMinutes from "./ArtistMinutes";

function TopArtists({ token }) {
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArtists(res.data.items))
      .catch((err) => console.error("Failed to fetch top artists:", err));
  }, [token]);

  return (
    <div>
      <h2>Top Artists (All Time)</h2>
      <ul>
        {artists.map((artist) => (
          <li key={artist.id}>
            <button onClick={() => setSelected(artist.name)}>
              {artist.name}
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <ArtistMinutes token={token} artistName={selected} />
      )}
    </div>
  );
}

export default TopArtists;
