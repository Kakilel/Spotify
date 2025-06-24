import { useEffect, useState } from "react";
import axios from "axios";

function Playlists({ token }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/playlists?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlaylists(res.data.items));
  }, [token]);

  return (
    <div>
      <h2 className="text-2xl text-purple-400 font-semibold mb-4">Your Playlists</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-gray-900 rounded-lg p-4 text-white"
          >
            <img
              src={playlist.images[0]?.url}
              alt={playlist.name}
              className="rounded w-full h-40 object-cover mb-2"
            />
            <p className="font-bold truncate">{playlist.name}</p>
            <p className="text-sm text-gray-400">
              Tracks: {playlist.tracks.total}
            </p>
            {playlist.external_urls.spotify && (
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 text-sm underline hover:text-purple-300"
              >
                Open in Spotify
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlists;
