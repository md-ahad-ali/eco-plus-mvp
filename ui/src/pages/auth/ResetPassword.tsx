import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { resetPassword } from "../../api/auth";
import { ApiError } from "../../lib/api";
import FormField from "../../components/FormField";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid reset token.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <h2 className="mb-2 text-xl font-bold text-gray-900">Password reset</h2>
        <p className="mb-6 text-sm text-gray-500">
          Your password has been changed successfully.
        </p>
        <Link
          to="/login"
          className="inline-block w-full rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-gray-900">Reset password</h2>
      <p className="mb-6 text-sm text-gray-500">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        <FormField
          label="Confirm new password"
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
          {submitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="text-green-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
