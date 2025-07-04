import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FaSpotify, FaHeart } from "react-icons/fa";

function RecentlyPlayed({ token, user }) {
  const [tracks, setTracks] = useState([]);
  const [savingTrackId, setSavingTrackId] = useState(null);

  useEffect(() => {
    if (!token) return;

    axios
      .get("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTracks(res.data.items))
      .catch((err) => console.error("Failed to load recently played:", err));
  }, [token]);

  const saveToFavorites = async (track) => {
    if (!user) return alert("Please wait while we connect...");

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
      alert("Saved to favorites!");
    } catch (err) {
      console.error("Error saving track:", err);
    } finally {
      setSavingTrackId(null);
    }
  };

  return (
    <div className="mt-10 px-4">
      <h2 className="text-3xl font-bold text-primary-300 mb-6 text-center drop-shadow">
        Recently Played
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((item, i) => {
          const track = item.track;

          return (
            <div
              key={i}
              className="bg-bg-300 rounded-xl p-4 text-text-100 shadow-lg hover:shadow-accent-100/40 transition-transform duration-300 transform hover:scale-105"
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="rounded w-full h-48 object-cover mb-3"
              />
              <p className="font-semibold text-lg truncate">{track.name}</p>
              <p className="text-sm text-text-200 mb-2 truncate">
                {track.artists.map((a) => a.name).join(", ")}
              </p>

              {track.preview_url ? (
                <audio controls className="w-full mt-2" src={track.preview_url} />
              ) : (
                <p className="text-sm text-gray-400 mt-2">No preview available</p>
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
                  className={`text-pink-400 hover:text-pink-300 text-sm flex items-center gap-2 ${
                    savingTrackId === track.id ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <FaHeart />
                  {savingTrackId === track.id ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentlyPlayed;
