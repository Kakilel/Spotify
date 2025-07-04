import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FaSpotify } from "react-icons/fa";

function Favorites({ user }) {
  const [savedTracks, setSavedTracks] = useState([]);

  useEffect(() => {
    if (!user) return;

    const favsRef = collection(db, "users", user.uid, "favorites");

    const unsub = onSnapshot(favsRef, (snapshot) => {
      const favs = snapshot.docs.map((doc) => doc.data());
      setSavedTracks(favs);
    });

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return savedTracks.length > 0 ? (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-pink-400 mb-6 text-center drop-shadow">
        Your Favorites
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedTracks.map((track) => (
          <div
            key={track.id}
            className="bg-gray-800 rounded-xl p-4 shadow hover:shadow-pink-400/30 transition-transform transform hover:scale-105 duration-300 text-white"
          >
            <img
              src={track.albumImage}
              alt={track.name}
              className="rounded w-full h-48 object-cover mb-3"
            />
            <p className="font-semibold text-lg truncate">{track.name}</p>
            <p className="text-sm text-gray-400 truncate">
              {track.artists.join(", ")}
            </p>

            {track.preview_url ? (
              <audio controls className="w-full mt-3" src={track.preview_url} />
            ) : (
              <p className="text-sm text-gray-500 mt-3">Preview not available</p>
            )}

            <a
              href={track.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 text-sm hover:underline mt-4"
            >
              <FaSpotify /> Listen
            </a>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="text-center text-gray-400 mt-16">No favorites yet.</div>
  );
}

export default Favorites;
