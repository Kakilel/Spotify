import { useEffect, useState } from "react";
import axios from "axios";

function TopTracks({ token }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTracks(res.data.items));
  }, [token]);

  return (
    <div>
      <h2 className="text-2xl text-purple-400 font-semibold mb-4">Top Tracks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-gray-900 text-white rounded-lg p-4"
          >
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <p className="font-bold">{track.name}</p>
            <p className="text-sm text-gray-400">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
            {track.preview_url && (
              <audio controls className="w-full mt-2" src={track.preview_url} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopTracks;
