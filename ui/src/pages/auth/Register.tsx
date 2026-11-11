import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { register } from "../../api/auth";
import { ApiError } from "../../lib/api";
import { saveSession } from "../../lib/auth";
import FormField from "../../components/FormField";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const auth = await register(username, email, password);
      saveSession(auth);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-900">Create an account</h2>
      <p className="mb-6 text-sm text-gray-500">Join EcoPulse to manage your buildings.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <FormField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          required
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-green-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
