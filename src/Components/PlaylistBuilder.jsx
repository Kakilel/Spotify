import { useEffect, useReducer } from "react";
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

const initialState = {
  playlists: [],
  selectedTracks: [],
  playlistName: "",
  description: "",
  category: "",
  editingId: null,
  loading: false,
  status: null,
  trackName: "",
  trackArtist: "",
  trackImage: "",
  spotifyUrl: "",
  previewUrl: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PLAYLISTS":
      return { ...state, playlists: action.playlists };
    case "ADD_TRACK":
      return {
        ...state,
        selectedTracks: [...state.selectedTracks, action.track],
        trackName: "",
        trackArtist: "",
        trackImage: "",
        spotifyUrl: "",
        previewUrl: "",
      };
    case "RESET_FORM":
      return {
        ...state,
        playlistName: "",
        description: "",
        category: "",
        selectedTracks: [],
        editingId: null,
      };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "EDIT_PLAYLIST":
      return {
        ...state,
        playlistName: action.playlist.name,
        description: action.playlist.description || "",
        category: action.playlist.category,
        selectedTracks: action.playlist.tracks || [],
        editingId: action.playlist.id,
        status: "Editing playlist.",
      };
    default:
      return state;
  }
}

function PlaylistBuilder({ user }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const categories = ["Workout", "Chill", "Party", "Focus", "Custom"];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const playlistsSnap = await getDocs(
        collection(db, "users", user.uid, "customPlaylists")
      );
      dispatch({
        type: "SET_PLAYLISTS",
        playlists: playlistsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      });
    };

    fetchData();
  }, [user]);

  const refreshPlaylists = async () => {
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "customPlaylists")
    );
    dispatch({
      type: "SET_PLAYLISTS",
      playlists: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  };

  const handleSave = async () => {
    if (!state.playlistName || !state.category) {
      return dispatch({ type: "SET_STATUS", status: " Please fill all required fields." });
    }

    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const data = {
        name: state.playlistName,
        description: state.description,
        category: state.category,
        createdAt: new Date().toISOString(),
        tracks: state.selectedTracks,
      };

      if (state.editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "customPlaylists", state.editingId),
          data
        );
        dispatch({ type: "SET_STATUS", status: "Playlist updated." });
      } else {
        const id = uuidv4();
        await setDoc(doc(db, "users", user.uid, "customPlaylists", id), {
          ...data,
          id,
        });
        dispatch({ type: "SET_STATUS", status: " Playlist created." });
      }

      dispatch({ type: "RESET_FORM" });
      await refreshPlaylists();
    } catch (err) {
      dispatch({ type: "SET_STATUS", status: "Error saving playlist." });
      console.error(err);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this playlist?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "customPlaylists", id));
      dispatch({
        type: "SET_PLAYLISTS",
        playlists: state.playlists.filter((p) => p.id !== id),
      });
      dispatch({ type: "SET_STATUS", status: "Playlist deleted." });
    } catch (err) {
      dispatch({ type: "SET_STATUS", status: " Failed to delete playlist." });
      console.error(err);
    }
  };

  const handleAddTrack = () => {
    if (!state.trackName || !state.trackArtist) return;
    const newTrack = {
      id: uuidv4(),
      name: state.trackName,
      artists: state.trackArtist.split(",").map((a) => a.trim()),
      albumImage: state.trackImage,
      spotify_url: state.spotifyUrl,
      preview_url: state.previewUrl,
    };
    dispatch({ type: "ADD_TRACK", track: newTrack });
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

      <div className="mb-6 bg-bg-300 p-4 rounded">
        <h3 className="text-xl font-bold mb-3 text-primary-200">Add Song</h3>
        <input
          type="text"
          placeholder="Track Name"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-bg-200 text-text-100"
        />
        <input
          type="text"
          placeholder="Artists (comma-separated)"
          value={trackArtist}
          onChange={(e) => setTrackArtist(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-bg-200 text-text-100"
        />
        <input
          type="text"
          placeholder="Album Image URL"
          value={trackImage}
          onChange={(e) => setTrackImage(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-bg-200 text-text-100"
        />
        <input
          type="text"
          placeholder="Spotify URL"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-bg-200 text-text-100"
        />
        <input
          type="text"
          placeholder="Preview URL"
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-bg-200 text-text-100"
        />
        <button
          onClick={handleAddTrack}
          className="w-full py-2 mt-2 bg-primary-200 hover:bg-primary-300 rounded text-white"
        >
          Add Track
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-2 rounded font-semibold text-text-100 transition ${
          loading ? "bg-bg-200" : "bg-primary-200 hover:bg-primary-300"
        }`}
      >
        {loading ? "Saving..." : editingId ? "Update Playlist" : "Save Playlist"}
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
                  {track.spotify_url && (
                    <a
                      href={track.spotify_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      <FaSpotify />
                    </a>
                  )}
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