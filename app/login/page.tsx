"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        router.push("/bot");
      } catch {
        router.push("/bot");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      // Redirect based on user type
      if (data.user.is_superuser) {
        // All admins go to leucadia copilot
        router.push("/bot");
      } else {
        // Regular admin goes to leucadia copilot
        router.push("/bot");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-8 pb-8 pt-4">
          {/* Logo and Header */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-1">
              <img
                src="/LWWD_Logo.jpg"
                alt="LEUCADIA Logo"
                className="w-25 h-25 object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Wastewater District Login
            </h2>
            <p className="text-sm text-gray-600">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="superadmin@gmail.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a3661] text-white py-2.5 px-4 rounded-lg hover:bg-[#01284e] focus:outline-none focus:ring-2 focus:ring-[#01284e]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg shadow-[#01284e]/20"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

