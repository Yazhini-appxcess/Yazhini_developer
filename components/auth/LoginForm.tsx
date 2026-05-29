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

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
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
                autoComplete="off"
                name="email-no-autofill"
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
                autoComplete="new-password"
                name="password-no-autofill"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass}
            >
              {loading ? loadingButtonText : buttonText}
            </button>

            {/* Divider */}
            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-xs shadow-sm cursor-pointer"
                onClick={() => {/* TODO: Implement Google Auth */ }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Google
              </button>

              <button
                type="button"
                className="flex items-center justify-center w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-xs shadow-sm cursor-pointer"
                onClick={() => {/* TODO: Implement Microsoft Auth */ }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z" />
                  <path fill="#00a4ef" d="M1 11h9v9H1z" />
                  <path fill="#7fba00" d="M11 1h9v9h-9z" />
                  <path fill="#ffb900" d="M11 11h9v9h-9z" />
                </svg>
                Microsoft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
