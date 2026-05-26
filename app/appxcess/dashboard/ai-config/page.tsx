"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { Settings2, Save, RefreshCw, Info, Bot, Sparkles } from "lucide-react";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";

interface AIConfig {
    id?: number;
    agent_type: string;
    system_prompt: string;
    model: string;
    temperature: number;
}

export default function AppXcessAIConfigPage() {
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
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }
        loadConfigs();
    }, [router]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("appxcess_token");
            const response = await fetch(apiUrl("api/appxcess/ai-config"), {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
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
            const token = localStorage.getItem("appxcess_token");
            const response = await fetch(apiUrl("api/appxcess/ai-config"), {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <AppXcessSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c32ed]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <AppXcessSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shadow-slate-200">
                                <Bot className="w-7 h-7 text-slate-700" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Configuration</h2>
                                <p className="text-slate-500 font-medium">Manage behavior and personalities for system AI segments.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium shadow-sm">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 font-medium shadow-sm flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                {successMessage}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 w-fit">
                            <button
                                onClick={() => setActiveTab("external")}
                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "external"
                                    ? "bg-[#0c32ed] text-white shadow-md"
                                    : "text-[#0c32ed] hover:bg-slate-50 hover:text-[#0a2bcc]"
                                    }`}
                            >
                                External Assistant
                            </button>
                            <button
                                onClick={() => setActiveTab("internal")}
                                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "internal"
                                    ? "bg-[#0c32ed] text-white shadow-md"
                                    : "text-[#0c32ed] hover:bg-slate-50 hover:text-[#0a2bcc]"
                                    }`}
                            >
                                Internal Assistant
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    {activeTab === "external" ? "External Assistant Configuration" : "Internal Assistant Configuration"}
                                </h2>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                                    <Info className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs text-blue-700 font-bold">Defines AI identity & rules</span>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                        System Prompt (Instructions)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={formContent.system_prompt}
                                            onChange={(e) => setFormContent({ ...formContent, system_prompt: e.target.value })}
                                            className="w-full h-96 px-5 py-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-mono text-sm leading-relaxed custom-scrollbar resize-none"
                                            placeholder="Enter segment instructions here..."
                                            required
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-400 bg-white/50 px-2 py-1 rounded">
                                            {formContent.system_prompt.length} chars
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">
                                        Tip: Use markdown for formatting. Changes affect the AI behavior immediately after saving.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                            LLM Model
                                        </label>
                                        <select
                                            value={formContent.model}
                                            onChange={(e) => setFormContent({ ...formContent, model: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium text-slate-700"
                                        >
                                            <option value="gpt-4o">GPT-4o (Most Capable)</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between">
                                            Temperature (Creativity)
                                            <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{formContent.temperature}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formContent.temperature}
                                            onChange={(e) => setFormContent({ ...formContent, temperature: parseFloat(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0c32ed]"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold tracking-wider">
                                            <span>STRICT / FACTUAL</span>
                                            <span>CREATIVE / VERBOSE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={loadConfigs}
                                        className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all hover:text-slate-900"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-8 py-3 bg-[#0c32ed] text-white rounded-xl font-bold hover:bg-[#0a2bcc] shadow-lg shadow-[#0c32ed]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Configuration
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
