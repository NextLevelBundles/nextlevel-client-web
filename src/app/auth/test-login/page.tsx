"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestAuthService } from "@/lib/auth/test-auth-service";

/**
 * Test Login Page - Development/Testing Only
 * Allows login using email from Customer table without password
 */
export default function TestLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if test auth is enabled
  const testAuthEnabled = TestAuthService.isEnabled();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await TestAuthService.signInWithEmail(email);

      if (result.success) {
        setSuccess(true);
        // Redirect to customer dashboard after brief delay
        setTimeout(() => {
          router.push("/customer");
        }, 1000);
      } else {
        setError(result.error || "Test login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!testAuthEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Test Login Disabled
            </h1>
            <p className="text-gray-600 mb-6">
              Test authentication is not enabled in this environment.
            </p>
            <p className="text-sm text-gray-500">
              Set <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_USE_TEST_AUTH=true</code> to enable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">🧪</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Test Login
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Development/Testing Only - Login using customer email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Login successful! Redirecting...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Customer Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter email address from Customer table (created by jMeter or admin)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Test Login"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              How it works:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Queries Customer table by email</li>
              <li>• Issues JWT with custom:customerId claim</li>
              <li>• No password validation required</li>
              <li>• Works with existing auth middleware</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/auth/signin"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to normal login
          </a>
        </div>
      </div>
    </div>
  );
}
