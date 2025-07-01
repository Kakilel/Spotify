import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "/firebase";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;

      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
        setIsNewUser(false);
        setEmail("");
        setPassword("");
        setError("Account created! Please log in.");
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (onLogin) onLogin(userCredential.user);
      }
    } catch (error) {
      let message = "Authentication failed.";
      if (error.code === "auth/email-already-in-use") {
        message = "Email already in use.";
      } else if (error.code === "auth/user-not-found") {
        message = "User not found.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 p-6">
      <form
        onSubmit={handleAuth}
        className="bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md text-white space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isNewUser ? "Create Account" : "Login to Spotify Stats"}
        </h2>

        {error && (
          <div className="bg-red-500 text-white text-sm px-4 py-2 rounded">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold transition duration-300 ${
            loading
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading
            ? isNewUser
              ? "Creating..."
              : "Logging in..."
            : isNewUser
            ? "Sign Up"
            : "Login"}
        </button>

        <p className="text-center text-sm mt-2">
          {isNewUser ? "Already have an account?" : "New to Spotify Stats?"}{" "}
          <button
            type="button"
            className="text-purple-400 hover:underline"
            onClick={() => setIsNewUser(!isNewUser)}
          >
            {isNewUser ? "Login here" : "Sign up here"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
