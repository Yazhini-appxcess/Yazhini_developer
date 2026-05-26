"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Key, User, Lock, Shield, CheckCircle2, ArrowLeft, Loader2, Sparkles, Factory } from "lucide-react";
import { MES_INTEGRATIONS, IntegrationMetadata } from "@/lib/integrations-data";

export default function MESDynamicPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    const isCloud = ["sap-digital-manufacturing", "tulip-interfaces", "plex-mes", "dassault-apriso"].includes(slug);

    const [config, setConfig] = useState({
        scadaEndpoint: "",
        opcToken: "",
        stationId: ""
    });

    const integration = MES_INTEGRATIONS.find(i => i.slug === slug) || null;

    useEffect(() => {
        if (!integration) {
            router.push("/mes");
        }
    }, [integration, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
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
                            onClick={() => router.push("/mes")}
                            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[11px] uppercase tracking-wider group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                            Back to MES Hub
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
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">{integration.name} MES</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                                            {integration.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6 mb-6">
                                    {isCloud ? (
                                        <>
                                            {/* API Base URL */}
                                            <div className="space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    API Base URL
                                                </label>
                                                <input
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                    type="text"
                                                    placeholder="https://api.factorysuite.com/v1"
                                                    value={config.scadaEndpoint}
                                                    onChange={(e) => setConfig({ ...config, scadaEndpoint: e.target.value })}
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-400 font-medium">Your cloud tenant API endpoint.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Client ID */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Client ID / API Key
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="text"
                                                        placeholder="Enter your client identifier"
                                                        value={config.opcToken}
                                                        onChange={(e) => setConfig({ ...config, opcToken: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                {/* Workspace ID */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Factory className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Workspace / Tenant ID
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="text"
                                                        placeholder="PRODUCTION_TENANT_X"
                                                        value={config.stationId}
                                                        onChange={(e) => setConfig({ ...config, stationId: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* SCADA Endpoint */}
                                            <div className="space-y-1.5">
                                                <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    SCADA / OPC-UA Endpoint
                                                </label>
                                                <input
                                                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                    type="text"
                                                    placeholder="opc.tcp://your-factory-range:4840"
                                                    value={config.scadaEndpoint}
                                                    onChange={(e) => setConfig({ ...config, scadaEndpoint: e.target.value })}
                                                    required
                                                />
                                                <p className="text-[10px] text-slate-400 font-medium">Your industrial gateway endpoint address.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* OPC Token */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Authentication Token
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="password"
                                                        placeholder="Token_••••••••••••••••"
                                                        value={config.opcToken}
                                                        onChange={(e) => setConfig({ ...config, opcToken: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                {/* Station ID */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        <Factory className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                        Plant / Station ID
                                                    </label>
                                                    <input
                                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                        type="text"
                                                        placeholder="FACTORY_STATION_001"
                                                        value={config.stationId}
                                                        onChange={(e) => setConfig({ ...config, stationId: e.target.value })}
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
                                        <span>AI-Powered Production Insights Active</span>
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
                                        Industrial-Grade Safety
                                    </h4>
                                    <p className="text-slate-500 text-[11px] max-w-xl leading-relaxed">
                                        We support OPC-UA security profiles including Sign & Encrypt with X.509 certificates. Your factory floor data remains within your private network perimeter.
                                    </p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-500 flex items-center justify-center text-[9px] font-bold shadow-sm">
                                            IEC
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
