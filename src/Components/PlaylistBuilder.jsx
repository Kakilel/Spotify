// UnifiedPlaylistBuilder.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { FaTrash, FaEdit, FaSpotify } from "react-icons/fa";

function PlaylistBuilder({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Workout", "Chill", "Party", "Focus", "Custom"];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [favoritesSnap, playlistsSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "favorites")),
        getDocs(collection(db, "users", user.uid, "customPlaylists")),
      ]);

      setFavorites(favoritesSnap.docs.map((doc) => doc.data()));
      setPlaylists(
        playlistsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchData();
  }, [user]);

  const toggleTrack = (trackId) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const resetForm = () => {
    setPlaylistName("");
    setDescription("");
    setCategory("");
    setSelectedTracks([]);
    setEditingId(null);
  };

  const refreshPlaylists = async () => {
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "customPlaylists")
    );
    setPlaylists(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleSave = async () => {
    if (!playlistName || !category) {
      return setStatus("⚠️ Please fill all required fields.");
    }
    setLoading(true);

    try {
      const tracks = favorites.filter((t) => selectedTracks.includes(t.id));
      const data = {
        name: playlistName,
        description,
        category,
        createdAt: new Date().toISOString(),
        tracks,
      };

      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "customPlaylists", editingId),
          data
        );
        setStatus("✅ Playlist updated.");
      } else {
        const id = uuidv4();
        await setDoc(doc(db, "users", user.uid, "customPlaylists", id), {
          ...data,
          id,
        });
        setStatus("✅ Playlist created.");
      }

      resetForm();
      await refreshPlaylists();
    } catch (err) {
      setStatus("❌ Error saving playlist.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this playlist?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "customPlaylists", id));
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      setStatus("🗑️ Playlist deleted.");
    } catch (err) {
      setStatus("❌ Failed to delete playlist.");
      console.error(err);
    }
  };

  const startEdit = (playlist) => {
    setPlaylistName(playlist.name);
    setDescription(playlist.description || "");
    setCategory(playlist.category);
    setSelectedTracks(playlist.tracks?.map((t) => t.id) || []);
    setEditingId(playlist.id);
    setStatus("✏️ Editing playlist.");
  };

  return (
    <div className="text-text-100 bg-bg-100 p-6 rounded-xl">
      <h2 className="text-3xl font-bold text-primary-300 mb-4 text-center">
        {editingId ? "Edit Playlist" : "Create Playlist"}
      </h2>

      <input
        type="text"
        placeholder="Playlist Name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-bg-200 text-text-100"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-3 p-2 rounded bg-bg-200 text-text-100"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-bg-200 text-text-100"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {favorites.map((track) => (
          <div
            key={track.id}
            onClick={() => toggleTrack(track.id)}
            className={`cursor-pointer border-2 rounded-xl p-3 transition hover:shadow-lg ${
              selectedTracks.includes(track.id)
                ? "border-primary-200"
                : "border-bg-200"
            }`}
          >
            <img
              src={track.albumImage}
              alt={track.name}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="font-semibold text-sm truncate">{track.name}</p>
            <p className="text-xs text-text-200 truncate">
              {track.artists.join(", ")}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-2 rounded font-semibold text-text-100 transition ${
          loading ? "bg-bg-200" : "bg-primary-200 hover:bg-primary-300"
        }`}
      >
        {loading
          ? "Saving..."
          : editingId
          ? "Update Playlist"
          : "Save Playlist"}
      </button>

      {status && <p className="mt-3 text-center text-accent-100">{status}</p>}

      <hr className="my-6 border-bg-200" />

      <h3 className="text-2xl font-semibold mb-4 text-primary-200 text-center">
        Your Playlists ({playlists.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="bg-bg-200 rounded-xl p-4 shadow hover:shadow-primary-100"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-xl font-semibold">{playlist.name}</h4>
                <p className="text-sm text-text-200">{playlist.category}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(playlist)}
                  className="text-accent-100"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="text-red-400"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {playlist.description && (
              <p className="text-sm text-text-200 mb-2 italic">
                {playlist.description}
              </p>
            )}

            <p className="text-xs text-text-200 mb-2">
              {playlist.tracks.length} track
              {playlist.tracks.length !== 1 && "s"}
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {playlist.tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-bg-300 rounded p-2 flex items-center gap-3"
                >
                  <img
                    src={track.albumImage}
                    alt={track.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm truncate">{track.name}</p>
                    <p className="text-xs text-text-200 truncate">
                      {track.artists.join(", ")}
                    </p>
                  </div>
                  <a
                    href={track.spotify_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-400 hover:text-green-300"
                  >
                    <FaSpotify />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlaylistBuilder;
