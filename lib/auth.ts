"use client";

import { apiUrl } from "./api";

/**
 * Authentication utilities for admin access
 */

export interface AdminUser {
  id?: string | number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || localStorage.getItem("appxcess_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  localStorage.removeItem("appxcess_token");
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("admin_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AdminUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export async function checkAuthStatus(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(apiUrl("api/admin/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return false;
    }

    return true;
  } catch {
    removeAuthToken();
    return false;
  }
}

export async function checkAppXcessAuthStatus(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("appxcess_token");
  if (!token) return false;

  try {
    const response = await fetch(apiUrl("api/appxcess/verify"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("appxcess_token");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("appxcess_token");
    return false;
  }
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}


