"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight, Database as DbIcon, Shield, Search } from "lucide-react";

const dbIntegrations = [
    {
        name: "PostgreSQL",
        description: "Standard open-source relational database for robust document and record storage.",
        href: "/database/postgresql",
        logo: "https://www.google.com/s2/favicons?domain=postgresql.org&sz=128",
        color: "#336791"
    },
    {
        name: "MySQL",
        description: "Widely used relational database for general purpose data indexing and retrieval.",
        href: "/database/mysql",
        logo: "https://www.google.com/s2/favicons?domain=mysql.com&sz=128",
        color: "#00758F"
    },
    {
        name: "Microsoft SQL Server",
        description: "Enterprise-level relational database for high-performance specialized data sets.",
        href: "/database/sqlserver",
        logo: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
        color: "#CC2927"
    },
    {
        name: "MongoDB",
        description: "NoSQL document database for flexible JSON-like data ingestion and searching.",
        href: "/database/mongodb",
        logo: "https://www.google.com/s2/favicons?domain=mongodb.com&sz=128",
        color: "#47A248"
    },
    {
        name: "Oracle DB",
        description: "Connect to legacy Oracle instances for deep enterprise knowledge base indexing.",
        href: "/database/oracle",
        logo: "https://www.google.com/s2/favicons?domain=oracle.com&sz=128",
        color: "#F80000"
    },
    {
        name: "Supabase",
        description: "Modern cloud-native Postgres with built-in vector support for AI applications.",
        href: "/database/supabase",
        logo: "https://www.google.com/s2/favicons?domain=supabase.com&sz=128",
        color: "#3ECF8E"
    }
];

export default function DatabaseHubPage() {
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
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Database Hub</h2>
                                <p className="text-slate-500 mt-2 text-lg">Connect structured data sources directly to Leucadia Copilot's knowledge engine.</p>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm animate-pulse">
                                <Search className="w-3 h-3" />
                                <span>Schema Auto-Discovery Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dbIntegrations.map((db) => (
                                <div
                                    key={db.name}
                                    className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group relative overflow-hidden flex flex-col"
                                >
                                    {/* Vibrant Background Accents */}
                                    <div
                                        className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                        style={{ backgroundColor: db.color }}
                                    ></div>

                                    {/* Background Logo */}
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 translate-x-4 -translate-y-4">
                                        <img src={db.logo} alt="" className="w-32 h-32 grayscale object-contain" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center p-3 mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border"
                                            style={{
                                                backgroundColor: `${db.color}08`,
                                                borderColor: `${db.color}20`
                                            }}
                                        >
                                            <img src={db.logo} alt={db.name} className="w-full h-full object-contain" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">{db.name}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 group-hover:text-slate-600 transition-colors">{db.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 relative z-10">
                                        <div className="flex items-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2 shadow-[0_0_8px] animate-pulse"
                                                style={{ backgroundColor: db.color, boxShadow: `0 0 12px ${db.color}80` }}
                                            ></div>
                                            Structured
                                        </div>
                                        <Link
                                            href={db.href}
                                            className="inline-flex items-center px-5 py-2.5 bg-[#01284e] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Connect
                                            <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Hover Edge Highlight */}
                                    <div
                                        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-out"
                                        style={{ backgroundColor: db.color }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Security Footer */}
                        <div className="bg-[#01284e] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 text-center md:text-left">
                                    <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start">
                                        <Shield className="mr-3 w-7 h-7 text-blue-400" />
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
