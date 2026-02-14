"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Globe, Shield, User, Key, CheckCircle, ExternalLink, Cloud } from "lucide-react";

export default function SalesforcePage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        consumerKey: "",
        consumerSecret: "",
        instanceUrl: "",
        apiVersion: "v57.0"
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
                                            src="https://www.google.com/s2/favicons?domain=salesforce.com&sz=128"
                                            alt="Salesforce"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">Salesforce Integration</h3>
                                        <p className="text-slate-500">Enable Salesforce Lightning integration to connect your CRM database with Leucadia Copilot's knowledge engine.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Key className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Consumer Key
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="Enter Salesforce Consumer Key"
                                                value={config.consumerKey}
                                                onChange={(e) => setConfig({ ...config, consumerKey: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <Shield className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                                Consumer Secret
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                                type="password"
                                                placeholder="••••••••••••••••"
                                                value={config.consumerSecret}
                                                onChange={(e) => setConfig({ ...config, consumerSecret: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Globe className="w-4 h-4 mr-2 text-[#01284e]/80" />
                                            Salesforce Instance URL
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="https://yourcompany.my.salesforce.com"
                                            value={config.instanceUrl}
                                            onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-400 italic">Example: https://leucadia.my.salesforce.com</p>
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                                    <a
                                        href="https://help.salesforce.com/s/articleView?id=sf.remoteaccess_authenticate_connected_app.htm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-[#01284e] hover:underline flex items-center"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1.5" />
                                        Salesforce Setup Guide
                                    </a>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full sm:w-auto px-10 py-2.5 bg-[#01284e] hover:bg-primary text-white font-bold rounded-lg shadow-lg shadow-[#01284e]/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaved ? "Saved!" : isSaving ? "Saving..." : "Authorize Integration"}
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
                                    <h4 className="font-bold text-slate-800 mb-1">Enterprise Security</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Leucadia supports Salesforce Connected Apps with specific oAuth scopes for maximum data segregation and safety.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">RAG Ready</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Salesforce objects like Cases, Accounts, and Leads will be used to ground the AI's responses in your actual CRM data.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
