"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Server, User, Key, CheckCircle, ArrowLeft, Shield, Info, HelpCircle } from "lucide-react";

export default function Sage300Page() {
    const router = useRouter();
    const [config, setConfig] = useState({
        apiUrl: "",
        companyId: "",
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
            {/* Left Sidebar */}
            <CLSidebar />

            {/* Main Content */}
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
                                            src="https://www.google.com/s2/favicons?domain=sage.com&sz=128"
                                            alt="Sage"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Sage CRE Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Configure your connection to the Sage CRE ERP system to sync financial and operational data.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Sage CRE Web API URL
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="https://api.yourcompany.com/SageCRE/v1.0"
                                            value={config.apiUrl}
                                            onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">The base URL for your Sage CRE Web API endpoint</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Server className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Company Database ID
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="SAMINC"
                                            value={config.companyId}
                                            onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">The database ID of your company (e.g., SAMINC)</p>
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
                                                placeholder="Enter username"
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
                                            <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Connection</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">API Access</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Ensure the Web API is enabled in your Sage CRE setup and the firewall allows traffic from this IP.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Security</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">We recommend using a dedicated service account with read-only permissions for integrations.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Need Help?</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">View our documentation for a step-by-step guide on setting up the Sage CRE Web API.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
