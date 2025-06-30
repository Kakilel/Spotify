import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase"; // adjust path if needed
import { doc, setDoc } from "firebase/firestore";
import { FaSpotify, FaHeart } from "react-icons/fa";

function TopTracks({ token, user }) {
  const [tracks, setTracks] = useState([]);
  const [savingTrackId, setSavingTrackId] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTracks(res.data.items));
  }, [token]);

  const saveToFavorites = async (track) => {
    if (!user) return alert("You must be logged in to save favorites.");

    const docRef = doc(db, "users", user.uid, "favorites", track.id);
    setSavingTrackId(track.id);

    try {
      await setDoc(docRef, {
        id: track.id,
        name: track.name,
        artists: track.artists.map((a) => a.name),
        albumImage: track.album.images[0]?.url || "",
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify,
        savedAt: new Date().toISOString(),
      });
      alert("Track saved to favorites!");
    } catch (err) {
      console.error("Error saving track:", err);
    } finally {
      setSavingTrackId(null);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Your Top Tracks
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-gray-900 rounded-xl p-4 shadow-lg hover:shadow-purple-500/30 transition-transform transform hover:scale-105 duration-300 text-white"
          >
            <img
              src={track.album.images[0]?.url}
              alt={track.name}
              className="rounded w-full h-48 object-cover mb-3"
            />
            <p className="font-semibold text-lg truncate">{track.name}</p>
            <p className="text-sm text-gray-400 truncate">
              {track.artists.map((a) => a.name).join(", ")}
            </p>

            {track.preview_url ? (
              <audio
                controls
                className="w-full mt-3"
                src={track.preview_url}
              />
            ) : (
              <p className="text-sm text-gray-500 mt-3">Preview not available</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-400 text-sm hover:underline hover:text-green-300"
              >
                <FaSpotify /> Listen
              </a>

              <button
                onClick={() => saveToFavorites(track)}
                disabled={savingTrackId === track.id}
                className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-2"
              >
                <FaHeart />
                {savingTrackId === track.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopTracks;
