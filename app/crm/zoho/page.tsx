"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, ExternalLink, Database } from "lucide-react";

export default function ZohoCRMPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        clientId: "",
        clientSecret: "",
        orgId: "",
        dc: "com" // Data Center: com, eu, in, etc.
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
                                            src="https://www.google.com/s2/favicons?domain=zoho.com&sz=128"
                                            alt="Zoho"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Zoho CRM Integration</h3>
                                        <p className="text-slate-500">Connect your Zoho CRM to sync leads, contacts, and deal information with Leucadia Copilot.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Key className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Client ID
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="Enter Zoho Client ID"
                                                value={config.clientId}
                                                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Shield className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Client Secret
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="password"
                                                placeholder="••••••••••••••••"
                                                value={config.clientSecret}
                                                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <User className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Organization ID (OrgID)
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="Enter Org ID"
                                                value={config.orgId}
                                                onChange={(e) => setConfig({ ...config, orgId: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Globe className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Data Center (DC)
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                value={config.dc}
                                                onChange={(e) => setConfig({ ...config, dc: e.target.value })}
                                            >
                                                <option value="com">zoho.com (US)</option>
                                                <option value="eu">zoho.eu (Europe)</option>
                                                <option value="in">zoho.in (India)</option>
                                                <option value="com.au">zoho.com.au (Australia)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                    <a
                                        href="https://api-console.zoho.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-[#01284e] hover:underline flex items-center"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1.5" />
                                        Zoho Developer Console
                                    </a>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-10 py-2.5 bg-[#01284e] hover:bg-primary text-white font-bold rounded-lg shadow-lg shadow-[#01284e]/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaved ? "Saved!" : isSaving ? "Saving..." : "Save Zoho Config"}
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
                                    <h4 className="font-bold text-slate-800 mb-1">OAuth Security</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Connections are authorized via secure multi-region OAuth servers, ensuring your CRM data remains private and protected.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Automatic Sync</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Once connected, Leucadia Copilot automatically indexes your CRM objects to provide context-aware AI responses.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
