import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { db, auth } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { FaSpotify, FaHeart } from "react-icons/fa";

function TopTracks({ token }) {
  const [tracks, setTracks] = useState([]);
  const [savingTrackId, setSavingTrackId] = useState(null);
  const [savedTrackIds, setSavedTrackIds] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: "", message: "" });
  const [user, setUser] = useState(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const res = await signInAnonymously(auth);
        setUser(res.user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) return;

    setIsLoadingTracks(true);
    axios
      .get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        setTracks(res.data.items);

        if (user) {
          const saved = [];
          for (const track of res.data.items) {
            const ref = doc(db, "users", user.uid, "favorites", track.id);
            const snap = await getDoc(ref);
            if (snap.exists()) saved.push(track.id);
          }
          setSavedTrackIds(saved);
        }
      })
      .catch(() =>
        setStatusMsg({
          type: "error",
          message: "Failed to fetch top tracks. Please try again.",
        })
      )
      .finally(() => setIsLoadingTracks(false));
  }, [token, user]);

  const saveToFavorites = useCallback(
    async (track) => {
      if (!user) {
        setStatusMsg({ type: "error", message: "Connecting... please wait." });
        return;
      }

      setSavingTrackId(track.id);
      const docRef = doc(db, "users", user.uid, "favorites", track.id);

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

        setSavedTrackIds((prev) => [...prev, track.id]);
        setStatusMsg({ type: "success", message: `"${track.name}" saved to favorites!` });
      } catch (err) {
        console.error("Error saving track:", err);
        setStatusMsg({ type: "error", message: "Failed to save track." });
      } finally {
        setSavingTrackId(null);
        setTimeout(() => setStatusMsg({ type: "", message: "" }), 3000);
      }
    },
    [user]
  );

  return (
    <div className="mt-10 px-4">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Your Top Tracks
      </h2>

      {statusMsg.message && (
        <div
          className={`text-center py-2 mb-4 rounded ${
            statusMsg.type === "success"
              ? "bg-green-800 text-green-300"
              : "bg-red-800 text-red-300"
          }`}
        >
          {statusMsg.message}
        </div>
      )}

      {isLoadingTracks ? (
        <p className="text-center text-gray-400">Loading your top tracks...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const isSaved = savedTrackIds.includes(track.id);

            return (
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
                  <audio controls className="w-full mt-3" src={track.preview_url} />
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
                    disabled={isSaved || savingTrackId === track.id}
                    className={`text-pink-400 text-sm flex items-center gap-2 ${
                      isSaved
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:text-pink-300"
                    }`}
                  >
                    <FaHeart />
                    {isSaved
                      ? "Saved"
                      : savingTrackId === track.id
                      ? "Saving..."
                      : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TopTracks;
