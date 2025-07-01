import { useEffect, useState } from "react";
import axios from "axios";

function Github({ onData }) {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (user) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`https://api.github.com/users/${user}`);
      const repoRes = await axios.get(`https://api.github.com/users/${user}/repos`);

      const sortedRepos = repoRes.data
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 8);

      setData(res.data);
      setRepos(sortedRepos);
      if (onData) onData({ avatar: res.data.avatar_url, username: res.data.login });
      setShowModal(true);
    } catch (err) {
      setError("GitHub user not found or API rate limit exceeded.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setUsername(input.trim());
    fetchData(input.trim());
  };

  return (
    <div className="p-6 rounded-lg shadow bg-bg-200 text-text-100">
      <h3 className="text-lg font-semibold mb-4 text-primary-300">Search GitHub User</h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter GitHub username"
          className="flex-grow px-4 py-2 rounded bg-bg-300 text-text-100 focus:outline-none focus:ring focus:ring-accent-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary-200 hover:bg-primary-100 rounded text-white font-medium"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      {loading && <p className="text-text-200 text-sm">Loading...</p>}

      {showModal && data && (
        <div className="bg-bg-100 text-text-100 rounded-lg p-6 mt-6 shadow-xl border border-bg-300">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src={data.avatar_url} alt="avatar" className="w-16 h-16 rounded-full" />
              <div>
                <p className="font-bold text-xl text-primary-300">{data.login}</p>
                <p className="text-sm text-text-200">{data.bio || "No bio provided"}</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-text-200 hover:text-red-400 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid gap-4 mt-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="bg-bg-200 p-4 rounded border border-bg-300"
              >
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-200 font-semibold hover:underline"
                >
                  {repo.name}
                </a>
                <p className="text-sm text-text-200">
                  {repo.description || "No description"}
                </p>
                <p className="text-yellow-400 text-sm">⭐ {repo.stargazers_count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Github;
