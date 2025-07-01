import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function SaveAllArtistMinutes({ token, userId }) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!token || !userId) return;

    const fetchAndSave = async () => {
      setStatus("loading");

      try {
        const timeRanges = ["short_term", "medium_term", "long_term"];
        const allTracks = [];

        const responses = await Promise.all(
          timeRanges.map((range) =>
            axios.get(
              `https://api.spotify.com/v1/me/top/tracks?time_range=${range}&limit=50`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );

        responses.forEach((res) => allTracks.push(...res.data.items));

       
        const artistMap = {};

        for (const track of allTracks) {
          const estimatedPlays = 20; 
          const durationMs = track.duration_ms * estimatedPlays;

          for (const artist of track.artists) {
            if (!artistMap[artist.id]) {
              artistMap[artist.id] = {
                artistName: artist.name,
                artistId: artist.id,
                totalMs: 0,
              };
            }
            artistMap[artist.id].totalMs += durationMs;
          }
        }

       
        const savePromises = Object.values(artistMap).map((artist) => {
          const minutes = Math.round(artist.totalMs / 60000);
          const docRef = doc(db, "users", userId, "artists", artist.artistId);

          return setDoc(docRef, {
            artistName: artist.artistName,
            artistId: artist.artistId,
            estimatedMinutes: minutes,
            timestamp: new Date().toISOString(),
          });
        });

        await Promise.all(savePromises);
        setStatus("done");
      } catch (err) {
        console.error("Error saving artist minutes:", err);
        setStatus("error");
      }
    };

    fetchAndSave();
  }, [token, userId]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded mt-4">
      {status === "loading" && <p className="text-purple-400">Saving your artist data...</p>}
      {status === "done" && <p className="text-green-400">All artist minutes saved to Firestore ✅</p>}
      {status === "error" && <p className="text-red-400">Error saving artist data 😢</p>}
    </div>
  );
}

export default SaveAllArtistMinutes;
