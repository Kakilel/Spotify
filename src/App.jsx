import { useEffect, useState } from "react";
import TopArtists from "./Components/TopArtists";


function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  return (
    <div>
      <h1>Spotify Lifetime Stats</h1>
      {!token ? (
        <a href="http://localhost:4000/login">
          <button>Login with Spotify</button>
        </a>
      ) : (
        <TopArtists token={token}/>
      )}
    </div>
  );
}

export default App;
