import { useEffect, useState } from "react";
import axios from "axios";
import ArtistMinutes from "./ArtistMinutes";

function TopArtists({ token, userId }) {
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!token) return;

    axios
      .get("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setArtists(res.data.items))
      .catch((err) => console.error("Error fetching top artists:", err));
  }, [token]);

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Your Top Artists
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="bg-gray-900 rounded-xl p-4 shadow-lg hover:shadow-purple-500/30 transform transition duration-300 hover:scale-105 text-white"
          >
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              className="rounded w-full h-48 object-cover mb-3"
            />
            <p className="font-semibold text-lg truncate">{artist.name}</p>
            <p className="text-sm text-gray-300 mb-1">
              Genres: {artist.genres.slice(0, 3).join(", ") || "N/A"}
            </p>
            <p className="text-sm text-gray-400 mb-3">
              Followers: {artist.followers.total.toLocaleString()}
            </p>

            <button
              onClick={() =>
                setSelected(
                  selected?.id === artist.id
                    ? null
                    : { id: artist.id, name: artist.name }
                )
              }
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm px-4 py-2 rounded-full font-medium hover:brightness-110 transition mb-2"
            >
              {selected?.id === artist.id ? "Hide Minutes" : "View Minutes"}
            </button>

            {selected?.id === artist.id && (
              <ArtistMinutes
                token={token}
                artistId={artist.id}
                artistName={artist.name}
                userId={userId}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopArtists;
