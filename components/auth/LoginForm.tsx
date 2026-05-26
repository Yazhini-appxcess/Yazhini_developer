"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  logoUrl: string | null;
  logoAlt: string;
  title: string;
  subtitle: string;
  bgClass: string;
  cardClass: string;
  emailLabelClass: string;
  passwordLabelClass: string;
  emailInputClass: string;
  passwordInputClass: string;
  buttonClass: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginApiEndpoint: string;
  tokenStorageKey: string;
  userStorageKey: string | null;
  redirectPath: string;
  authCheckFn: () => Promise<boolean>;
  buttonText: string;
  loadingButtonText: string;
}

export default function LoginForm({
  logoUrl,
  logoAlt,
  title,
  subtitle,
  bgClass,
  cardClass,
  emailLabelClass,
  passwordLabelClass,
  emailInputClass,
  passwordInputClass,
  buttonClass,
  emailPlaceholder,
  passwordPlaceholder,
  loginApiEndpoint,
  tokenStorageKey,
  userStorageKey,
  redirectPath,
  authCheckFn,
  buttonText,
  loadingButtonText,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem(tokenStorageKey);
    const hasUser = userStorageKey ? !!localStorage.getItem(userStorageKey) : true;
    if (token && hasUser) {
      authCheckFn().then((isValid) => {
        if (isValid) {
          router.push(redirectPath);
        } else {
          setError("Session expired. Please log in again.");
        }
      });
    }
  }, [router, redirectPath, tokenStorageKey, userStorageKey, authCheckFn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(loginApiEndpoint, {
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

      // Store token
      localStorage.setItem(tokenStorageKey, data.access_token);
      if (userStorageKey && data.user) {
        localStorage.setItem(userStorageKey, JSON.stringify(data.user));
      }

      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={bgClass}>
      <div className="max-w-md w-full mx-4">
        <div className={cardClass}>
          {/* Logo and Header */}
          <div className="text-center mb-4">
            {logoUrl && (
              <div className="flex items-center justify-center mb-1">
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="w-25 h-25 object-contain"
                  style={{ maxHeight: '100px', maxWidth: '100px' }}
                />
              </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={emailLabelClass}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={emailInputClass}
                placeholder={emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className={passwordLabelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={passwordInputClass}
                placeholder={passwordPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass}
            >
              {loading ? loadingButtonText : buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
