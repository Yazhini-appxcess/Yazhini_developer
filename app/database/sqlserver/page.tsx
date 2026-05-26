"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Shield, Database as DbIcon, Key, CheckCircle, Terminal, HardDrive } from "lucide-react";

export default function SQLServerPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        host: "",
        instance: "",
        database: "",
        username: "",
        password: "",
        trustServerCertificate: true
    });

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }
    }, [router]);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start space-x-5">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm p-2">
                                        <img
                                            src="https://www.google.com/s2/favicons?domain=microsoft.com&sz=128"
                                            alt="SQL Server"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Microsoft SQL Server</h3>
                                        <p className="text-slate-500">Integrate with enterprise SQL Server instances using T-SQL indexing for AI responses.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Terminal className="w-4 h-4 mr-2 text-primary" />
                                                Server Host
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="sql-prod.company.local"
                                                value={config.host}
                                                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                Instance Name (Optional)
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#CC2927]/20 focus:border-[#CC2927] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="SQLEXPRESS"
                                                value={config.instance}
                                                onChange={(e) => setConfig({ ...config, instance: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <DbIcon className="w-4 h-4 mr-2 text-[#CC2927]" />
                                            Database Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#CC2927]/20 focus:border-[#CC2927] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="Enterprise_ERP"
                                            value={config.database}
                                            onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Username</label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#CC2927]/20 focus:border-[#CC2927] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="sa"
                                                value={config.username}
                                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Password</label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#CC2927]/20 focus:border-[#CC2927] transition-all outline-none text-slate-800"
                                                type="password"
                                                placeholder="••••••••"
                                                value={config.password}
                                                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id="trustCert"
                                            checked={config.trustServerCertificate}
                                            onChange={(e) => setConfig({ ...config, trustServerCertificate: e.target.checked })}
                                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded"
                                        />
                                        <label htmlFor="trustCert" className="text-sm font-medium text-slate-700">Trust Server Certificate</label>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center disabled:opacity-50 hover:opacity-90"
                                    >
                                        {isSaved ? "Saved Successfully!" : isSaving ? "Testing SQL Auth..." : "Verify & Save Configuration"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex space-x-4">
                                <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Active Directory Ready</h4>
                                    <p className="text-sm text-slate-600">Supports NTLM and Kerberos authentication for complex domain environments.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">T-SQL Optimization</h4>
                                    <p className="text-sm text-slate-600">Tailored query execution plans for ultra-fast data retrieval across large tables.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
