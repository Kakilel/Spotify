import axios from "axios";

export default async function handler(req, res) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = response.data.access_token;
    res.redirect(`/?access_token=${accessToken}`);
  } catch (error) {
    console.error("Spotify callback error:", error.response?.data || error.message);
    res.status(500).send("Error exchanging code for token.");
  }
}
