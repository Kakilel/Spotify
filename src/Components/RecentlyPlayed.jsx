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
      <h2 className="text-2xl text-purple-400 font-semibold mb-4">Recently Played</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((item, i) => (
          <div
            key={i}
            className="bg-gray-900 text-white rounded-lg p-4"
          >
            <img
              src={item.track.album.images[0]?.url}
              alt={item.track.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <p className="font-bold">{item.track.name}</p>
            <p className="text-sm text-gray-400">
              {item.track.artists.map((a) => a.name).join(", ")}
            </p>
            {item.track.preview_url && (
              <audio
                controls
                className="mt-2 w-full"
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
