"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Key, User, Lock, Shield, CheckCircle2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { CRM_INTEGRATIONS, IntegrationMetadata } from "@/lib/integrations-data";

export default function CRMDynamicPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const integration = CRM_INTEGRATIONS.find(i => i.slug === slug) || null;

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [config, setConfig] = useState({
        apiDomain: "",
        apiKey: "",
        clientEmail: ""
    });

    useEffect(() => {
        if (slug && !CRM_INTEGRATIONS.some(i => i.slug === slug)) {
            router.push("/crm");
        }
    }, [slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        if (slug === 'zoho') {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/zoho/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: config.apiKey,
                        client_secret: config.clientEmail,
                        dc: config.apiDomain,
                        organization_id: "default"
                    })
                });
                
                if (response.ok) {
                    setIsSaved(true);
                } else {
                    console.error("Failed to save Zoho config");
                    alert("Failed to save Zoho configuration. Please check your credentials.");
                }
            } catch (error) {
                console.error("Error saving Zoho config:", error);
                alert("An error occurred. Please try again later.");
            }
        } else {
            // Generic mock for other integrations
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSaved(true);
        }
        
        setIsSaving(false);
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
                            onClick={() => router.push("/crm")}
                            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[11px] uppercase tracking-wider group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                            Back to CRM Hub
                        </button>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
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
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">{integration.name} CRM</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                                            {integration.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6 mb-6">
                                    {slug === 'zoho' ? (
                                        <>
                                            {/* Specialized Zoho Configuration */}
                                            <div className="p-5 bg-indigo-50/40 rounded-xl border border-indigo-100/80 mb-6">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <div className="p-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-lg">
                                                        <Sparkles size={14} />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Zoho CRM Integration</h4>
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                                    Connect your Zoho CRM to sync leads, contacts, and deal information. After saving, you will be prompted to authorize the connection.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Client ID
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="text"
                                                        placeholder="1000.XXXXXXXXXXXXXXXXXXXX"
                                                        value={config.apiKey}
                                                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Client Secret
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="password"
                                                        placeholder="••••••••••••••••••••"
                                                        value={config.clientEmail}
                                                        onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    Data Center (DC)
                                                </label>
                                                <select
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm appearance-none"
                                                    value={config.apiDomain}
                                                    onChange={(e) => setConfig({ ...config, apiDomain: e.target.value })}
                                                    required
                                                >
                                                    <option value="in">zoho.in (India)</option>
                                                    <option value="us">zoho.com (US)</option>
                                                    <option value="eu">zoho.eu (Europe)</option>
                                                    <option value="au">zoho.com.au (Australia)</option>
                                                    <option value="jp">zoho.jp (Japan)</option>
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* API Domain */}
                                            <div className="space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    API Domain / Workspace URL
                                                </label>
                                                <input
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                    type="text"
                                                    placeholder={`https://your-org.${integration.slug}.com`}
                                                    value={config.apiDomain}
                                                    onChange={(e) => setConfig({ ...config, apiDomain: e.target.value })}
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-400 font-medium">Your dedicated {integration.name} workspace address.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* API Key */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Private Access Token
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="password"
                                                        placeholder="pk_live_••••••••••••••••"
                                                        value={config.apiKey}
                                                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                {/* Client Email */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Admin Email
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="email"
                                                        placeholder="admin@yourcompany.com"
                                                        value={config.clientEmail}
                                                        onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 gap-4">
                                    <div className="flex items-center text-slate-500 text-xs font-semibold">
                                        <Sparkles className="w-4 h-4 mr-2 text-indigo-500 animate-pulse" />
                                        <span>AI-Powered Lead Analysis Ready</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn-primary w-full sm:w-auto px-6 py-2"
                                    >
                                        {isSaved ? (
                                            <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Connected</>
                                        ) : isSaving ? (
                                            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Verifying...</>
                                        ) : (
                                            <>Connect {integration.name}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Footer */}
                        <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center uppercase tracking-wider">
                                        <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                                        Enterprise-Grade Security
                                    </h4>
                                    <p className="text-slate-500 text-[11px] max-w-xl leading-relaxed">
                                        We use OAuth 2.0 and PKCE extension for secure authorization. Your CRM tokens are stored in an isolated, hardware-encrypted vault.
                                    </p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold shadow-sm">
                                            ISO
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
