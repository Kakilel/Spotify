import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

function CustomPlaylists({ user, spotifyToken }) {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [songs, setSongs] = useState({});

  const fetchPlaylists = async () => {
    const ref = collection(db, "users", user.uid, "customPlaylists");
    const snap = await getDocs(ref);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPlaylists(data);
  };

  const fetchSongs = async (playlistId) => {
    const ref = collection(db, "users", user.uid, "customPlaylists", playlistId, "songs");
    const snap = await getDocs(ref);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSongs((prev) => ({ ...prev, [playlistId]: data }));
  };

  useEffect(() => {
    if (user?.uid) fetchPlaylists();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = uuidv4();
    const playlist = {
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid, "customPlaylists", id), playlist);
    setName("");
    setDescription("");
    fetchPlaylists();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "customPlaylists", id));
    fetchPlaylists();
  };

  const startEdit = (playlist) => {
    setEditingId(playlist.id);
    setEditingName(playlist.name);
    setEditingDescription(playlist.description);
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "users", user.uid, "customPlaylists", editingId), {
      name: editingName,
      description: editingDescription,
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
    fetchPlaylists();
  };

  const searchSpotifyTracks = async () => {
    if (!searchQuery || !spotifyToken) return;

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    const data = await res.json();
    const tracks = data.tracks?.items || [];
    setSearchResults(tracks);
  };

  const handleAddSong = async (playlistId, track) => {
    const songData = {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      image: track.album.images[0]?.url || "",
      uri: track.uri,
      addedAt: new Date().toISOString(),
    };

    await setDoc(
      doc(db, "users", user.uid, "customPlaylists", playlistId, "songs", track.id),
      songData
    );
    fetchSongs(playlistId);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl text-white shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-purple-400 mb-4">🎵 Your Custom Playlists</h2>

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
        />
        <textarea
          placeholder="Playlist Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Add Playlist
        </button>
      </form>

      {playlists.length === 0 ? (
        <p className="text-gray-400">No playlists yet. Create one!</p>
      ) : (
        <ul className="space-y-4">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="bg-gray-800 p-4 rounded flex flex-col gap-3"
            >
              {editingId === playlist.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-1 rounded bg-gray-700 text-white"
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    className="w-full px-3 py-1 rounded bg-gray-700 text-white"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="text-sm px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">{playlist.description}</p>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => startEdit(playlist)}
                        className="text-sm text-yellow-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(playlist.id)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPlaylistId(
                            selectedPlaylistId === playlist.id ? null : playlist.id
                          );
                          fetchSongs(playlist.id);
                        }}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {selectedPlaylistId === playlist.id ? "Hide Songs" : "Manage Songs"}
                      </button>
                    </div>
                  </div>

                  {selectedPlaylistId === playlist.id && (
                    <div className="mt-4 w-full">
                      <input
                        type="text"
                        placeholder="Search Spotify songs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-1 rounded bg-gray-700 text-white mb-2"
                      />
                      <button
                        onClick={searchSpotifyTracks}
                        className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
                      >
                        Search
                      </button>

                      <div className="space-y-3">
                        {searchResults.map((track) => (
                          <div
                            key={track.id}
                            className="flex items-center justify-between bg-gray-700 p-2 rounded"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={track.album.images[2]?.url}
                                alt={track.name}
                                className="w-10 h-10 rounded"
                              />
                              <div>
                                <p className="text-sm font-semibold">{track.name}</p>
                                <p className="text-xs text-gray-300">
                                  {track.artists.map((a) => a.name).join(", ")}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddSong(playlist.id, track)}
                              className="text-sm text-green-400 hover:underline"
                            >
                              ➕ Add
                            </button>
                          </div>
                        ))}
                      </div>

                      {songs[playlist.id]?.length > 0 && (
                        <ul className="mt-4 text-sm text-gray-200 space-y-1">
                          <h4 className="font-bold text-white mb-1">🎶 Songs in Playlist:</h4>
                          {songs[playlist.id].map((song) => (
                            <li key={song.id} className="flex items-center gap-2">
                              <img src={song.image} alt={song.name} className="w-8 h-8 rounded" />
                              <span>{song.name} — {song.artist}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomPlaylists;
