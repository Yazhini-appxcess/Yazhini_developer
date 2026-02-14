"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Server, User, Key, CheckCircle } from "lucide-react";

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
                                            src="https://www.google.com/s2/favicons?domain=sage.com&sz=128"
                                            alt="Sage"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Sage CRE Integration</h3>
                                        <p className="text-slate-500">Configure your connection to the Sage CRE ERP system to sync financial and operational data.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Globe className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Sage CRE Web API URL
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="https://api.yourcompany.com/SageCRE/v1.0"
                                            value={config.apiUrl}
                                            onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-400 italic">The base URL for your Sage CRE Web API endpoint</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Server className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Company Database ID
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="SAMINC"
                                            value={config.companyId}
                                            onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-400 italic">The database ID of your company (e.g., SAMINC)</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <User className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Username
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="Enter username"
                                                value={config.username}
                                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Key className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Password
                                            </label>
                                            <div className="relative">
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
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-10 py-2.5 bg-[#01284e] hover:bg-primary text-white font-bold rounded-lg shadow-lg shadow-[#01284e]/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaved ? "Saved!" : isSaving ? "Saving..." : "Save Connection"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                <span className="material-icons-round text-blue-500 mb-2">info</span>
                                <h4 className="text-sm font-bold text-slate-800">API Access</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">Ensure the Web API is enabled in your Sage CRE setup and the firewall allows traffic from this IP.</p>
                            </div>
                            <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                <span className="material-icons-round text-amber-500 mb-2">security</span>
                                <h4 className="text-sm font-bold text-slate-800">Security</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">We recommend using a dedicated service account with read-only permissions for integrations.</p>
                            </div>
                            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                                <span className="material-icons-round text-emerald-500 mb-2">help_outline</span>
                                <h4 className="text-sm font-bold text-slate-800">Need Help?</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">View our documentation for a step-by-step guide on setting up the Sage CRE Web API.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
