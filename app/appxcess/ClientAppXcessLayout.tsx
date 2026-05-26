"use client";

import React, { useEffect } from "react";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { usePathname } from "next/navigation";

export default function ClientAppXcessLayout({
    children,
    interClassName,
}: {
    children: React.ReactNode;
    interClassName: string;
}) {
    const pathname = usePathname();

    // Lock title and favicon for the Super Admin portal. The Super Admin Portal
    // owns its own static favicon — separate from the tenant's dynamic favicon
    // which the Brand Identity page edits and ThemeContext renders for General
    // Admin routes.
    useEffect(() => {
        if (typeof document !== "undefined") {
            document.title = "Super Admin Portal";

            const iconUrl = "/super_admin_favicon.png";
            let link = document.querySelector("link[rel='icon']");
            if (!link) {
                link = document.createElement("link");
                link.setAttribute("rel", "icon");
                if (document.head) {
                    document.head.appendChild(link);
                }
            }
            if (link) {
                (link as HTMLLinkElement).href = `${iconUrl}?v=${Date.now()}`;
            }
        }
    }, [pathname]);

    return (
        <ErrorBoundary>
            <div className={`min-h-screen bg-gray-100 ${interClassName}`}>
                {children}
            </div>
        </ErrorBoundary>
    );
}
