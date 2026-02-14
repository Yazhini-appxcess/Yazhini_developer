"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight, Sparkles } from "lucide-react";

const crmIntegrations = [
    {
        name: "Zoho CRM",
        description: "Sync leads, contacts, and deal information to ground AI responses in actual customer data.",
        href: "/crm/zoho",
        logo: "https://www.google.com/s2/favicons?domain=zoho.com&sz=128",
        color: "#000000"
    },
    {
        name: "Salesforce",
        description: "Enterprise-grade Lightning integration for deep CRM knowledge indexing.",
        href: "/crm/salesforce",
        logo: "https://www.google.com/s2/favicons?domain=salesforce.com&sz=128",
        color: "#00A1E0"
    },
    {
        name: "HubSpot",
        description: "Connect marketing, sales, and service hubs to provide a 360-degree customer view.",
        href: "/crm/hubspot",
        logo: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=128",
        color: "#FF7A59"
    },
    {
        name: "Pipedrive",
        description: "Analyze sales pipelines and deal flows to drive intelligent AI recommendations.",
        href: "/crm/pipedrive",
        logo: "https://www.google.com/s2/favicons?domain=pipedrive.com&sz=128",
        color: "#06211C"
    }
];

export default function CRMHubPage() {
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
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">CRM Integrations</h2>
                                <p className="text-slate-500 mt-2 text-lg">Power Leucadia Copilot with your customer relationship data.</p>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 shadow-sm animate-pulse">
                                <Sparkles className="w-3 h-3" />
                                <span>Real-time Sync Enabled</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {crmIntegrations.map((crm) => (
                                <div
                                    key={crm.name}
                                    className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden flex flex-col"
                                >
                                    {/* Vibrant Background Accents */}
                                    <div
                                        className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                        style={{ backgroundColor: crm.color }}
                                    ></div>

                                    {/* Background Logo */}
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 translate-x-4 -translate-y-4">
                                        <img src={crm.logo} alt="" className="w-32 h-32 grayscale object-contain" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center p-3 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border"
                                            style={{
                                                backgroundColor: `${crm.color}08`,
                                                borderColor: `${crm.color}20`
                                            }}
                                        >
                                            <img src={crm.logo} alt={crm.name} className="w-full h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">{crm.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 group-hover:text-slate-600 transition-colors">{crm.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2 shadow-[0_0_8px] animate-pulse"
                                                style={{ backgroundColor: crm.color, boxShadow: `0 0-12px ${crm.color}80` }}
                                            ></div>
                                            Secure
                                        </div>
                                        <Link
                                            href={crm.href}
                                            className="inline-flex items-center px-5 py-2.5 bg-[#01284e] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Configure
                                            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Hover Edge Highlight */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                        style={{ backgroundColor: crm.color }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Integration Guide */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm italic">i</span>
                                Integration Security Note
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <h5 className="font-bold text-sm text-slate-800">End-to-End Encryption</h5>
                                    <p className="text-xs text-slate-500 leading-relaxed">All CRM data is encrypted at rest and during transit using AES-256 and TLS 1.3 standards.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-sm text-slate-800">Scoped Permissions</h5>
                                    <p className="text-xs text-slate-500 leading-relaxed">Leucadia only requests read-only scopes necessary for document and record indexing.</p>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-sm text-slate-800">User Data Control</h5>
                                    <p className="text-xs text-slate-500 leading-relaxed">You can revoke access and purge synced CRM data directly from your integration settings at any time.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
