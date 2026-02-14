"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Shield, Database as DbIcon, Key, CheckCircle, Terminal, HardDrive } from "lucide-react";

export default function DatabasePage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        dbType: "postgresql",
        host: "",
        port: "5432",
        database: "",
        username: "",
        password: ""
    });

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (!user.is_superuser) {
                router.push("/");
            }
        } catch (e) {
            router.push("/login");
        }
    }, [router]);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            {/* Left Sidebar */}
            <CLSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start space-x-5">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
                                            alt="Database"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Database Integration</h3>
                                        <p className="text-slate-500">Connect your structured databases for direct indexing. Supported: PostgreSQL, MySQL, SQL Server, and MongoDB.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <HardDrive className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Database Type
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                value={config.dbType}
                                                onChange={(e) => setConfig({ ...config, dbType: e.target.value })}
                                            >
                                                <option value="postgresql">PostgreSQL</option>
                                                <option value="mysql">MySQL</option>
                                                <option value="sqlserver">Microsoft SQL Server</option>
                                                <option value="mongodb">MongoDB</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Terminal className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Host & Port
                                            </label>
                                            <div className="flex space-x-2">
                                                <input
                                                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                    type="text"
                                                    placeholder="localhost or 10.0.0.1"
                                                    value={config.host}
                                                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                                />
                                                <input
                                                    className="w-24 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                    type="text"
                                                    placeholder="5432"
                                                    value={config.port}
                                                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <DbIcon className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Database Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="leucadia_prod"
                                            value={config.database}
                                            onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Username</label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="db_user"
                                                value={config.username}
                                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Password</label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="password"
                                                placeholder="••••••••"
                                                value={config.password}
                                                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-10 py-2.5 bg-[#01284e] hover:bg-primary text-white font-bold rounded-lg shadow-lg shadow-[#01284e]/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                        {isSaved ? "Connected!" : isSaving ? "Testing..." : "Test & Save Connection"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Encrypted Tunnel</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">All database connections are established via encrypted SSL/TLS tunnels. We recommend using a read-only user for the AI integration.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Schema Auto-Discovery</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Leucadia Copilot automatically discovers your schema to understand relationships between tables for accurate SQL generation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
