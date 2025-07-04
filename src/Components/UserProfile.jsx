import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [theme, setTheme] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          if (data.theme) setTheme(data.theme);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    if (user) {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { theme: newTheme }, { merge: true });
    }
  };

  const themes = ["default", "pastel", "neon", "dark"];

  if (loading) return <p className="text-center mt-10 text-text-200">Loading profile...</p>;
  if (!user) return <p className="text-center mt-10 text-red-400">Not signed in</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1f2b3e] rounded-xl p-6 shadow-lg text-[#FFFFFF]"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={profile.photoURL || "/default-avatar.png"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-[#acc2ef]"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#acc2ef]">{profile.displayName || user.email}</h2>
            <p className="text-[#e0e0e0] text-sm mt-1">{profile.bio || "No bio yet."}</p>
            <label className="block mt-4 text-sm">Theme:</label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="bg-[#374357] text-white px-3 py-1 rounded"
            >
              {themes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#acc2ef] mb-2">Listening Stats</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#e0e0e0]">
            <li>🎧 Total Minutes Listened: {profile.totalMinutes || 0}</li>
            <li>🎵 Top Genre: {profile.topGenre || "Unknown"}</li>
            <li>🔥 Longest Streak: {profile.streak || 0} weeks</li>
            <li>⭐ Most Played Artist: {profile.topArtist || "Unknown"}</li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#acc2ef] mb-2">Badges</h3>
          <div className="flex gap-3 flex-wrap">
            {(profile.badges || ["🎯 Explorer", "🧠 Vibe Seeker"]).map((badge, i) => (
              <span key={i} className="bg-[#1F3A5F] text-white px-3 py-1 rounded-full text-sm">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#acc2ef] mb-2">Activity Feed</h3>
          <ul className="space-y-2 text-[#e0e0e0] text-sm">
            {(profile.activity || [
              "❤️ Favorited 'After Hours'",
              "🎧 Played 'N95' 12 times",
              "🔥 You discovered 'FKJ'",
            ]).map((event, i) => (
              <li key={i}>• {event}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#acc2ef] mb-2">Favorite Moments</h3>
          <ul className="list-disc ml-6 text-[#e0e0e0] text-sm">
            {(profile.moments || [
              "Week 27 - Coded to Synthwave 🚀",
              "Month of May - Jazz mornings ☕",
            ]).map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-[#3D5A80] px-6 py-2 rounded text-white hover:bg-[#cee8ff] transition">
            Share My Stats 🔗
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default UserProfile;
