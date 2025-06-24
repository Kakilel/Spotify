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
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mb-10">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow">
        Your Spotify Profile
      </h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {profile.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-purple-600 shadow-md hover:scale-105 transition duration-300"
          />
        )}

        <div className="text-center sm:text-left">
          <p className="text-xl font-semibold mb-1">{profile.display_name}</p>
          <p className="text-sm text-gray-300">Email: {profile.email}</p>
          <p className="text-sm text-gray-300">Country: {profile.country}</p>
          <p className="text-sm text-gray-300 mb-2">
            Followers: {profile.followers.total.toLocaleString()}
          </p>
          <a
            href={profile.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-full hover:brightness-110 transition"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
