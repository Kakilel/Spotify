import { useEffect, useState } from "react";
import axios from "axios";

function ArtistMinutes({ token, artistId, artistName }) {
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    const timeRanges = ["short_term", "medium_term", "long_term"];
    const allTracks = [];

    Promise.all(
      timeRanges.map((range) =>
        axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${range}&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      )
    )
      .then((responses) => {
        responses.forEach((res) => allTracks.push(...res.data.items));

        // Filter tracks by this artist (including duplicates)
        const artistTracks = allTracks.filter((track) =>
          track.artists.some((a) => a.id === artistId)
        );

        const estimatedPlayCount = 20; // you can tweak this value
        const totalMs = artistTracks.reduce(
          (sum, t) => sum + t.duration_ms * estimatedPlayCount,
          0
        );

        setMinutes(Math.round(totalMs / 60000));
      })
      .catch((err) => {
        console.error("Error estimating minutes:", err);
      });
  }, [token, artistId]);

  return (
    <div className="bg-gray-800 text-white p-4 rounded mt-4 shadow-lg">
      <p className="text-purple-400 font-semibold">
        Estimated total minutes listened to{" "}
        <span className="text-white font-bold">{artistName}</span>:
        {minutes !== null ? (
          <span className="text-green-400"> {minutes.toLocaleString()} minutes</span>
        ) : (
          <span className="text-gray-400 ml-2">Calculating...</span>
        )}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Based on 150 top tracks × {`~${estimatedPlayCount}`} estimated replays
      </p>
    </div>
  );
}

export default ArtistMinutes;
