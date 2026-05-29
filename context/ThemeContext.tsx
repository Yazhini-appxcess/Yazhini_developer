"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api";

interface CustomLink {
    name: string;
    href: string;
    icon: string;
    role?: string;
    openType?: string;
}

interface CustomSection {
    title: string;
    links: CustomLink[];
}

interface OrganizationSettings {
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    sidebar_bg_color: string;
    sidebar_text_color: string;
    sidebar_enabled: boolean;

    // Category Labels
    integration_label?: string;
    custom_links_label?: string;

    // Custom Sections
    custom_sections?: CustomSection[];

    // Sidebar Item Visibility
    show_dashboard?: boolean;
    show_copilot?: boolean;
    show_upload_hub?: boolean;
    show_documents?: boolean;
    show_conversations?: boolean;
    show_admin_management?: boolean;
    show_activity_log?: boolean;
    show_erp_hub?: boolean;
    show_crm_hub?: boolean;
    show_database_hub?: boolean;
    show_api_docs?: boolean;
    show_iot_hub?: boolean;
    show_microsoft_hub?: boolean;
    show_mes_hub?: boolean;

    // Widget Customization
    widget_name?: string;
    widget_logo_url?: string | null;
    widget_primary_color?: string;
}

interface ThemeContextType {
    settings: OrganizationSettings | null;
    refreshSettings: () => Promise<void>;
    loading: boolean;
}

const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

