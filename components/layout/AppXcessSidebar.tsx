"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    Palette,
    PanelLeft,
    LogOut,
    ChevronRight,
    MessageSquare,
    LucideIcon,
    Globe,
    HardDrive,
    Webhook
} from "lucide-react";


interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

const SidebarItem = ({ href, icon: Icon, label }: SidebarItemProps) => {
    const pathname = usePathname() || "";
    const router = useRouter();
    const isActive = pathname === href;

    return (
        <button
            onClick={() => router.push(href)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-semibold text-sm tracking-tight">{label}</span>
            </div>
            {isActive && <ChevronRight className="w-4 h-4 text-white/70 animate-pulse" />}
        </button>
    );
};

export default function AppXcessSidebar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("appxcess_token");
        router.push("/appxcess/login");
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen flex-shrink-0 relative z-20">
            {/* Header / Logo Area */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push("/appxcess/dashboard/branding")}>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-2.5 shadow-xl shadow-slate-200 group-hover:scale-105 transition-all duration-300">
                        <img src="/appxcess_logo.png" alt="Logo" className="w-full h-full object-contain filter brightness-110" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">AppXcess</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Control
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="col-span-full h-px bg-slate-100 mb-4 mx-4" />

                <div className="px-4 mb-3 mt-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Settings</p>
                </div>


                <SidebarItem
                    href="/appxcess/dashboard/branding"
                    icon={Palette}
                    label="Brand Identity"
                />

                <SidebarItem
                    href="/appxcess/dashboard/ai-config"
                    icon={MessageSquare}
                    label="AI Configuration"
                />

                <SidebarItem
                    href="/appxcess/dashboard/sidebar"
                    icon={PanelLeft}
                    label="Sidebar Layout"
                />

                <SidebarItem
                    href="/appxcess/dashboard/widget"
                    icon={MessageSquare}
                    label="Widget Config"
                />

                {/* TODO: Re-enable Website Module later */}
                {/* Website Module sidebar item is hidden. Website Generation below
                    stays visible — gated by its own feature flag in
                    /appxcess/website-generation/page.tsx (ENABLE_WEBSITE_GENERATION).
                    To restore the Website Module entry, uncomment the SidebarItem
                    block below and flip ENABLE_WEBSITE_MODULE to true in
                    /appxcess/dashboard/config-site/page.tsx. */}
                {/*
                <SidebarItem
                    href="/appxcess/dashboard/config-site"
                    icon={Globe}
                    label="Website"
                />
                */}

                <SidebarItem
                    href="/appxcess/website-generation"
                    icon={Webhook}
                    label="Website Generation"
                />
            </nav>

            {/* Footer / User Profile Area */}
            <div className="p-4 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">AppXcess Admin</p>
                            <p className="text-[11px] text-slate-500 truncate">System Owner</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
