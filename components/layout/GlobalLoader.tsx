"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export default function GlobalLoader() {
    const { loading, settings } = useTheme();
    const [show, setShow] = useState(true);

    // Smooth transition out
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => setShow(false), 500);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setShow(true), 0);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="flex flex-col items-center gap-6">
                {/* Logo if available */}
                {settings?.logo_url && (
                    <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                        <img
                            src={settings.logo_url}
                            alt={settings.company_name || "Logo"}
                            className="w-full h-full object-contain animate-pulse"
                        />
                    </div>
                )}

                <div className="flex flex-col items-center gap-3">
                    {/* Company Name or Loading Text */}
                    <h2 className="text-xl font-bold tracking-tighter text-slate-900 animate-pulse text-center">
                        {settings?.company_name || "Loading..."}
                    </h2>

                    {/* Subtle Progress Bar */}
                    <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full animate-[loading-bar_1.5s_infinite_ease-in-out] rounded-full"
                            style={{
                                backgroundColor: settings?.primary_color?.startsWith('#')
                                    ? settings.primary_color
                                    : settings?.primary_color
                                        ? `#${settings.primary_color}`
                                        : '#0f172a'
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
