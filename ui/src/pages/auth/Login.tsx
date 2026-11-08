import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { login } from "../../api/auth";
import { ApiError } from "../../lib/api";
import { saveSession } from "../../lib/auth";
import FormField from "../../components/FormField";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await login(username, password);
      saveSession(auth);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-900">Sign in</h2>
      <p className="mb-6 text-sm text-gray-500">Welcome back to EcoPulse.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-green-700 hover:underline">
          Forgot password?
        </Link>
        <Link to="/register" className="text-green-700 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
