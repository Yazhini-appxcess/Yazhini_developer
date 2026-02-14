"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, ExternalLink, Link2 } from "lucide-react";

export default function HubSpotPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        accessToken: "",
        portalId: ""
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
                                            src="https://www.google.com/s2/favicons?domain=hubspot.com&sz=128"
                                            alt="HubSpot"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">HubSpot Integration</h3>
                                        <p className="text-slate-500">Connect your HubSpot Portal to sync sales, marketing, and service data with Leucadia Copilot.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Key className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Private App Access Token
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="password"
                                            placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            value={config.accessToken}
                                            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-400 italic">Create a Private App in HubSpot Settings to get an Access Token.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <User className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Portal ID (HubID)
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="Enter your HubSpot HubID"
                                            value={config.portalId}
                                            onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                    <a
                                        href="https://knowledge.hubspot.com/integrations/set-up-the-hubspot-integration"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-[#01284e] hover:underline flex items-center"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1.5" />
                                        HubSpot Guide
                                    </a>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-10 py-2.5 bg-[#01284e] hover:bg-primary text-white font-bold rounded-lg shadow-lg shadow-[#01284e]/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaved ? "Saved!" : isSaving ? "Saving..." : "Verify Connection"}
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
                                    <h4 className="font-bold text-slate-800 mb-1">Private Apps</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Leucadia uses HubSpot Private Apps for better security control and specific permission scoping on your crm objects.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Marketing Context</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Connect marketing campaigns and emails to give the AI context on recent customer interactions and outbound communications.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
