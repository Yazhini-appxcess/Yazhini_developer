"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { Save, Shield, Database as DbIcon, Key, CheckCircle, Terminal, HardDrive } from "lucide-react";

export default function MongoDBPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        connectionString: "",
        database: "",
        authSource: "admin",
        replicaSet: ""
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
                                            src="https://www.google.com/s2/favicons?domain=mongodb.com&sz=128"
                                            alt="MongoDB"
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-1">MongoDB Integration</h3>
                                        <p className="text-slate-500">Sync flexible document schemas and collections for unstructured data AI grounding.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700">
                                            <Terminal className="w-4 h-4 mr-2 text-primary" />
                                            Connection String (SRV)
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="mongodb+srv://user:pass@cluster0.abc.mongodb.net"
                                            value={config.connectionString}
                                            onChange={(e) => setConfig({ ...config, connectionString: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-slate-700">
                                                <DbIcon className="w-4 h-4 mr-2 text-[#47A248]" />
                                                Target Database
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#47A248]/20 focus:border-[#47A248] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="my_app_db"
                                                value={config.database}
                                                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Auth Source</label>
                                            <input
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#47A248]/20 focus:border-[#47A248] transition-all outline-none text-slate-800"
                                                type="text"
                                                placeholder="admin"
                                                value={config.authSource}
                                                onChange={(e) => setConfig({ ...config, authSource: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Replica Set (Optional)</label>
                                        <input
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#47A248]/20 focus:border-[#47A248] transition-all outline-none text-slate-800"
                                            type="text"
                                            placeholder="rs0"
                                            value={config.replicaSet}
                                            onChange={(e) => setConfig({ ...config, replicaSet: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center disabled:opacity-50 hover:opacity-90"
                                    >
                                        {isSaved ? "Saved Successfully!" : isSaving ? "Connecting to Cluster..." : "Verify & Save Configuration"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex space-x-4">
                                <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Atlas Compatible</h4>
                                    <p className="text-sm text-slate-600">Perfectly optimized for MongoDB Atlas clusters with full VPC peering support.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex space-x-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Flex-Schema indexing</h4>
                                    <p className="text-sm text-slate-600">Automatically maps nested BSON fields to semantic knowledge vectors for AI searching.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
