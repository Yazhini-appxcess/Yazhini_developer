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
        if (typeof document !== "undefined" && pathname !== "/appxcess/backup") {
            document.title = "Super Admin Portal";

            const iconUrl = "/super_admin_favicon.png";
            const cacheBustedUrl = `${iconUrl}?v=${Date.now()}`;

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
