"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, Database, ArrowLeft } from "lucide-react";

export default function OracleERPPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        hostname: "",
        port: "443",
        serviceId: "",
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
        <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <CLHeader />

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
                        <button
                            onClick={() => router.push("/erp")}
                            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[11px] uppercase tracking-wider group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                            Back to ERP Hub
                        </button>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/[0.15] relative overflow-hidden">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                                        <img
                                            src="https://www.google.com/s2/favicons?domain=oracle.com&sz=128"
                                            alt="Oracle"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Oracle ERP Cloud Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Configure your connection to Oracle Fusion Cloud ERP via REST APIs to sync enterprise resource data.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="md:col-span-3 space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    API Hostname
                                                </label>
                                                <input
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                    type="text"
                                                    placeholder="ebiz-xxxx.oraclecloud.com"
                                                    value={config.hostname}
                                                    onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    Port
                                                </label>
                                                <input
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                    type="text"
                                                    placeholder="443"
                                                    value={config.port}
                                                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Oracle ERP URL
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="Enter Service ID"
                                            value={config.serviceId}
                                            onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                Username
                                            </label>
                                            <input
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                type="text"
                                                placeholder="Enter Oracle username"
                                                value={config.username}
                                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                Password
                                            </label>
                                            <input
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                type="password"
                                                placeholder="••••••••"
                                                value={config.password}
                                                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn-primary w-full sm:w-auto px-6 py-2"
                                    >
                                        {isSaved ? (
                                            <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Saved!</>
                                        ) : isSaving ? (
                                            "Saving..."
                                        ) : (
                                            <><Save className="w-3.5 h-3.5 mr-1.5" /> Authorize Integration</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">REST API Support</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">This integration uses the standard Oracle Fusion Cloud REST APIs. Ensure &apos;Integration Specialist&apos; role is assigned to the service account.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Data Indexing</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Oracle data is vectorized and securely stored in our vault to allow the AI to answer complex enterprise resource queries.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
