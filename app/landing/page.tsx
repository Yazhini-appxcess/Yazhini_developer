"use client";

import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";
import Script from "next/script";

export default function LandingPage() {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch public landing content (no auth required)
                const response = await fetch(API_ENDPOINTS.websiteGenerator.landingContent);
                if (!response.ok) throw new Error("Failed to load content");

                const data = await response.json();
                setHtmlContent(data.html);
            } catch (err) {
                console.error(err);
                setError("Unable to load the landing page.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        );
    }

    if (error || !htmlContent) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
                <div className="text-center p-8 max-w-md">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h1>
                    <p className="text-slate-500">This landing page is not yet active.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen overflow-hidden">
            <Script
                src={`${API_ENDPOINTS.base}/api/bot/widget.js`}
                strategy="afterInteractive"
            />
            <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-none"
                title="Landing Page"
            />
        </div>
    );
}