const setCookie = (name: string, value: string, days = 7) => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [settings, setSettings] = useState<OrganizationSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const isSuperAdminRoute = (pathname?.startsWith("/appxcess") && !pathname?.startsWith("/appxcess/backup")) || pathname?.startsWith("/super-admin");

    const hexToRgb = (hex: string) => {
        if (!hex) return null;
        // Remove # if present
        const cleanHex = hex.replace("#", "");

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = cleanHex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
    };

    const isDarkColor = (hex: string) => {
        if (!hex) return true;
        const cleanHex = hex.replace("#", "");
        if (cleanHex.length < 6) return true;
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq < 128;
    };

    // Tracks the in-flight refresh request so we can cancel it when a newer one
    // starts (route change, focus, manual refresh) — eliminates the "Failed to
    // fetch" TypeError that fires when a stale request is aborted during dev
    // hot-reload or rapid navigation.
    const inFlightAbortRef = useRef<AbortController | null>(null);

    const refreshSettings = async () => {
        // Cancel any previous in-flight request before starting a new one.
        if (inFlightAbortRef.current) {
            inFlightAbortRef.current.abort();
        }
        const controller = new AbortController();
        inFlightAbortRef.current = controller;

        // Hard timeout so a hung backend doesn't leave the loading spinner
        // forever. 10s is generous for a settings endpoint.
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const endpoint = isSuperAdminRoute ? API_ENDPOINTS.appxcess.settings.get : API_ENDPOINTS.settings.get;
            const res = await fetch(`${endpoint}?t=${new Date().getTime()}`, {
                signal: controller.signal,
                cache: "no-store",
            });
            if (!res.ok) {
                // Non-2xx (e.g. 404, 500). Keep cookie-seeded fallback; don't throw.
                console.warn(`[ThemeContext] settings endpoint returned ${res.status}; keeping existing theme`);
                return;
            }
            const data = await res.json();

            // Prepend API base URL if paths are relative (starts with /)
            // This fixes the issue when frontend runs on 3000 and backend on 8000
            if (data.logo_url && data.logo_url.startsWith("/")) {
                data.logo_url = `${API_ENDPOINTS.base}${data.logo_url}`;
            }
            if (data.favicon_url && data.favicon_url.startsWith("/")) {
                data.favicon_url = `${API_ENDPOINTS.base}${data.favicon_url}`;
            }
            if (data.widget_logo_url && data.widget_logo_url.startsWith("/")) {
                data.widget_logo_url = `${API_ENDPOINTS.base}${data.widget_logo_url}`;
            }

            // Append cache buster using updated_at timestamp to avoid stale browser cache
            const buster = data.updated_at ? new Date(data.updated_at).getTime() : new Date().getTime();
            if (data.logo_url) {
                data.logo_url = `${data.logo_url.split("?")[0]}?t=${buster}`;
            }
            if (data.favicon_url) {
                data.favicon_url = `${data.favicon_url.split("?")[0]}?t=${buster}`;
            }
            if (data.widget_logo_url) {
                data.widget_logo_url = `${data.widget_logo_url.split("?")[0]}?t=${buster}`;
            }

            setSettings(data);
            applyTheme(data, !!isSuperAdminRoute);
        } catch (error) {
            // AbortError: superseded by a newer refresh or component unmount.
            // Expected — silently swallow.
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            // Network failure (backend down, offline, DNS, etc.) surfaces as
            // TypeError "Failed to fetch" in Chromium / "NetworkError" in Firefox.
            // Degrade gracefully: log a warning and keep whatever settings the
            // cookie fallback (or previous successful fetch) already populated.
            if (error instanceof TypeError) {
                console.warn(
                    `[ThemeContext] Could not reach ${API_ENDPOINTS.base} — using cached/fallback theme. ` +
                    "Check that the backend is running and NEXT_PUBLIC_API_URL is correct."
                );
                return;
            }
            console.error("[ThemeContext] Unexpected error loading theme settings:", error);
        } finally {
            clearTimeout(timeoutId);
            if (inFlightAbortRef.current === controller) {
                inFlightAbortRef.current = null;
            }
            setLoading(false);
        }
    };



    const applyFavicon = (url: string) => {
        if (typeof document === "undefined" || !url) return;

        const cacheBustedUrl = `${url.split("?")[0]}?v=${Date.now()}`;

        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        if (existingLinks.length > 0) {
            existingLinks.forEach(link => {
                (link as HTMLLinkElement).href = cacheBustedUrl;
            });
        } else {
            const newLink = document.createElement("link");
            newLink.setAttribute("rel", "icon");
            newLink.href = cacheBustedUrl;
            document.head?.appendChild(newLink);

            const appleLink = document.createElement("link");
            appleLink.setAttribute("rel", "apple-touch-icon");
            appleLink.href = cacheBustedUrl;
            document.head?.appendChild(appleLink);
        }
    };

    const applyTheme = (settings: OrganizationSettings, isSuperAdmin: boolean) => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;

        if (isSuperAdmin) {
            // Apply Super Admin Static Branding variables to root element.
            // Do NOT touch the favicon here — the Super Admin Portal layout
            // owns its own static favicon (see ClientAppXcessLayout) so that
            // editing tenant branding never alters the Super Admin's icon.
            if (root) {
                root.style.setProperty("--primary-color", "#0c32ed");
                root.style.setProperty("--primary-rgb", "12 50 237");
                root.style.setProperty("--sidebar-bg", "#ffffff");
                root.style.setProperty("--sidebar-text", "#0c32ed");
                root.style.setProperty("--sidebar-hover-bg", "rgba(12, 50, 237, 0.05)");
                root.style.setProperty("--sidebar-active-bg", "rgba(12, 50, 237, 0.1)");
                root.style.setProperty("--sidebar-active-text", "#0c32ed");
                root.style.setProperty("--sidebar-border", "rgba(12, 50, 237, 0.1)");
                root.style.setProperty("--sidebar-card-bg", "#ffffff");
                root.style.setProperty("--sidebar-card-border", "rgba(12, 50, 237, 0.05)");
                root.style.setProperty("--sidebar-btn-text", "#ffffff");
                root.style.setProperty("--sidebar-btn-border", "rgba(12, 50, 237, 0.2)");
            }
        } else {
            // General Admin / Tenant Portal — apply the dynamic favicon from
            // the latest /api/settings response. Cache-busted in applyFavicon.
            if (settings.favicon_url) {
                applyFavicon(settings.favicon_url);
            }
            // General Admin / Tenant Portal (Dynamic Branding)
            // Ensure hex starts with #
            const primaryColor = settings.primary_color.startsWith("#")
                ? settings.primary_color
                : `#${settings.primary_color}`;

            const sidebarBg = settings.sidebar_bg_color || "rgba(15, 23, 42, 0.85)";
            const sidebarText = settings.sidebar_text_color || "#94a3b8";
            const isDark = isDarkColor(sidebarBg);

            if (root) {
                root.style.setProperty("--primary-color", primaryColor);
                const rgb = hexToRgb(primaryColor);
                if (rgb) {
                    root.style.setProperty("--primary-rgb", rgb);
                }
                root.style.setProperty("--sidebar-bg", sidebarBg);
                root.style.setProperty("--sidebar-text", sidebarText);

                if (isDark) {
                    root.style.setProperty("--sidebar-hover-bg", "rgba(255, 255, 255, 0.06)");
                    root.style.setProperty("--sidebar-active-bg", "rgba(255, 255, 255, 0.1)");
                    root.style.setProperty("--sidebar-active-text", "#ffffff");
                    root.style.setProperty("--sidebar-border", "rgba(255, 255, 255, 0.08)");
                    root.style.setProperty("--sidebar-card-bg", "rgba(0, 0, 0, 0.2)");
                    root.style.setProperty("--sidebar-card-border", "rgba(255, 255, 255, 0.05)");
                    root.style.setProperty("--sidebar-btn-text", "#ffffff");
                    root.style.setProperty("--sidebar-btn-border", "rgba(255, 255, 255, 0.15)");
                } else {
                    root.style.setProperty("--sidebar-hover-bg", "rgba(0, 0, 0, 0.04)");
                    root.style.setProperty("--sidebar-active-bg", rgb ? `rgba(${rgb}, 0.08)` : "rgba(0, 0, 0, 0.06)");
                    root.style.setProperty("--sidebar-active-text", primaryColor);
                    root.style.setProperty("--sidebar-border", "rgba(0, 0, 0, 0.08)");
                    root.style.setProperty("--sidebar-card-bg", "rgba(255, 255, 255, 0.8)");
                    root.style.setProperty("--sidebar-card-border", "rgba(0, 0, 0, 0.06)");
                    root.style.setProperty("--sidebar-btn-text", "#ffffff");
                    root.style.setProperty("--sidebar-btn-border", "rgba(255, 255, 255, 0.2)");
                }
            }

            // Save to cookies
            if (settings.sidebar_bg_color) setCookie("sidebar_bg", settings.sidebar_bg_color);
            if (settings.sidebar_text_color) setCookie("sidebar_text", settings.sidebar_text_color);
            if (settings.primary_color) setCookie("primary_color", settings.primary_color);
            if (settings.company_name) setCookie("company_name", settings.company_name);
            if (settings.logo_url) setCookie("logo_url", settings.logo_url);
            if (settings.favicon_url) setCookie("favicon_url", settings.favicon_url);

            // Update title if changed
            if (settings.company_name && document.title !== `${settings.company_name} Portal`) {
                document.title = `${settings.company_name} Portal`;
            }
        }
    };

    // Apply theme whenever pathname or settings change
    useEffect(() => {
        if (settings) {
            applyTheme(settings, !!isSuperAdminRoute);
        } else {
            // Apply default theme if settings aren't loaded yet
            if (typeof document !== "undefined") {
                const root = document.documentElement;
                if (isSuperAdminRoute) {
                    if (root) {
                        root.style.setProperty("--primary-color", "#0c32ed");
                        root.style.setProperty("--primary-rgb", "12 50 237");
                        root.style.setProperty("--sidebar-bg", "#ffffff");
                        root.style.setProperty("--sidebar-text", "#0c32ed");
                        root.style.setProperty("--sidebar-hover-bg", "rgba(12, 50, 237, 0.05)");
                        root.style.setProperty("--sidebar-active-bg", "rgba(12, 50, 237, 0.1)");
                        root.style.setProperty("--sidebar-active-text", "#0c32ed");
                        root.style.setProperty("--sidebar-border", "rgba(12, 50, 237, 0.1)");
                        root.style.setProperty("--sidebar-card-bg", "#ffffff");
                        root.style.setProperty("--sidebar-card-border", "rgba(12, 50, 237, 0.05)");
                        root.style.setProperty("--sidebar-btn-text", "#ffffff");
                        root.style.setProperty("--sidebar-btn-border", "rgba(12, 50, 237, 0.2)");
                    }
                } else {
                    const bg = getCookie("sidebar_bg");
                    const text = getCookie("sidebar_text");
                    const primary = getCookie("primary_color");
                    const name = getCookie("company_name");
                    const favicon = getCookie("favicon_url");

                    if (root) {
                        const bgVal = bg || "rgba(15, 23, 42, 0.85)";
                        const textVal = text || "#94a3b8";
                        const primVal = primary ? (primary.startsWith("#") ? primary : `#${primary}`) : "#6366f1";
                        const rgb = hexToRgb(primVal) || "99 102 241";
                        const isDark = isDarkColor(bgVal);

                        root.style.setProperty("--sidebar-bg", bgVal);
                        root.style.setProperty("--sidebar-text", textVal);
                        root.style.setProperty("--primary-color", primVal);
                        root.style.setProperty("--primary-rgb", rgb);

                        if (isDark) {
                            root.style.setProperty("--sidebar-hover-bg", "rgba(255, 255, 255, 0.06)");
                            root.style.setProperty("--sidebar-active-bg", "rgba(255, 255, 255, 0.1)");
                            root.style.setProperty("--sidebar-active-text", "#ffffff");
                            root.style.setProperty("--sidebar-border", "rgba(255, 255, 255, 0.08)");
                            root.style.setProperty("--sidebar-card-bg", "rgba(0, 0, 0, 0.2)");
                            root.style.setProperty("--sidebar-card-border", "rgba(255, 255, 255, 0.05)");
                            root.style.setProperty("--sidebar-btn-text", "#ffffff");
                            root.style.setProperty("--sidebar-btn-border", "rgba(255, 255, 255, 0.15)");
                        } else {
                            root.style.setProperty("--sidebar-hover-bg", "rgba(0, 0, 0, 0.04)");
                            root.style.setProperty("--sidebar-active-bg", `rgba(${rgb}, 0.08)`);
                            root.style.setProperty("--sidebar-active-text", primVal);
                            root.style.setProperty("--sidebar-border", "rgba(0, 0, 0, 0.08)");
                            root.style.setProperty("--sidebar-card-bg", "rgba(255, 255, 255, 0.8)");
                            root.style.setProperty("--sidebar-card-border", "rgba(0, 0, 0, 0.06)");
                            root.style.setProperty("--sidebar-btn-text", "#ffffff");
                            root.style.setProperty("--sidebar-btn-border", "rgba(255, 255, 255, 0.2)");
                        }
                    }
                    if (name) {
                        document.title = `${name} Portal`;
                    }
                    if (favicon) {
                        applyFavicon(favicon);
                    }
                }
            }
        }
    }, [pathname, settings, isSuperAdminRoute]);

    useEffect(() => {
        // Initial application of colors and content from cookies to avoid flicker.
        // Only seed from cookies on General Admin routes — Super Admin must always
        // load its own branding fresh from /api/appxcess/settings.
        if (typeof document !== "undefined" && !isSuperAdminRoute) {
            const bg = getCookie("sidebar_bg");
            const text = getCookie("sidebar_text");
            const primary = getCookie("primary_color");
            const logo = getCookie("logo_url");
            const name = getCookie("company_name");
            const favicon = getCookie("favicon_url");

            if (logo || name) {
                setSettings({
                    company_name: name || "",
                    logo_url: logo || null,
                    favicon_url: favicon || null,
                    primary_color: primary || "#000000",
                    sidebar_bg_color: bg || "#ffffff",
                    sidebar_text_color: text || "#000000",
                    sidebar_enabled: true,
                } as OrganizationSettings);
            }
        }

        // Re-fetch from the appropriate endpoint whenever the user crosses the
        // Super Admin / General Admin boundary so we never render stale settings
        // from the previous portal's endpoint.
        refreshSettings();

        // Setup cross-tab sync
        const channel = new BroadcastChannel("theme_sync");
        channel.onmessage = (event) => {
            if (event.data === "refresh") {
                refreshSettings();
            }
        };

        return () => {
            channel.close();
            // Cancel any in-flight request on unmount so the resulting
            // AbortError doesn't surface as an unhandled rejection.
            if (inFlightAbortRef.current) {
                inFlightAbortRef.current.abort();
                inFlightAbortRef.current = null;
            }
        };
    }, [isSuperAdminRoute]);

    // Sync on window focus to catch updates from other tabs, but debounce so
    // alt-tabbing every few seconds doesn't hammer the backend.
    useEffect(() => {
        let lastFetch = 0;
        const MIN_INTERVAL_MS = 30000;
        const handleFocus = () => {
            const now = Date.now();
            if (now - lastFetch < MIN_INTERVAL_MS) return;
            lastFetch = now;
            refreshSettings();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    return (
        <ThemeContext.Provider value={{
            settings,
            refreshSettings: async () => {
                await refreshSettings();
                // Notify other tabs
                new BroadcastChannel("theme_sync").postMessage("refresh");
            },
            loading
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
