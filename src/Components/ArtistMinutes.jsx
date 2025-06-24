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
        const artistTracks = res.data.items.filter((track) =>
          track.artists.some((a) =>
            a.name.toLowerCase().includes(artistName.toLowerCase())
          )
        );

        const totalMs = artistTracks.reduce((sum, t) => sum + t.duration_ms * 10, 0);
        setMinutes(Math.round(totalMs / 60000));
      });
  }, [token, artistName]);

  return (
    <p>Estimated minutes listened to {artistName}: {minutes ?? "Loading..."}</p>
  );
}

export default ArtistMinutes;
