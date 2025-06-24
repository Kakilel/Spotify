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
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Recently Played
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((item, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-xl p-4 text-white shadow-lg hover:shadow-purple-500/30 transition-transform duration-300 transform hover:scale-105"
          >
            <img
              src={item.track.album.images[0]?.url}
              alt={item.track.name}
              className="rounded w-full h-48 object-cover mb-3"
            />
            <p className="font-semibold text-lg truncate">{item.track.name}</p>
            <p className="text-sm text-gray-400 mb-2 truncate">
              {item.track.artists.map((a) => a.name).join(", ")}
            </p>
            {item.track.preview_url && (
              <audio
                controls
                className="w-full mt-2"
                src={item.track.preview_url}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyPlayed;
