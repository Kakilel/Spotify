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
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Your Spotify Playlists
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/30 transition duration-300 transform hover:scale-105"
          >
            <img
              src={playlist.images[0]?.url}
              alt={playlist.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="font-semibold text-lg truncate">{playlist.name}</p>
              <p className="text-sm text-gray-400 mb-2">
                Tracks: {playlist.tracks.total}
              </p>
              {playlist.external_urls.spotify && (
                <a
                  href={playlist.external_urls.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs px-3 py-1 rounded-full font-medium hover:brightness-110 transition"
                >
                  Open in Spotify
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playlists;
