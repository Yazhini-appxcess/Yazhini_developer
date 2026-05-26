"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Shield, User, Key, CheckCircle, ExternalLink, Activity, ArrowLeft } from "lucide-react";

export default function PipedrivePage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        apiToken: "",
        companyName: ""
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
                                            src="https://www.google.com/s2/favicons?domain=pipedrive.com&sz=128"
                                            alt="Pipedrive"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Pipedrive Integration</h3>
                                        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">Connect your Pipedrive CRM to sync sales pipelines, activities, and organization data with the Internal AI Assistant.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <Key className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Personal API Token
                                        </label>
                                        <input
                                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                            type="password"
                                            placeholder="Enter your Pipedrive API Token"
                                            value={config.apiToken}
                                            onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">Found in Pipedrive Settings {`>`} Personal preferences {`>`} API</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                            Pipedrive Company Domain
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                                type="text"
                                                placeholder="your-company"
                                                value={config.companyName}
                                                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                                            />
                                            <span className="text-slate-400 text-xs font-semibold">.pipedrive.com</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <a
                                        href="https://developers.pipedrive.com/docs/api/v1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                        Pipedrive API Docs
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
                                            <><Save className="w-3.5 h-3.5 mr-1.5" /> Connect Pipedrive</>
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
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Direct API Access</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">Leucadia uses your personal API token to sync deals and organization data securely between systems.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex space-x-4 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Pipeline Insights</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">AI analyzes your Pipedrive pipelines to provide recommendations on deal closure and next-step actions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
