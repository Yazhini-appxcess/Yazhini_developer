"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Server, Database, User, Lock, Shield, CheckCircle2, ArrowLeft, Loader2, Search } from "lucide-react";
import { DATABASE_INTEGRATIONS, IntegrationMetadata } from "@/lib/integrations-data";

export default function DatabaseDynamicPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const integration = DATABASE_INTEGRATIONS.find(i => i.slug === slug) || null;

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [config, setConfig] = useState({
        host: "",
        port: "",
        database: "",
        username: "",
        password: ""
    });

    useEffect(() => {
        if (slug && !DATABASE_INTEGRATIONS.some(i => i.slug === slug)) {
            router.push("/database-hub");
        }
    }, [slug, router]);

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
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto pt-6">

                        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 w-64 h-64 blur-3xl opacity-[0.05]"
                                    style={{ backgroundColor: integration.primary_color }}
                                ></div>

                                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative z-10">
                                    <div
                                        className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-xl"
                                        style={{ borderBottom: `4px solid ${integration.primary_color}` }}
                                    >
                                        <img
                                            src={integration.logo_url}
                                            alt={integration.name}
                                            className="w-14 h-14 object-contain"
                                        />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl font-black text-slate-800 mb-2">{integration.name} Connection</h3>
                                        <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                                            {integration.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 md:p-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {/* Host */}
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                            <Server className="w-4 h-4 mr-2 text-primary" />
                                            Host / Connection String
                                        </label>
                                        <input
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-slate-800 font-medium font-mono text-sm"
                                            type="text"
                                            placeholder="db.your-project.cloud.company.com"
                                            value={config.host}
                                            onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Port */}
                                    <div className="space-y-3">
                                        <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                            Port
                                        </label>
                                        <input
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-slate-800 font-medium"
                                            type="text"
                                            placeholder="5432"
                                            value={config.port}
                                            onChange={(e) => setConfig({ ...config, port: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8 mb-10">
                                    {/* Database Name */}
                                    <div className="space-y-3">
                                        <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                            <Database className="w-4 h-4 mr-2 text-primary" />
                                            Database Name / Schema
                                        </label>
                                        <input
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-slate-800 font-medium"
                                            type="text"
                                            placeholder="main_production"
                                            value={config.database}
                                            onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Username */}
                                        <div className="space-y-3">
                                            <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                                <User className="w-4 h-4 mr-2 text-primary" />
                                                Username
                                            </label>
                                            <input
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-slate-800 font-medium"
                                                type="text"
                                                placeholder="leucadia_readonly"
                                                value={config.username}
                                                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                                required
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-3">
                                            <label className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                                                <Lock className="w-4 h-4 mr-2 text-primary" />
                                                Password
                                            </label>
                                            <input
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-slate-800 font-medium"
                                                type="password"
                                                placeholder="••••••••••••••••"
                                                value={config.password}
                                                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-4">
                                    <div className="flex items-center text-slate-500 text-sm font-medium">
                                        <Search className="w-5 h-5 mr-3 text-blue-500" />
                                        <span>Read-only queries strictly enforced</span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                                    >
                                        {isSaved ? (
                                            <><CheckCircle2 className="w-5 h-5 mr-2" /> Connected</>
                                        ) : isSaving ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting...</>
                                        ) : (
                                            <>Test & Connect</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Note */}
                        <div className="mt-8 bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 flex-shrink-0">
                                <Shield className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                                <h4 className="text-emerald-900 font-bold text-lg">Secure Tunneling Active</h4>
                                <p className="text-emerald-700/70 text-sm leading-relaxed">
                                    Connections are established via a secure SSH tunnel or AWS PrivateLink. Your credentials are never stored in plain text and are rotated based on your organization&apos;s security policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
