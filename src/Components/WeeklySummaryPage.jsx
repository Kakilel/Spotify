import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

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
  const [showSlides, setShowSlides] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbum, setTopAlbum] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const currentWeekKey = `${dayjs().year()}-W${dayjs().isoWeek()}`;

  useEffect(() => {
    if (!showSlides || !token || !user) return;
    const fetchData = async () => {
      setLoading(true);
      const limit = 50;
      const spotifyRange = RANGE_MAP[range];
      const estimatedPlay = PLAY_ESTIMATE[range];
      try {
        const res = await axios.get(
          `https://api.spotify.com/v1/me/top/tracks?time_range=${spotifyRange}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const trackData = res.data.items;
        const artistMap = {};
        const albumMap = {};
        trackData.forEach((track) => {
          const durationMin = track.duration_ms / 60000;
          track.artists.forEach((artist) => {
            if (!artistMap[artist.id]) {
              artistMap[artist.id] = {
                id: artist.id,
                name: artist.name,
                image: track.album.images[0]?.url,
                minutes: 0,
              };
            }
            artistMap[artist.id].minutes += durationMin * estimatedPlay;
          });
          const albumId = track.album.id;
          if (!albumMap[albumId]) {
            albumMap[albumId] = {
              id: albumId,
              name: track.album.name,
              image: track.album.images[0]?.url,
              artist: track.artists[0].name,
              count: 0,
            };
          }
          albumMap[albumId].count++;
        });
        const artists = Object.values(artistMap)
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 3);
        const tracks = trackData.slice(0, 4).map((track) => ({
          id: track.id,
          name: track.name,
          album: track.album.name,
          albumImage: track.album.images[0]?.url,
          playCount: estimatedPlay,
          preview_url: track.preview_url,
        }));
        const topAlbum = Object.values(albumMap).sort((a, b) => b.count - a.count)[0];
        setTopArtists(artists);
        setTopTracks(tracks);
        setTopAlbum(topAlbum);
        const summaryRef = doc(db, "users", user.uid, "summaries", currentWeekKey);
        await setDoc(summaryRef, {
          week: currentWeekKey,
          range,
          timestamp: new Date().toISOString(),
          artists,
          topTracks: tracks,
          topAlbum,
        });
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showSlides, token, user, range, currentWeekKey]);

  useEffect(() => {
    if (!showSlides || currentSlide < 2) return;
    const timer = setTimeout(() => {
      setShowSlides(false);
      setShowSummary(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentSlide, showSlides]);

  return (
    <div className="p-6 text-white bg-[#0b0b0f]">
      {!showSlides && !showSummary && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#d8b4fe] mb-4">Weekly Summary</h2>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-[#171327] rounded px-4 py-2 text-white"
          >
            {Object.keys(RANGE_MAP).map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowSlides(true);
              setCurrentSlide(0);
            }}
            className="mt-6 bg-[#9f44ff] px-6 py-3 rounded-full font-semibold text-white hover:bg-[#e6ccff] transition"
          >
            Show Stats
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSlides && !loading && (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 text-center space-y-6"
          >
            {currentSlide === 0 && (
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="text-2xl font-bold text-[#d8b4fe] mb-2">Top Artists</h3>
                {topArtists.map((a) => (
                  <div key={a.id} className="mb-2">
                    <p className="text-lg">{a.name}</p>
                    <p className="text-sm text-[#d1d5db]">
                      {Math.round(a.minutes)} minutes
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
            {currentSlide === 1 && (
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="text-2xl font-bold text-[#d8b4fe] mb-2">Top Tracks</h3>
                {topTracks.map((t) => (
                  <div key={t.id} className="mb-2">
                    <p className="text-lg">{t.name}</p>
                    <p className="text-sm text-[#d1d5db]">
                      {t.playCount} estimated plays
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
            {currentSlide === 2 && topAlbum && (
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="text-2xl font-bold text-[#d8b4fe] mb-2">Most Listened Album</h3>
                <p className="text-lg">{topAlbum.name}</p>
                <p className="text-sm text-[#d1d5db]">by {topAlbum.artist}</p>
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
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-[#d8b4fe] mb-4">
            Full Summary ({range})
          </h3>
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Top Artists</h4>
            <ul className="list-disc ml-6 text-[#d1d5db]">
              {topArtists.map((a) => (
                <li key={a.id}>{a.name} - {Math.round(a.minutes)} minutes</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Top Tracks</h4>
            <ul className="list-disc ml-6 text-[#d1d5db]">
              {topTracks.map((t) => (
                <li key={t.id}>{t.name} - {t.playCount} plays</li>
              ))}
            </ul>
          </div>
          {topAlbum && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Most Listened Album</h4>
              <p className="text-[#d1d5db]">{topAlbum.name} by {topAlbum.artist}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeeklySummaryPage;
