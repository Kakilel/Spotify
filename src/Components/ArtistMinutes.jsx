import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

function ArtistMinutes({ token, artistId, artistName, userId }) {
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
      .then(async (responses) => {
        responses.forEach((res) => allTracks.push(...res.data.items));

        const artistTracks = allTracks.filter((track) =>
          track.artists.some((a) => a.id === artistId)
        );

        const estimatedPlayCount = 20;
        const totalMs = artistTracks.reduce(
          (sum, t) => sum + t.duration_ms * estimatedPlayCount,
          0
        );
        const estimatedMinutes = Math.round(totalMs / 60000);
        setMinutes(estimatedMinutes);

        if (userId) {
          const docRef = doc(db, "users", userId, "artists", artistId);
          await setDoc(docRef, {
            artistName,
            artistId,
            estimatedMinutes,
            timestamp: new Date().toISOString(),
          });
        }
      })
      .catch((err) => console.error("Error fetching tracks:", err));
  }, [token, artistId, userId, artistName]);

  return (
    <AnimatePresence>
      {minutes !== null && (
        <motion.div
          className="bg-gray-800 text-white p-4 rounded mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <p className="text-purple-400 font-semibold">
            Estimated minutes listened to{" "}
            <span className="text-white font-bold">{artistName}</span>:{" "}
            <span className="text-green-400">
              {minutes.toLocaleString()} minutes
            </span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Data saved to your Firestore profile.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ArtistMinutes;
