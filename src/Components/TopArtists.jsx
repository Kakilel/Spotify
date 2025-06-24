import { useEffect, useState } from "react";
import axios from "axios";
import ArtistMinutes from "./ArtistMinutes";

function TopArtists({ token }) {
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArtists(res.data.items));
  }, [token]);

  return (
    <div>
      <h2>Top Artists</h2>
      <ul>
        {artists.map((artist) => (
          <li key={artist.id}>
            <button onClick={() => setSelectedArtist(artist.name)}>
              {artist.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedArtist && (
        <ArtistMinutes token={token} artistName={selectedArtist} />
      )}
    </div>
  );
}

export default TopArtists;
