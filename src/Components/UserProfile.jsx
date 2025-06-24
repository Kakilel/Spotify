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
    <div>
      <h2>User Profile</h2>
      <p>Name: {profile.display_name}</p>
      <p>Email: {profile.email}</p>
      <p>Country: {profile.country}</p>
      <p>Followers: {profile.followers.total}</p>
    </div>
  );
}

export default UserProfile;
