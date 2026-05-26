"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Database, User, Lock, Shield, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { ERP_INTEGRATIONS, IntegrationMetadata } from "@/lib/integrations-data";

export default function ERPDynamicPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [config, setConfig] = useState({
        baseUrl: "",
        instance: "",
        username: "",
        password: ""
    });

    const integration = ERP_INTEGRATIONS.find(i => i.slug === slug) || null;

    useEffect(() => {
        if (!integration) {
            router.push("/erp");
        }
    }, [integration, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    if (!integration) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

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
                            {/* Header Section */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/[0.15] relative overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-64 h-64 blur-3xl opacity-[0.05]"
                                    style={{ backgroundColor: integration.primary_color }}
                                ></div>

                                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                                    <div
                                        className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm"
                                        style={{ borderBottom: `3px solid ${integration.primary_color}` }}
                                    >
                                        <img
                                            src={integration.logo_url}
                                            alt={integration.name}
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">{integration.name} Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                                            {integration.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Base URL */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Connection URL
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder={`https://${integration.slug}-api.enterprise.com`}
                                            value={config.baseUrl}
                                            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">The endpoint for your {integration.name} instance.</p>
                                    </div>

                                    {/* Instance/DB */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Database className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Instance / Company DB
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="Production_DB"
                                            value={config.instance}
                                            onChange={(e) => setConfig({ ...config, instance: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">Identifier for your specific organization or database.</p>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Username / Client ID
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="text"
                                            placeholder="leucadia_service_user"
                                            value={config.username}
                                            onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Password / Secret Key
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="password"
                                            placeholder="••••••••••••••••"
                                            value={config.password}
                                            onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 gap-4">
                                    <div className="flex items-center text-slate-500 text-xs font-semibold">
                                        <Shield className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span>Credentials are encrypted with AES-256</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn-primary w-full sm:w-auto px-6 py-2"
                                    >
                                        {isSaved ? (
                                            <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Connected</>
                                        ) : isSaving ? (
                                            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Authorizing...</>
                                        ) : (
                                            <>Authorize {integration.name}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                    Initial Sync
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    After authorization, Internal Assistant will perform a deep index of your metadata. This typically takes 5-10 minutes.
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                    Data Residency
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    All indexed data remains within your dedicated tenant on Internal Assistant. We never share data with external models.
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center uppercase tracking-wider">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                    Auto-Updates
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Real-time webhooks ensure your Internal Assistant remains synchronized with latest records automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
