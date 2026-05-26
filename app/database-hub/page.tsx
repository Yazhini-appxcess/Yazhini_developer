"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/api";

import { DATABASE_INTEGRATIONS } from "@/lib/integrations-data";

export default function DatabaseHubPage() {
    const router = useRouter();

    const loading = false;

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");

        }
    }, [router]);


    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Database Hub</h2>
                                <p className="text-slate-500 mt-2 text-lg">Connect structured data sources directly to Internal Assistant&apos;s knowledge engine.</p>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20 shadow-sm animate-pulse">
                                <span className="hidden sm:inline">Schema Auto-Discovery Active</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {DATABASE_INTEGRATIONS.map((db) => (
                                    <div
                                        key={db.id}
                                        className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden flex flex-col"
                                    >
                                        {/* Vibrant Background Accents */}
                                        <div
                                            className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                            style={{ backgroundColor: db.primary_color }}
                                        ></div>

                                        {/* Background Logo */}
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 translate-x-4 -translate-y-4">
                                            <img src={db.logo_url} alt="" className="w-32 h-32 grayscale object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>

                                        <div className="relative z-10 flex-1">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center p-3 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border"
                                                style={{
                                                    backgroundColor: `${db.primary_color}08`,
                                                    borderColor: `${db.primary_color}20`
                                                }}
                                            >
                                                <img src={db.logo_url} alt={db.name} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">{db.name}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 group-hover:text-slate-600 transition-colors">{db.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 relative z-10">
                                            <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                                <div
                                                    className="w-2 h-2 rounded-full mr-2 shadow-[0_0_8px] animate-pulse"
                                                    style={{ backgroundColor: db.primary_color, boxShadow: `0 0 12px ${db.primary_color}80` }}
                                                ></div>
                                                Structured
                                            </div>
                                            <Link
                                                href={`/database/${db.slug}`}
                                                className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/10 hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                Connect
                                                <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>

                                        {/* Hover Edge Highlight */}
                                        <div
                                            className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                            style={{ backgroundColor: db.primary_color }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Security Footer */}
                        <div className="bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start">
                                        Secure Direct Connectivity
                                    </h3>
                                    <p className="text-blue-100/70 max-w-xl">
                                        Leucadia uses AWS PrivateLink and Peer-to-Peer tunneling to securely access your databases. Your data is indexed locally and never shared with external AI models.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-blue-300/60 uppercase font-black tracking-widest">Compliance</p>
                                        <p className="text-sm font-bold">SOC2 & HIPAA Ready</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
