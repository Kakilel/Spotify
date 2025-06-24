import { useEffect, useState } from "react";
import axios from "axios";

function UserProfile({ token }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data));
  }, [token]);

  if (!profile) return null;

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mb-6">
      <h2 className="text-2xl text-purple-400 font-semibold mb-4">Your Spotify Profile</h2>
      <div className="flex items-center space-x-4">
        {profile.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-lg font-bold">{profile.display_name}</p>
          <p className="text-sm text-gray-300">Email: {profile.email}</p>
          <p className="text-sm text-gray-300">Country: {profile.country}</p>
          <p className="text-sm text-gray-300">Followers: {profile.followers.total}</p>
          <a
            href={profile.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:underline mt-2 inline-block"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
