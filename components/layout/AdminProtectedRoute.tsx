"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { checkAuthStatus, getAuthToken, checkAppXcessAuthStatus } from "@/lib/auth";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";
    const router = useRouter();
    const { settings } = useTheme();
    const [checking, setChecking] = useState(true);

    // List of public routes that bypass authentication
    const publicRoutes = ["/login", "/appxcess/login", "/website", "/landing-page", "/landing"];

    useEffect(() => {
        const verifyAuth = async () => {
            // Check if current route is public
            const isPublic = publicRoutes.includes(pathname);

            // Check if Control Plane (AppXcess) route (excluding backup which is a general superadmin feature)
            const isAppXcess = pathname.startsWith("/appxcess") && !pathname.startsWith("/appxcess/backup");

            if (isPublic) {
                setChecking(false);
                return;
            }

            if (isAppXcess) {
                // Control plane route guard
                const appxcessToken = localStorage.getItem("appxcess_token");
                if (!appxcessToken) {
                    router.replace("/appxcess/login");
                    return;
                }

                // Validate appxcess token against backend API
                const isValid = await checkAppXcessAuthStatus();
                if (!isValid) {
                    router.replace("/appxcess/login");
                } else {
                    setChecking(false);
                }
                return;
            }

            // General Admin route guard
            const token = getAuthToken();
            if (!token) {
                router.replace("/login");
                return;
            }

            // Validate token against backend API
            const isValid = await checkAuthStatus();
            if (!isValid) {
                router.replace("/login");
            } else {
                setChecking(false);
            }
        };

        verifyAuth();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "admin_token" || e.key === "appxcess_token") {
                setChecking(true);
                verifyAuth();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [pathname, router]);

    if (checking) {
        const isAppXcess = (pathname.startsWith("/appxcess") && !pathname.startsWith("/appxcess/backup")) || pathname.startsWith("/super-admin");
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    {isAppXcess ? (
                        <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                            <img
                                src="/appxcess_logo.png"
                                alt="AppXcess"
                                className="w-full h-full object-contain animate-pulse"
                            />
                        </div>
                    ) : (
                        settings?.logo_url && (
                            <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                                <img
                                    src={settings.logo_url}
                                    alt={settings.company_name || "Logo"}
                                    className="w-full h-full object-contain animate-pulse"
                                />
                            </div>
                        )
                    )}
                    <div className="flex flex-col items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tighter text-slate-900 animate-pulse text-center">
                            Verifying Session...
                        </h2>
                        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-slate-900 animate-[loading-bar_1.5s_infinite_ease-in-out] rounded-full"
                                style={{
                                    backgroundColor: isAppXcess
                                        ? '#0c32ed'
                                        : settings?.primary_color?.startsWith('#')
                                            ? settings.primary_color
                                            : settings?.primary_color
                                                ? `#${settings.primary_color}`
                                                : '#0c32ed'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <style jsx global>{`
                    @keyframes loading-bar {
                        0% { transform: translateX(-100%); }
                        50% { transform: translateX(0); }
                        100% { transform: translateX(100%); }
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
}
