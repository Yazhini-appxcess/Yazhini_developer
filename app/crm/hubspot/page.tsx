"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, ExternalLink, Link2, ArrowLeft } from "lucide-react";

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
        <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <CLHeader />

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
                        <button
                            onClick={() => router.push("/crm")}
                            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[11px] uppercase tracking-wider group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                            Back to CRM Hub
                        </button>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/[0.15] relative overflow-hidden">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                                        <img
                                            src="https://www.google.com/s2/favicons?domain=hubspot.com&sz=128"
                                            alt="HubSpot"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">HubSpot Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Connect your HubSpot Portal to sync sales, marketing, and service data with the internal AI Assistant.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Private App Access Token
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="password"
                                            placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            value={config.accessToken}
                                            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">Create a Private App in HubSpot Settings to get an Access Token.</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Portal ID (HubID)
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="Enter your HubSpot HubID"
                                            value={config.portalId}
                                            onChange={(e) => setConfig({ ...config, portalId: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <a
                                        href="https://knowledge.hubspot.com/integrations/set-up-the-hubspot-integration"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                        HubSpot Guide
                                    </a>

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
                                            <><Save className="w-3.5 h-3.5 mr-1.5" /> Verify Connection</>
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
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Private Apps</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Leucadia uses HubSpot Private Apps for better security control and specific permission scoping on your crm objects.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Marketing Context</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Connect marketing campaigns and emails to give the AI context on recent customer interactions and outbound communications.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
