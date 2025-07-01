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
        userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    <div className="flex items-center justify-center px-4 py-8 min-h-[60vh]">
      <form
        onSubmit={handleAuth}
        className="bg-bg-200 border border-bg-300 p-8 rounded-xl shadow-xl w-full max-w-md text-white space-y-4"
      >
        <h2 className="text-2xl font-bold text-primary-300 text-center mb-2">
          {isNewUser ? "Create Account" : "Login to Spotify Stats"}
        </h2>

        {error && (
          <div className="bg-red-600 text-white text-sm px-4 py-2 rounded shadow-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-2 rounded bg-bg-300 text-white placeholder-text-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 rounded bg-bg-300 text-white placeholder-text-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold transition duration-300 ${
            loading
              ? "bg-primary-300 cursor-not-allowed"
              : "bg-primary-200 hover:bg-primary-100"
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

        <p className="text-center text-sm mt-2 text-text-200">
          {isNewUser ? "Already have an account?" : "New to Spotify Stats?"}{" "}
          <button
            type="button"
            className="text-accent-200 hover:underline"
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
