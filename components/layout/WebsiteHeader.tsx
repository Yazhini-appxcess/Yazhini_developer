"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { API_URL } from "@/lib/api";



interface HeaderLink {
    name: string;
    href: string;
}

interface WebsiteConfig {
    company_name?: string;
    logo_url?: string;
    navbar_login_link?: string;
    navbar_login_text?: string;
    navbar_cta_link?: string;
    navbar_cta_text?: string;
    header_links?: HeaderLink[];
}

export default function WebsiteHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [config, setConfig] = useState<WebsiteConfig | null>(null);
    const [headerLinks, setHeaderLinks] = useState<HeaderLink[]>([]);

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/website/config`);
            if (response.data) {
                setConfig(response.data);
                if (response.data.header_links && response.data.header_links.length > 0) {
                    setHeaderLinks(response.data.header_links);
                } else {
                    // Fallback default links if none returned
                    setHeaderLinks([
                        { name: "Services", href: "#services" },
                        { name: "Safety", href: "#safety" },
                        { name: "About", href: "#about" },
                        { name: "Community", href: "#community" }
                    ]);
                }
            }
        } catch (error) {
            console.error("Error fetching website config for header:", error);
            // Default fallback on error
            setHeaderLinks([
                { name: "Services", href: "#services" },
                { name: "Safety", href: "#safety" },
                { name: "About", href: "#about" },
                { name: "Community", href: "#community" }
            ]);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        setTimeout(fetchConfig, 0);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const companyName = config?.company_name || "Leucadia";
    const logoUrl = config?.logo_url || "/LWWD.png";

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-6 px-4 pointer-events-none"
        >
            <div
                className={`w-full max-w-7xl flex justify-between items-center px-8 py-4 transition-all duration-700 rounded-[2.5rem] border pointer-events-auto ${scrolled
                    ? "bg-black border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] scale-[0.98] translate-y-2"
                    : "bg-black/40 backdrop-blur-md border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    }`}
            >
                {/* Logo & Name */}
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="relative size-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-40 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="relative z-10 size-10 object-contain rounded-lg filter brightness-110 group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent group-hover:to-blue-400 transition-all duration-500">
                        {companyName}
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="hidden lg:flex items-center gap-12">
                    {headerLinks.map((link: HeaderLink, index: number) => (
                        <a
                            key={index}
                            href={link.href}
                            className="text-xs font-black uppercase tracking-[0.2em] text-white hover:text-blue-400 transition-all transform hover:-translate-y-0.5 relative group/link"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-hover/link:w-full"></span>
                        </a>
                    ))}

                    <div className="flex items-center gap-4">
                        {/* Login Link */}
                        <Link href={config?.navbar_login_link || "/login"} className="text-white hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors">
                            {config?.navbar_login_text || "Log In"}
                        </Link>

                        {/* CTA: Portal */}
                        <Link href={config?.navbar_cta_link || "/portal"} className="px-8 py-3.5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-white/20 hover:scale-105 active:scale-95 hover:bg-slate-100">
                            {config?.navbar_cta_text || "Customer Portal"}
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <div className="size-10 rounded-xl bg-slate-900 flex flex-col items-center justify-center border border-white/10">
                        <div className="w-5 h-px bg-white mb-1.5"></div>
                        <div className="w-5 h-px bg-white"></div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
