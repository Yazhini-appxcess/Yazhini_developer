"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Settings2, Save, RefreshCw, Info } from "lucide-react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";

interface AIConfig {
    id?: number;
    agent_type: string;
    system_prompt: string;
    model: string;
    temperature: number;
}

export default function AISettingsPage() {
    const router = useRouter();
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"external" | "internal">("external");

    const [formContent, setFormContent] = useState<AIConfig>({
        agent_type: "external",
        system_prompt: "",
        model: "gpt-4o-mini",
        temperature: 0.7
    });

    useEffect(() => {
        const adminUser = localStorage.getItem("admin_user");
        if (!adminUser) {
            router.push("/login");
            return;
        }
        loadConfigs();
    }, [router]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(apiUrl("api/admin/ai-config"), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to load AI configurations");
            const data = await response.json();
            setConfigs(data.configs || []);

            // Set initial form content based on active tab
            const activeConfig = data.configs.find((c: AIConfig) => c.agent_type === activeTab);
            if (activeConfig) {
                setFormContent(activeConfig);
            } else {
                setFormContent({
                    agent_type: activeTab,
                    system_prompt: "",
                    model: "gpt-4o-mini",
                    temperature: 0.7
                });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const config = configs.find(c => c.agent_type === activeTab);
        if (config) {
            setFormContent(config);
        } else {
            setFormContent({
                agent_type: activeTab,
                system_prompt: "",
                model: "gpt-4o-mini",
                temperature: 0.7
            });
        }
    }, [activeTab, configs]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const token = getAuthToken();
            const response = await fetch(apiUrl("api/admin/ai-config"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formContent),
            });

            if (!response.ok) throw new Error("Failed to save configuration");

            setSuccessMessage("AI Configuration updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
            await loadConfigs();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <CLSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Settings2 className="w-8 h-8 text-primary" />
                                    AI Instructions Management
                                </h1>
                                <p className="text-gray-600 mt-1">Configure system prompts and parameters for each AI agent.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 font-medium">
                                {successMessage}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
                            <button
                                onClick={() => setActiveTab("external")}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "external"
                                    ? "bg-[#01284e] text-white shadow-md"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                External Assistant
                            </button>
                            <button
                                onClick={() => setActiveTab("internal")}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === "internal"
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                Copilot (Internal)
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {activeTab === "external" ? "External Assistant Configuration" : "Internal Copilot Configuration"}
                                </h2>
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs text-blue-700 font-medium">This prompt defines the AI's identity and behavior rules.</span>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        System Prompt (Instructions)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">Provide detailed instructions on how the AI should behave, what data it can access, and its specific tone.</p>
                                    <textarea
                                        value={formContent.system_prompt}
                                        onChange={(e) => setFormContent({ ...formContent, system_prompt: e.target.value })}
                                        className="w-full h-80 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono text-sm leading-relaxed"
                                        placeholder="Enter agent instructions here..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                            LLM Model
                                        </label>
                                        <select
                                            value={formContent.model}
                                            onChange={(e) => setFormContent({ ...formContent, model: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        >
                                            <option value="gpt-4o">GPT-4o (Most Capable)</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider flex justify-between">
                                            Temperature (Creativity)
                                            <span className="text-primary">{formContent.temperature}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formContent.temperature}
                                            onChange={(e) => setFormContent({ ...formContent, temperature: parseFloat(e.target.value) })}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                                            <span>STRICT / FACTUAL</span>
                                            <span>CREATIVE / VERBOSE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={loadConfigs}
                                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Reset Changes
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-8 py-3 bg-[#01284e] text-white rounded-xl font-bold hover:bg-primary shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Instructions
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
