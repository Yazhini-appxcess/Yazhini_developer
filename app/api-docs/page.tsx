"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import {
    Plus,
    Globe,
    Shield,
    Zap,
    MoreVertical,
    Trash2,
    Link2,
    Settings2,
    CheckCircle2,
    X,
    Key,
    Activity
} from "lucide-react";

interface CustomIntegration {
    id: number;
    name: string;
    baseUrl: string;
    authType: string;
    status: string;
}

export default function CustomAPIIntegrationsPage() {
    const router = useRouter();
    const [integrations, setIntegrations] = useState<CustomIntegration[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newIntegration, setNewIntegration] = useState({
        name: "",
        baseUrl: "",
        authType: "Bearer Token",
        apiKey: ""
    });

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }
    }, [router]);

    const handleAddIntegration = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            const entry: CustomIntegration = {
                id: Date.now(),
                name: newIntegration.name,
                baseUrl: newIntegration.baseUrl,
                authType: newIntegration.authType,
                status: "active"
            };
            setIntegrations([...integrations, entry]);
            setIsSaving(false);
            setShowModal(false);
            setNewIntegration({ name: "", baseUrl: "", authType: "Bearer Token", apiKey: "" });
        }, 1200);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/2165/2165004.png"
                                        alt="API"
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">API Connector</h2>
                                    <p className="text-slate-500">Connect any third-party application via their REST API.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center px-4 py-2.5 bg-[#01284e] text-white rounded-lg hover:bg-primary transition-colors font-bold shadow-lg shadow-blue-900/10 cursor-pointer"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Custom API
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <Activity className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-800">{integrations.length}</h3>
                                <p className="text-sm text-slate-500">Connected Services</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-50">
                                <Zap className="w-8 h-8 text-amber-500 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-800">0</h3>
                                <p className="text-sm text-slate-500">Events Received</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm opacity-50">
                                <Globe className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-800">100%</h3>
                                <p className="text-sm text-slate-500">Uptime Score</p>
                            </div>
                        </div>

                        {/* Integration List */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-4">Service Name</th>
                                        <th className="px-6 py-4">Endpoint Base URL</th>
                                        <th className="px-6 py-4">Auth Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {integrations.length > 0 ? integrations.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                {item.baseUrl}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                    {item.authType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-emerald-600 text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                    Connected
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-slate-400 hover:text-slate-600"><Settings2 className="w-4 h-4" /></button>
                                                    <button
                                                        onClick={() => setIntegrations(integrations.filter(i => i.id !== item.id))}
                                                        className="p-2 text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                        <Link2 className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <h4 className="text-slate-400 font-medium">No external APIs integrated yet</h4>
                                                    <p className="text-slate-400 text-xs mt-1">Connect third-party apps to sync data with Leucadia.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Quick Help */}
                        <div className="bg-[#01284e] rounded-3xl p-8 text-white flex items-center overflow-hidden relative">
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-xl font-bold">Need to integrate a new tool?</h3>
                                <p className="text-blue-100/70 text-sm max-w-lg">
                                    If we don't have a direct connector for your software, you can use the API Connector to manually add the base endpoint and credentials.
                                </p>
                            </div>
                            <Globe className="absolute right-[-40px] top-[-40px] w-64 h-64 text-white/5" />
                        </div>
                    </div>
                </div>

                {/* Add Integration Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-xl text-slate-800">Configure Custom API</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <form onSubmit={handleAddIntegration} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Application Name</label>
                                        <input
                                            required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#01284e]/20 outline-none"
                                            placeholder="e.g. Mailchimp, Shopify"
                                            value={newIntegration.name}
                                            onChange={e => setNewIntegration({ ...newIntegration, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">API Gateway / Base URL</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#01284e]/20 outline-none"
                                                placeholder="https://api.thirdparty.com/v1"
                                                value={newIntegration.baseUrl}
                                                onChange={e => setNewIntegration({ ...newIntegration, baseUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Auth Method</label>
                                            <select
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#01284e]/20 outline-none"
                                                value={newIntegration.authType}
                                                onChange={e => setNewIntegration({ ...newIntegration, authType: e.target.value })}
                                            >
                                                <option>Bearer Token</option>
                                                <option>X-API-Key</option>
                                                <option>Basic Auth</option>
                                                <option>No Auth</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Key / Token</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                                <input
                                                    required
                                                    type="password"
                                                    className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#01284e]/20 outline-none"
                                                    placeholder="••••••••••••"
                                                    value={newIntegration.apiKey}
                                                    onChange={e => setNewIntegration({ ...newIntegration, apiKey: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-2.5 bg-[#01284e] text-white font-bold rounded-lg hover:bg-primary transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? "Connecting..." : "Connect Application"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
