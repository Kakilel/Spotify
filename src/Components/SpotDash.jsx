// src/Components/Dashboard.jsx
import Navbar from "./Navbar";
import Landing from "./Landing";
import UserProfile from "./UserProfile";
import TopArtists from "./TopArtists";
import ArtistMinutes from "./ArtistMinutes";
import TopTracks from "./TopTracks";
import Playlists from "./Playlists";
import RecentlyPlayed from "./RecentlyPlayed";
import PlaylistBuilder from "./PlaylistBuilder";


const sections = [
  { id: "profile", label: "Profile" },
  { id: "top-artists", label: "Top Artists" },
  { id: "top-tracks", label: "Top Tracks" },
  { id: "playlists", label: "Playlists" },
  { id: "recently-played", label: "Recently Played" },
  { id: "artist-minutes", label: "Artist Minutes" },
    { id: "playlist-builder", label: "Custom Playlists" },  
];

function SpotDash({ token, user, selected, setSelected, setToken }) {
  return (
    <>
      <Navbar
        token={token}
        user={user}
        setToken={setToken}
        selected={selected}
        setSelected={setSelected}
        sections={sections}
      />
      <div className="p-6 space-y-6">
        {!token && <Landing />}
        {token && selected === "profile" && <UserProfile token={token} />}
        {token && selected === "top-artists" && (
          <TopArtists token={token} userId={user?.uid} />
        )}
        {token && selected === "top-tracks" && <TopTracks token={token} />}
        {token && selected === "playlists" && <Playlists token={token} />}
        {token && selected === "recently-played" && (
          <RecentlyPlayed token={token} />
        )}
        {token && selected === "artist-minutes" && (
          <ArtistMinutes
            token={token}
            artistId=""
            artistName="..."
            userId={user?.uid}
          />
        )}
        {token && selected === "playlist-builder" && (
  <PlaylistBuilder user={user} token={token} />
)}
        
     </div>
    </>
  );
}

export default SpotDash;
