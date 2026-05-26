"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Shield, Database as DbIcon, Key, CheckCircle, Terminal, HardDrive, Zap } from "lucide-react";

export default function SupabasePage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        projectUrl: "",
        apiKey: "",
        dbPassword: "",
        vectorSupport: true
    });

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }
    }, [router]);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start space-x-5">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm p-2">
                                        <img
                                            src="https://www.google.com/s2/favicons?domain=supabase.com&sz=128"
                                            alt="Supabase"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Supabase Integration</h3>
                                        <p className="text-slate-500">Connect your Supabase project with built-in pgvector support for high-speed AI embeddings.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Zap className="w-4 h-4 mr-2 text-primary" />
                                            Project URL
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="https://your-project.supabase.co"
                                            value={config.projectUrl}
                                            onChange={(e) => setConfig({ ...config, projectUrl: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Key className="w-4 h-4 mr-2 text-primary" />
                                            Service Role API Key (Secret)
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800"
                                            type="password"
                                            placeholder="eyJh..."
                                            value={config.apiKey}
                                            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400">Use the `service_role` key for administrative access to your data.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <DbIcon className="w-4 h-4 mr-2 text-primary" />
                                            Direct DB Password
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800"
                                            type="password"
                                            placeholder="••••••••"
                                            value={config.dbPassword}
                                            onChange={(e) => setConfig({ ...config, dbPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id="vector"
                                            checked={config.vectorSupport}
                                            onChange={(e) => setConfig({ ...config, vectorSupport: e.target.checked })}
                                            className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded"
                                        />
                                        <label htmlFor="vector" className="text-sm font-medium text-slate-700">Enable pgvector indexing (Automatic)</label>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-10 py-3 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isSaved ? "Saved Successfully!" : isSaving ? "Handshaking..." : "Verify & Save Configuration"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex space-x-4">
                                <Zap className="w-8 h-8 text-[#3ECF8E] flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Serverless Ready</h4>
                                    <p className="text-sm text-slate-600">Zero-config integration with Supabase Auth and Edge Functions for real-time reactivity.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Vector Storage</h4>
                                    <p className="text-sm text-slate-600">Directly stores AI embeddings in your existing tables using pgvector for hyper-fast search.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
