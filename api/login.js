export default function handler(req, res) {
  const { CLIENT_ID, REDIRECT_URI } = process.env;
  const scopes = "user-top-read user-read-recently-played playlist-read-private";
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect("https://accounts.spotify.com/authorize?" + queryParams.toString());
}
