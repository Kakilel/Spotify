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
      .then((res) => setArtists(res.data.items));
  }, [token]);

  return (
    <div>
      <h2 className="text-2xl text-purple-400 font-semibold mb-4">Top Artists</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-gray-900 rounded-lg p-4">
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              className="rounded mb-2 w-full h-40 object-cover"
            />
            <p className="font-bold">{artist.name}</p>
            <p className="text-sm text-gray-300">Genres: {artist.genres.join(", ")}</p>
            <p className="text-sm text-gray-400">
              Followers: {artist.followers.total.toLocaleString()}
            </p>
            <button
              onClick={() => setSelected({id:artist.id, name:artist.name})}
              className="mt-2 bg-purple-600 px-2 py-1 rounded hover:bg-purple-500"
            >
              View Minutes
            </button>
          </div>
        ))}
      </div>
      {selected && <ArtistMinutes token={token} artistId={selected.id} artistName={selected.name} />}
    </div>
  );
}

export default TopArtists;
