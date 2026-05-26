"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, ExternalLink, Database, ArrowLeft, Loader2 } from "lucide-react";

export default function ZohoCRMPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        clientId: "",
        clientSecret: "",
        orgId: "",
        dc: "com" // Data Center: com, eu, in, etc.
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/zoho/config`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.client_id) {
                        setConfig(prev => ({
                            ...prev,
                            clientId: data.client_id,
                            dc: data.dc || "in"
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching Zoho config:", error);
            }
        };
        fetchConfig();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/zoho/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    dc: config.dc,
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
        
        setIsSaving(false);
        setTimeout(() => setIsSaved(false), 3000);
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
                                            src="https://www.google.com/s2/favicons?domain=zoho.com&sz=128"
                                            alt="Zoho"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Zoho CRM Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Connect your Zoho CRM to sync leads, contacts, and deal information with the Internal AI Assistant.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                Client ID
                                            </label>
                                            <input
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                type="text"
                                                placeholder="Enter Zoho Client ID"
                                                value={config.clientId}
                                                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                Client Secret
                                            </label>
                                            <input
                                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                type="password"
                                                placeholder="••••••••••••••••"
                                                value={config.clientSecret}
                                                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
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
                                            value={config.dc}
                                            onChange={(e) => setConfig({ ...config, dc: e.target.value })}
                                            required
                                        >
                                            <option value="in">zoho.in (India)</option>
                                            <option value="com">zoho.com (US)</option>
                                            <option value="eu">zoho.eu (Europe)</option>
                                            <option value="com.au">zoho.com.au (Australia)</option>
                                            <option value="jp">zoho.jp (Japan)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex flex-col">
                                        <a
                                            href="https://api-console.zoho.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center mb-0.5"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                            Zoho Developer Console
                                        </a>
                                        <p className="text-[10px] text-slate-400 font-medium">Callback: http://localhost:8000/api/zoho/callback</p>
                                    </div>

                                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                                        {isSaved && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/zoho/authorize`);
                                                        const { url } = await res.json();
                                                        if (url) window.location.href = url;
                                                    } catch (err) {
                                                        alert("Failed to start authorization flow.");
                                                    }
                                                }}
                                                className="btn-primary py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Globe className="w-3.5 h-3.5 mr-1.5" />
                                                Authorize Zoho
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn-primary w-full sm:w-auto px-6 py-2"
                                        >
                                            {isSaved ? (
                                                <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Credentials Saved</>
                                            ) : isSaving ? (
                                                "Saving..."
                                            ) : (
                                                <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Config</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">OAuth Security</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Connections are authorized via secure multi-region OAuth servers, ensuring your CRM data remains private and protected.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Automatic Sync</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Once connected, the AI system automatically indexes your CRM objects to provide context-aware AI responses.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
