"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight, ExternalLink } from "lucide-react";

const erpIntegrations = [
    {
        name: "Sage Connect",
        description: "Enterprise ERP connection for financial and operational data synchronization.",
        href: "/sage-300",
        logo: "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
        color: "#00DC80"
    },
    {
        name: "Procore",
        description: "Sync construction projects, documents, and RFI data directly with Leucadia.",
        href: "/procore",
        logo: "https://www.google.com/s2/favicons?domain=procore.com&sz=128",
        color: "#000000"
    },
    {
        name: "Oracle ERP Cloud",
        description: "Connect to Oracle Fusion Cloud ERP via REST APIs for enterprise resource syncing.",
        href: "/erp/oracle",
        logo: "https://www.google.com/s2/favicons?domain=oracle.com&sz=128",
        color: "#F80000"
    },
    {
        name: "SAP Business One",
        description: "Integrate with SAP Service Layer to sync business partners and accounting records.",
        href: "/erp/sap",
        logo: "https://www.google.com/s2/favicons?domain=sap.com&sz=128",
        color: "#008FD3"
    }
];

export default function ERPHubPage() {
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }
    }, [router]);

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ERP Hub</h2>
                            <p className="text-slate-500 mt-2 text-lg">Select an enterprise resource planning system to integrate with Leucadia Copilot.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {erpIntegrations.map((erp) => (
                                <div
                                    key={erp.name}
                                    className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden flex flex-col"
                                >
                                    {/* Vibrant Background Accents */}
                                    <div
                                        className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                        style={{ backgroundColor: erp.color }}
                                    ></div>

                                    {/* Background Logo */}
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 translate-x-4 -translate-y-4">
                                        <img src={erp.logo} alt="" className="w-32 h-32 grayscale object-contain" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center p-3 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border"
                                            style={{
                                                backgroundColor: `${erp.color}08`,
                                                borderColor: `${erp.color}20`
                                            }}
                                        >
                                            <img src={erp.logo} alt={erp.name} className="w-full h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">{erp.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 group-hover:text-slate-600 transition-colors">{erp.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2 shadow-[0_0_8px] animate-pulse"
                                                style={{ backgroundColor: erp.color, boxShadow: `0 0 12px ${erp.color}80` }}
                                            ></div>
                                            Enterprise
                                        </div>
                                        <Link
                                            href={erp.href}
                                            className="inline-flex items-center px-5 py-2.5 bg-[#01284e] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Integrate Now
                                            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Hover Edge Highlight */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                        style={{ backgroundColor: erp.color }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Help Section */}
                        <div className="bg-[#01284e] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <h3 className="text-2xl font-bold">Don't see your ERP system?</h3>
                                    <p className="text-blue-100/70 max-w-xl">
                                        We are constantly adding new native integrations. In the meantime, you can use our generic
                                        <strong> API Connector</strong> or <strong>Database Link</strong> to sync your data.
                                    </p>
                                </div>
                                <Link
                                    href="/api-docs"
                                    className="px-8 py-4 bg-white text-[#01284e] rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-black/20"
                                >
                                    Custom Integration
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
