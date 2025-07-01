import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const RANGE_MAP = {
  daily: "short_term",
  weekly: "short_term",
  monthly: "medium_term",
  "all-time": "long_term",
};

const LABELS = ["daily", "weekly", "monthly", "all-time"];

function ArtistMinutes({ token, artistId, artistName, userId }) {
  const [minutes, setMinutes] = useState(null);
  const [range, setRange] = useState("all-time");

  useEffect(() => {
    if (!artistId) return;

    const selectedRange = RANGE_MAP[range];
    const estimatedPlayCount = range === "daily" ? 2 : range === "weekly" ? 10 : 20;

    axios
      .get(`https://api.spotify.com/v1/me/top/tracks?time_range=${selectedRange}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const artistTracks = res.data.items.filter((track) =>
          track.artists.some((a) => a.id === artistId)
        );

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
            range,
            timestamp: new Date().toISOString(),
          });
        }
      })
      .catch((err) => console.error("Error fetching artist tracks:", err));
  }, [token, artistId, userId, artistName, range]);

  return (
    <AnimatePresence>
      {minutes !== null && (
        <motion.div
          className="bg-bg-300 text-text-100 p-4 rounded mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-300 font-semibold">
              Estimated minutes listened to{" "}
              <span className="text-text-100 font-bold">{artistName}</span>
            </p>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-bg-200 text-text-100 text-sm rounded px-2 py-1"
            >
              {LABELS.map((label) => (
                <option key={label} value={label}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-accent-200 text-lg font-semibold">
            {minutes.toLocaleString()} minutes
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ArtistMinutes;
