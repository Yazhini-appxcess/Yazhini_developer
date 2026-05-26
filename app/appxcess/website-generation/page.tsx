"use client";

import React, { useState, useEffect } from "react";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";
import { Webhook, Globe, Layout, Search, Download, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface GeneratedSite {
    id: string;
    source_url: string;
    extraction_data: string;
    generated_html: string;
    created_at: string;
    redesigned_html?: string;
    token_usage_redesign?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    redesigned_at?: string;
}

// Website Generation is gated by a separate feature flag from the Website Module.
// Currently ENABLED. To disable, flip the flag to false — the wrapper will
// render a redirect stub instead, leaving the full implementation untouched
// below for instant re-enable.
const ENABLE_WEBSITE_GENERATION = true;

export default function TestSitePage() {
    const router = useRouter();
    useEffect(() => {
        if (!ENABLE_WEBSITE_GENERATION) {
            router.replace("/appxcess/dashboard/branding");
        }
    }, [router]);
    if (!ENABLE_WEBSITE_GENERATION) return null;
    return <_TestSitePageImpl />;
}

function _TestSitePageImpl() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<"idle" | "scraping" | "analyzing" | "generating" | "complete" | "error">("idle");
    const [result, setResult] = useState<GeneratedSite | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pastSites, setPastSites] = useState<GeneratedSite[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Step 3: Editing State
    const [editInstructions, setEditInstructions] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.list, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                setPastSites(data.sites || []);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const generateWebsite = async () => {
        if (!url) return;

        try {
            setIsGenerating(true);
            setError(null);
            setResult(null);
            setStep("scraping");

            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.generate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Generation failed");
            }

            const data = await response.json();
            setResult(data);
            setStep("complete");
            loadHistory();
        } catch (err) {
            setStep("error");
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const redesignWebsite = async () => {
        if (!result) return;

        try {
            setIsGenerating(true);
            setStep("analyzing"); // Reuse analyzing step for redesign
            setError(null);

            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.redesign(result.id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ instructions: "" }) // Optional instructions could be added later
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Redesign failed");
            }

            const data = await response.json();
            console.log("Redesign Data Received:", data);
            // Merge response with existing result
            setResult(prev => prev ? { ...prev, ...data } : data);
            setStep("complete");
            loadHistory();
        } catch (err) {
            setStep("error");
            setError(err instanceof Error ? err.message : "An unexpected error occurred during redesign");
        } finally {
            setIsGenerating(false);
        }
    };

    const editWebsite = async () => {
        if (!result || !editInstructions.trim()) return;

        try {
            setIsEditing(true);
            // We'll keep step as 'complete' or introduce a new one if needed, 
            // but for now let's just show loading on the button
            setError(null);

            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.edit(result.id), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ instructions: editInstructions })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Edit failed");
            }

            const data = await response.json();

            // Update result with new HTML
            setResult(prev => prev ? { ...prev, ...data } : data);

            // Clear instructions after success
            setEditInstructions("");
            loadHistory();

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during editing");
        } finally {
            setIsEditing(false);
        }
    };

    const downloadHtml = () => {
        if (!result) return;
        // Prefer redesigned HTML if available, otherwise generated/source
        const content = result.redesigned_html || result.generated_html;
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `site-${result.redesigned_html ? 'redesigned' : 'original'}-${new Date().getTime()}.html`;
        if (typeof document !== "undefined" && document.body) {
            document.body.appendChild(a);
            a.click();
            if (document.body.contains(a)) {
                document.body.removeChild(a);
            }
        }
        window.URL.revokeObjectURL(url);
    };

    const viewPastSite = async (id: string) => {
        try {
            setStep("idle");
            setLoadingHistory(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.get(id), {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                setResult(data);
                setStep("complete");
                setUrl(data.source_url);
            }
        } catch (err) {
            alert("Failed to load site details");
        } finally {
            setLoadingHistory(false);
        }
    };

    const parseExtractedData = (jsonStr: string) => {
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return null;
        }
    };

    const extractedData = result ? parseExtractedData(result.extraction_data) : null;
    // Helper to get active content based on state
    const displayHtml = result ? (result.redesigned_html || result.generated_html) : "";
    const isRedesigned = result && result.redesigned_html;
    const tokenUsage = result && result.token_usage_redesign;

    const [viewMode, setViewMode] = useState<"preview" | "code">("code");
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Close full screen on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Publish State
    const [isPublishing, setIsPublishing] = useState(false);

    const publishWebsite = async () => {
        if (!result) return;
        try {
            setIsPublishing(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.publish(result.id), {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });

            if (!response.ok) throw new Error("Failed to publish");

            alert("Website published successfully to /landing");
        } catch (err) {
            alert("Failed to publish website");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {!isFullScreen && <AppXcessSidebar />}

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

                <div className="w-full p-12 relative z-10">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/appxcess/dashboard')}>AppXcess</span>
                                <span>/</span>
                                <span className="text-slate-900">Website Generation</span>
                            </nav>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Website Generation</h1>
                            <p className="text-slate-500 mt-2 text-lg">Capture and preview the raw HTML structure of any live website</p>
                        </div>

                        {/* View Landing Page Button */}
                        <button
                            onClick={() => window.open('/landing', '_blank')}
                            className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                        >
                            <Globe className="w-4 h-4" />
                            View Public Landing
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-250px)]">
                        {/* Control Panel */}
                        <div className="lg:col-span-1 flex flex-col gap-6 overflow-hidden">
                            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    Source Website URL
                                </label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={url}
                                            disabled={isGenerating}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all disabled:opacity-50"
                                        />
                                    </div>
                                    <button
                                        onClick={generateWebsite}
                                        disabled={isGenerating || !url}
                                        className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isGenerating && step === 'scraping' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Capturing...
                                            </>
                                        ) : (
                                            <>
                                                <Layout className="w-4 h-4" />
                                                Capture Site (Step 1)
                                            </>
                                        )}
                                    </button>

                                    {/* Step 2: Redesign Button */}
                                    {result && !isRedesigned && (
                                        <button
                                            onClick={redesignWebsite}
                                            disabled={isGenerating}
                                            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isGenerating && step === 'analyzing' ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Redesigning...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 text-yellow-400" />
                                                    AI Redesign (Step 2)
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Step 3: Refine Design */}
                                    {isRedesigned && (
                                        <div className="space-y-3 pt-6 border-t border-slate-100">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                Step 3: Refine Design
                                            </h3>
                                            <textarea
                                                value={editInstructions}
                                                onChange={(e) => setEditInstructions(e.target.value)}
                                                placeholder="e.g. Change background to blue, make fonts larger..."
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24"
                                                disabled={isEditing}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={editWebsite}
                                                    disabled={isEditing || !editInstructions.trim()}
                                                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    {isEditing ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            Applying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            Apply Changes
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={publishWebsite}
                                                    disabled={isPublishing}
                                                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                                >
                                                    {isPublishing ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Globe className="w-3.5 h-3.5" />
                                                            Publish Live
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isGenerating && (
                                    <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                                        {[
                                            { id: 'scraping', label: 'Step 1: Capturing HTML' },
                                            { id: 'analyzing', label: 'Step 2: AI Redesign' },
                                            { id: 'complete', label: 'Process Complete' },
                                        ].map((s, i) => (
                                            <div key={s.id} className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.id ? "bg-primary/10 text-primary" :
                                                    step === 'complete' || (step === 'analyzing' && s.id === 'scraping') ? "bg-emerald-100 text-emerald-600" :
                                                        "bg-slate-100 text-slate-400"
                                                    }`}>
                                                    {(step === 'complete' && s.id !== 'complete') || (step === 'analyzing' && s.id === 'scraping') ? <CheckCircle2 className="w-4 h-4" /> :
                                                        s.id === 'complete' && step === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s.id || (step === 'complete' && s.id === 'complete') ? "text-primary" : "text-slate-400"}`}>
                                                    {s.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-red-600 leading-relaxed font-bold uppercase">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Token Usage Card */}
                            {tokenUsage && (
                                <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Token Burn
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-medium">Input Tokens</span>
                                            <span className="text-xs font-bold text-slate-900">{tokenUsage.prompt_tokens}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500 font-medium">Output Tokens</span>
                                            <span className="text-xs font-bold text-slate-900">{tokenUsage.completion_tokens}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-primary uppercase">Total Cost</span>
                                            <span className="text-xs font-bold text-primary">{tokenUsage.total_tokens} tokens</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                                    <Search className="w-3.5 h-3.5" />
                                    Recent Generations
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {loadingHistory ? (
                                        <div className="p-4 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-200" />
                                        </div>
                                    ) : (
                                        pastSites.map((site) => (
                                            <button
                                                key={site.id}
                                                onClick={() => viewPastSite(site.id)}
                                                className={`w-full p-4 rounded-2xl border text-left transition-all ${result?.id === site.id
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                                    : "bg-slate-50 border-slate-100 hover:border-primary/30"
                                                    }`}
                                            >
                                                <p className={`text-xs font-bold truncate mb-1 ${result?.id === site.id ? "text-white" : "text-slate-900"}`}>
                                                    {site.source_url.replace(/^https?:\/\//, '')}
                                                </p>
                                                <p className={`text-[10px] font-bold opacity-60 ${result?.id === site.id ? "text-white" : "text-slate-400"}`}>
                                                    {new Date(site.created_at).toLocaleDateString()}
                                                </p>
                                                {site.redesigned_at && (
                                                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${result?.id === site.id ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"}`}>
                                                        <Sparkles className="w-2 h-2" /> Redesigned
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className={`transition-all duration-300 ease-in-out ${isFullScreen
                            ? "fixed inset-0 z-50 bg-white p-4"
                            : "lg:col-span-3 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50"} flex flex-col overflow-hidden`}>
                            {result ? (
                                <>
                                    <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                                <button
                                                    onClick={() => setViewMode('preview')}
                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {isRedesigned ? "AI Result" : "Preview"}
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('code')}
                                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Raw HTML
                                                </button>
                                            </div>
                                            <div className="h-4 w-px bg-slate-200" />
                                            <span className="text-xs text-slate-400 font-bold tracking-tight truncate max-w-md">
                                                {result.source_url}
                                            </span>
                                            {isRedesigned && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> AI Redesign Active
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsFullScreen(!isFullScreen)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold hover:bg-slate-200 transition-all"
                                            >
                                                {isFullScreen ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                                                        Exit Full Screen
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
                                                        Full Screen
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={downloadHtml}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-primary transition-all shadow-lg"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Asset
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden flex">
                                        {!isFullScreen && (
                                            <div className="w-80 border-r border-slate-100 bg-slate-50/30 p-8 overflow-y-auto shrink-0 space-y-8">
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Extraction Profile</h4>
                                                    {extractedData ? (
                                                        <div className="space-y-6">
                                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Brand Identity</p>
                                                                <p className="text-sm font-bold text-slate-900">{extractedData.brand_name}</p>
                                                            </div>

                                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2.5">Design Palette</p>
                                                                <div className="flex gap-2">
                                                                    {extractedData.color_palette.map((c: string) => (
                                                                        <div key={c} className="w-7 h-7 rounded-xl border border-slate-200 shadow-sm" style={{ backgroundColor: c }} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : <p className="text-[10px] text-slate-400 italic">No extraction data</p>}
                                                </div>
                                                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="w-4 h-4 text-primary" />
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Note</span>
                                                    </div>
                                                    <p className="text-[10px] text-primary/70 leading-relaxed font-medium">Layout generated using neural synthesis.</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex-1 bg-white relative">
                                            {viewMode === 'preview' ? (
                                                <iframe
                                                    srcDoc={displayHtml}
                                                    className="w-full h-full border-none"
                                                    title="Preview"
                                                />
                                            ) : (
                                                <textarea
                                                    className="w-full h-full p-4 font-mono text-xs bg-slate-900 text-slate-50 resize-none outline-none custom-scrollbar"
                                                    value={displayHtml}
                                                    readOnly
                                                />
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-10 border border-slate-100">
                                        <Layout className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Intelligence Environment</h2>
                                    <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">Initiate a generation cycle.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
