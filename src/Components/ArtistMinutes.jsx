import { useEffect, useState } from "react";
import axios from "axios";

function ArtistMinutes({ token, artistId, artistName }) {
  const [minutes, setMinutes] = useState(null);

useEffect(() => {
  console.log("Fetching minutes for artistId:", artistId); // DEBUG
  axios
    .get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const artistTracks = res.data.items.filter((track) =>
        track.artists.some((a) => a.id === artistId)
      );
      console.log("Tracks matched:", artistTracks); // DEBUG
      const totalMs = artistTracks.reduce((sum, t) => sum + t.duration_ms * 10, 0);
      setMinutes(Math.round(totalMs / 60000));
    })
    .catch((err) => console.error("Error fetching top tracks:", err));
}, [token, artistId]);


  return (
    <div className="bg-gray-800 text-white p-4 rounded mt-4">
      <p className="text-purple-400 font-semibold">
        Estimated minutes listened to <span className="text-white font-bold">{artistName}</span>:{" "}
        {minutes !== null ? (
          <span className="text-green-400">{minutes.toLocaleString()} minutes</span>
        ) : (
          "Loading..."
        )}
      </p>
    </div>
  );
}


export default ArtistMinutes;
