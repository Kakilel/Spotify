import { useEffect, useState } from "react";
import axios from "axios";

function ArtistMinutes({ token, artistName }) {
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const tracks = res.data.items.filter((track) =>
          track.artists.some((a) =>
            a.name.toLowerCase().includes(artistName.toLowerCase())
          )
        );

        const totalMs = tracks.reduce(
          (acc, track) => acc + track.duration_ms * 10,
          0
        ); // Assuming each track listened 10 times
        const totalMin = Math.round(totalMs / 60000);
        setMinutes(totalMin);
      });
  }, [token, artistName]);

  return (
    <div>
      <p>Estimated minutes listened to {artistName}: {minutes}</p>
    </div>
  );
}

export default ArtistMinutes;
