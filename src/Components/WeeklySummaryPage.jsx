import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";

const RANGE_MAP = {
  day: "short_term",
  week: "short_term",
  month: "medium_term",
  year: "long_term",
};

const PLAY_ESTIMATE = {
  day: 2,
  week: 10,
  month: 20,
  year: 30,
};

function WeeklySummaryPage({ token, user }) {
  const [range, setRange] = useState("week");
  const [slidesStarted, setSlidesStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topPlaylist, setTopPlaylist] = useState(null);

  const summaryKey = `${dayjs().format("YYYY-[RANGE]-")}${range}`;

  useEffect(() => {
    if (!slidesStarted || !token || !user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tracksRes, playlistsRes] = await Promise.all([
          axios.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${RANGE_MAP[range]}&limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://api.spotify.com/v1/me/playlists?limit=20", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tracks = tracksRes.data.items;
        const playCount = PLAY_ESTIMATE[range];
        const artistMap = {};

        tracks.forEach((track) => {
          const minutes = track.duration_ms / 60000 * playCount;
          track.artists.forEach((artist) => {
            if (!artistMap[artist.id]) {
              artistMap[artist.id] = {
                id: artist.id,
                name: artist.name,
                image: track.album.images[0]?.url,
                minutes: 0,
              };
            }
            artistMap[artist.id].minutes += minutes;
          });
        });

        const topArtists = Object.values(artistMap).sort((a, b) => b.minutes - a.minutes).slice(0, 5);
        const topTracks = tracks.slice(0, 5).map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
          image: track.album.images[0]?.url,
          playCount,
        }));

        const topPlaylist = playlistsRes.data.items.find(p => p.tracks.total > 0);

        setTopArtists(topArtists);
        setTopTracks(topTracks);
        setTopPlaylist(topPlaylist);

        await setDoc(doc(db, "users", user.uid, "summaries", summaryKey), {
          timestamp: new Date().toISOString(),
          range,
          topArtists,
          topTracks,
          topPlaylist,
        });
      } catch (e) {
        console.error("Error fetching summary:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slidesStarted, range, token, user, summaryKey]);

  useEffect(() => {
    if (slidesStarted && currentSlide >= 2) {
      const timeout = setTimeout(() => {
        setSlidesStarted(false);
        setShowSummary(true);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, slidesStarted]);

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-6">
      {!slidesStarted && !showSummary && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#d8b4fe] mb-4">Your Listening Summary</h1>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-[#171327] text-white px-4 py-2 rounded"
          >
            {Object.keys(RANGE_MAP).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={() => { setSlidesStarted(true); setCurrentSlide(0); }}
            className="block mt-6 bg-[#9f44ff] px-6 py-3 rounded-full font-semibold hover:bg-[#e6ccff]"
          >
            View Summary
          </button>
        </div>
      )}

      <AnimatePresence>
        {slidesStarted && !loading && (
          <motion.div className="text-center mt-10 space-y-6">
            {currentSlide === 0 && (
              <motion.div>
                <h2 className="text-2xl font-bold text-[#d8b4fe] mb-4">Top Artists</h2>
                {topArtists.map((a) => (
                  <div key={a.id} className="mb-2">
                    <p>{a.name}</p>
                    <p className="text-sm text-gray-300">{Math.round(a.minutes)} minutes</p>
                  </div>
                ))}
              </motion.div>
            )}
            {currentSlide === 1 && (
              <motion.div>
                <h2 className="text-2xl font-bold text-[#d8b4fe] mb-4">Top Tracks</h2>
                {topTracks.map((t) => (
                  <div key={t.id} className="mb-2">
                    <p>{t.name} by {t.artist}</p>
                    <p className="text-sm text-gray-300">{t.playCount} estimated plays</p>
                  </div>
                ))}
              </motion.div>
            )}
            {currentSlide === 2 && topPlaylist && (
              <motion.div>
                <h2 className="text-2xl font-bold text-[#d8b4fe] mb-4">Top Playlist</h2>
                <p>{topPlaylist.name}</p>
              </motion.div>
            )}
            <button
              className="mt-8 bg-[#9f44ff] px-4 py-2 rounded-full text-white hover:bg-[#e6ccff]"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
            >
              Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showSummary && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#d8b4fe] mb-4">Full Summary ({range})</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Top Artists</h3>
            <ul className="list-disc ml-6 text-gray-300">
              {topArtists.map((a) => (
                <li key={a.id}>{a.name} - {Math.round(a.minutes)} mins</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Top Tracks</h3>
            <ul className="list-disc ml-6 text-gray-300">
              {topTracks.map((t) => (
                <li key={t.id}>{t.name} by {t.artist} - {t.playCount} plays</li>
              ))}
            </ul>
          </div>

          {topPlaylist && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Most Listened Playlist</h3>
              <p className="text-gray-300">{topPlaylist.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeeklySummaryPage;
