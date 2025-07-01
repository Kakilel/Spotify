import { motion } from "framer-motion";

function Landing() {
  const artists = [
    {
      name: "TEMS",
      img: "https://i.pinimg.com/736x/83/99/27/839927fe6093450b1313ae0b5900f4a8.jpg",
    },
    {
      name: "DRAKE",
      img: "https://i.pinimg.com/736x/46/5c/78/465c78f9e9e5cdca49f033f3bc83a249.jpg",
    },
    {
      name: "REMA",
      img: "https://i.pinimg.com/736x/76/00/93/760093b8f4312df71025103f095c2183.jpg",
    },
    {
      name: "LIL MAINA",
      img: "https://i.pinimg.com/736x/d9/bf/a9/d9bfa947bc558a6211af056de1ffa272.jpg",
    },
    {
      name: "SZA",
      img: "https://i.pinimg.com/736x/6c/c2/c4/6cc2c434d9dc5ea61cfa49d34ff5067a.jpg",
    },
    {
      name: "CENTRAL CEE",
      img: "https://i.pinimg.com/736x/86/75/78/8675783e01011e4270234ade5631b1e4.jpg",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-text-100 text-center px-6 py-12 min-h-screen bg-gradient-to-b from-bg-100 via-bg-200 to-bg-100"
    >
      <h1 className="text-4xl md:text-5xl font-extrabold text-primary-300 drop-shadow-lg">
        Spotify Stats
      </h1>
      <p className="text-lg text-text-200 max-w-xl mx-auto mt-4">
        Discover your top artists, tracks, playlists, and how many minutes you've really spent with your favorite music.
      </p>

      {/* Featured Artist Showcase */}
      <div className="relative bg-bg-200 backdrop-blur-md rounded-xl p-10 mx-auto mt-12 w-full max-w-4xl shadow-2xl border border-bg-300">
        {/* Top row */}
        <div className="flex justify-center space-x-[-30px] mb-[-16px] relative z-10">
          {artists.slice(0, 4).map((artist, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative group w-32 h-32"
            >
              <img
                src={artist.img}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:blur-sm"
              />
              <span className="absolute inset-0 flex items-center justify-center text-sm text-white font-semibold bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                {artist.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex justify-center gap-4 mt-6 relative z-0">
          {artists.slice(4).map((artist, i) => (
            <motion.div
              key={i + 4}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="relative group w-32 h-32"
            >
              <img
                src={artist.img}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:blur-sm"
              />
              <span className="absolute inset-0 flex items-center justify-center text-sm text-white font-semibold bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                {artist.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Login Button */}
      <a href="/api/login">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-12 bg-gradient-to-r from-primary-200 to-primary-100 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:brightness-110 transition"
        >
          Login with Spotify
        </motion.button>
      </a>
    </motion.div>
  );
}

export default Landing;
