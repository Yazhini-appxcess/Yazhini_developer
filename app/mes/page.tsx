"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/lib/api";

import { MES_INTEGRATIONS } from "@/lib/integrations-data";

export default function MESHubPage() {
    const router = useRouter();

    const loading = false;

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
        }
    }, [router]);


    return (
        <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase font-display">MES Integrations</h1>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium font-sans">Power Manufacturing Execution with real-time shop floor data.</p>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 shadow-sm animate-pulse uppercase tracking-wider">
                                <span className="hidden sm:inline">Real-time Sync Enabled</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {MES_INTEGRATIONS.map((mes) => (
                                    <div
                                        key={mes.id}
                                        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden flex flex-col"
                                    >
                                        {/* Vibrant Background Accents */}
                                        <div
                                            className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                            style={{ backgroundColor: mes.primary_color }}
                                        ></div>

                                        {/* Background Logo */}
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 translate-x-4 -translate-y-4">
                                            <img src={mes.logo_url} alt="" className="w-32 h-32 grayscale object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>

                                        <div className="relative z-10 flex-1">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center p-2.5 mb-6 transition-all duration-350 group-hover:scale-105 shadow-sm border bg-white"
                                                style={{
                                                    borderColor: `${mes.primary_color}20`
                                                }}
                                            >
                                                <img src={mes.logo_url} alt={mes.name} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-800 mb-2 tracking-tight">{mes.name}</h3>
                                            <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3 group-hover:text-slate-600 transition-colors">{mes.description}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 relative z-10">
                                            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div
                                                    className="w-2 h-2 rounded-full mr-2 shadow-[0_0_8px] animate-pulse"
                                                    style={{ backgroundColor: mes.primary_color }}
                                                ></div>
                                                Secure
                                            </div>
                                            <Link
                                                href={`/mes/${mes.slug}`}
                                                className="btn-primary inline-flex items-center gap-1.5 py-2"
                                            >
                                                Configure
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>

                                        {/* Hover Edge Highlight */}
                                        <div
                                            className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                            style={{ backgroundColor: mes.primary_color }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Integration Guide */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center text-xs uppercase tracking-wider">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-xs font-bold">i</span>
                                Integration Security Note
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                                <div className="space-y-2">
                                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Operational Integrity</h5>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">MES integrations maintain manufacturing data integrity with industrial-grade encryption.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Shop Floor Visibility</h5>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Real-time data synchronization ensures your assistant has the latest production status.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Secure Connectivity</h5>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Factory floor connections are isolated and protected through secure gateway protocols.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
