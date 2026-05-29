"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";
import {
    Globe, Layout, Search, Download, Loader2, CheckCircle2,
    AlertCircle, Sparkles, Trash2, CheckSquare, Square, MinusSquare,
    X, ChevronLeft, ChevronRight, Clock, ExternalLink, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

/** Lightweight shape returned by the optimised list endpoint. */
interface SiteListItem {
    id: string;
    source_url: string;
    created_at: string;
    status: string; // "processing" | "completed" | "failed"
    generation_type: string; // "capture" | "redesign"
    has_html?: boolean;
    has_redesigned_html?: boolean;
    generated_html_size?: number;
    redesigned_html_size?: number;
    redesigned_at?: string;
    is_active: boolean;
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
    return <TestSitePageImpl />;
}

function TestSitePageImpl() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<"idle" | "scraping" | "analyzing" | "generating" | "complete" | "error">("idle");
    const [result, setResult] = useState<GeneratedSite | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pastSites, setPastSites] = useState<SiteListItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Step 3: Editing State
    const [editInstructions, setEditInstructions] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    // ─── History Section State ───────────────────────────────────────────
    const [historySearch, setHistorySearch] = useState("");
    const [historyTypeFilter, setHistoryTypeFilter] = useState<"all" | "capture" | "redesign">("all");
    const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "completed" | "processing" | "failed">("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingActiveId, setTogglingActiveId] = useState<string | null>(null);
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_PER_PAGE = 10;

    // Toast notification state
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const getErrorMessage = async (response: Response, fallback: string) => {
        const errorData = await response.json().catch((): { detail?: string; message?: string } => ({}));
        return errorData.detail || errorData.message || `${fallback} (${response.status})`;
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // Reset selection on filter change
    useEffect(() => {
        setSelectedIds(new Set());
        setHistoryPage(1);
    }, [historySearch, historyTypeFilter, historyStatusFilter]);

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
        } catch {
            alert("Failed to load site details");
        } finally {
            setLoadingHistory(false);
        }
    };

    // ─── Delete Handlers ─────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
        try {
            setDeletingId(id);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.websiteGenerator.delete(id), {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                const errorData = await response.json().catch((): { detail?: string } => ({}));
                throw new Error(errorData.detail || "Failed to delete");
            }
            setPastSites(prev => prev.filter(s => s.id !== id));
            setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
            if (result?.id === id) { setResult(null); setStep("idle"); }
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete record");
        } finally {
            setDeletingId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} record(s)? This action cannot be undone.`)) return;

        setBulkDeleting(true);
        const ids = Array.from(selectedIds);
        const token = getAuthToken();
        const results = await Promise.allSettled(
            ids.map(async id => {
                const response = await fetch(API_ENDPOINTS.websiteGenerator.delete(id), {
                    method: "DELETE",
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (!response.ok) {
                    throw new Error(`Failed to delete ${id}`);
                }
                return id;
            })
        );
        const deleted = results.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
        setPastSites(prev => prev.filter(s => !deleted.includes(s.id)));
        setSelectedIds(new Set());
        if (result && deleted.includes(result.id)) { setResult(null); setStep("idle"); }
        if (deleted.length !== ids.length) {
            showToast(`${ids.length - deleted.length} record(s) could not be deleted.`, "error");
        }
        setBulkDeleting(false);
    };

    // ─── Active Toggle Handler ───────────────────────────────────────────
    const handleToggleActive = async (site: SiteListItem) => {
        try {
            setTogglingActiveId(site.id);
            const token = getAuthToken();

            if (site.is_active) {
                // Deactivate this site
                const response = await fetch(API_ENDPOINTS.websiteGenerator.deactivate(site.id), {
                    method: "PATCH",
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to deactivate"));
                setPastSites(prev =>
                    prev.map(s => s.id === site.id ? { ...s, is_active: false } : s)
                );
                showToast("Website deactivated — /landing now shows placeholder.", "success");
            } else {
                // Activate this site (deactivates all others)
                const response = await fetch(API_ENDPOINTS.websiteGenerator.toggleActive(site.id), {
                    method: "PATCH",
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to activate"));
                // Update all sites: only this one is active
                setPastSites(prev =>
                    prev.map(s => ({ ...s, is_active: s.id === site.id }))
                );
                showToast("Website is now LIVE on /landing!", "success");
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Toggle failed", "error");
        } finally {
            setTogglingActiveId(null);
        }
    };

    // ─── Selection Helpers ───────────────────────────────────────────────
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // ─── Filtered & Paginated History ────────────────────────────────────
    const filteredHistory = pastSites.filter(site => {
        if (historyTypeFilter !== "all" && site.generation_type !== historyTypeFilter) return false;
        if (historyStatusFilter !== "all" && site.status !== historyStatusFilter) return false;
        if (historySearch) {
            const q = historySearch.toLowerCase();
            if (!site.source_url.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    const historyTotalPages = Math.ceil(filteredHistory.length / HISTORY_PER_PAGE);
    const historyIndexLast = historyPage * HISTORY_PER_PAGE;
    const historyIndexFirst = historyIndexLast - HISTORY_PER_PAGE;
    const currentHistoryItems = filteredHistory.slice(historyIndexFirst, historyIndexLast);
    const currentPageIds = currentHistoryItems.map(s => s.id);

    const allCurrentPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.has(id));
    const someCurrentPageSelected = currentPageIds.some(id => selectedIds.has(id)) && !allCurrentPageSelected;

    const toggleSelectAllPage = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allCurrentPageSelected) {
                currentPageIds.forEach(id => next.delete(id));
            } else {
                currentPageIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const selectAll = () => setSelectedIds(new Set(filteredHistory.map(s => s.id)));
    const clearSelection = () => setSelectedIds(new Set());

    const CheckboxIcon = allCurrentPageSelected ? CheckSquare : someCurrentPageSelected ? MinusSquare : Square;

    // ─── Utility Helpers ─────────────────────────────────────────────────
    const parseExtractedData = (jsonStr: string) => {
        try {
            return JSON.parse(jsonStr);
        } catch {
            return null;
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const formatFileSize = (bytes: number): string => {
        if (!bytes || bytes === 0) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                );
            case "processing":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-amber-100 text-amber-700">
                        <Loader2 className="w-3 h-3 animate-spin" /> Processing
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-slate-100 text-slate-500">
                        {status}
                    </span>
                );
        }
    };

    const getTypeBadge = (type: string) => {
        if (type === "redesign") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-violet-100 text-violet-700">
                    <Sparkles className="w-3 h-3" /> AI Redesign
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider bg-sky-100 text-sky-700">
                <Globe className="w-3 h-3" /> Capture
            </span>
        );
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

            if (!response.ok) throw new Error(await getErrorMessage(response, "Failed to activate"));

            setPastSites(prev =>
                prev.map(site => ({ ...site, is_active: site.id === result.id }))
            );
            showToast("Website is now active on /landing.", "success");
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Failed to activate website", "error");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* ─── Toast Notification ─────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold ${
                            toast.type === "success"
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-red-600 border-red-500 text-white"
                        }`}
                    >
                        {toast.type === "success"
                            ? <Zap className="w-4 h-4 shrink-0" />
                            : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
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
                                        pastSites.slice(0, 8).map((site) => (
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
                                                {site.generation_type === "redesign" && (
                                                    <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${result?.id === site.id ? "bg-white/20 text-white" : "bg-violet-100 text-violet-600"}`}>
                                                        <Sparkles className="w-2 h-2" /> Redesigned
                                                    </div>
                                                )}
                                                {site.redesigned_at && site.generation_type !== "redesign" && (
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

                    {/* ═══════════════════════════════════════════════════════
                        HISTORY & ACTIVITY TRACKING SECTION
                    ═══════════════════════════════════════════════════════ */}
                    <div className="mt-12">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                                    Generation History
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Track all website capture and redesign activities with full audit trail.
                                </p>
                            </div>

                            {/* Filter Pills */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Type filter */}
                                <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl shadow-sm">
                                    {(["all", "capture", "redesign"] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setHistoryTypeFilter(tab)}
                                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-widest cursor-pointer ${
                                                historyTypeFilter === tab
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-800"
                                            }`}
                                        >
                                            {tab === "all" ? "All Types" : tab === "capture" ? "Capture" : "AI Redesign"}
                                        </button>
                                    ))}
                                </div>

                                {/* Status filter */}
                                <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl shadow-sm">
                                    {(["all", "completed", "processing", "failed"] as const).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setHistoryStatusFilter(tab)}
                                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-widest cursor-pointer ${
                                                historyStatusFilter === tab
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-800"
                                            }`}
                                        >
                                            {tab === "all" ? "All Status" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by URL..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions Overlay */}
                        <AnimatePresence>
                            {selectedIds.size > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap items-center gap-4 px-5 py-3.5 mb-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-primary animate-pulse" />

                                    <span className="text-xs font-semibold text-white flex-1">
                                        {selectedIds.size} record{selectedIds.size > 1 ? "s" : ""} selected for operation
                                    </span>

                                    {selectedIds.size < filteredHistory.length && (
                                        <button
                                            onClick={selectAll}
                                            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2 transition-colors cursor-pointer"
                                        >
                                            Select all {filteredHistory.length}
                                        </button>
                                    )}

                                    <button
                                        onClick={clearSelection}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer text-slate-300"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Clear Selection
                                    </button>

                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={bulkDeleting}
                                        className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-60 cursor-pointer shadow-md"
                                    >
                                        {bulkDeleting ? (
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                        {bulkDeleting ? "Deleting…" : `Bulk Delete (${selectedIds.size})`}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* History Table */}
                        {loadingHistory ? (
                            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading generation history...</p>
                            </div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Clock className="w-7 h-7 text-slate-300" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-2">
                                    No Generation Records
                                </h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                    {historySearch || historyTypeFilter !== "all" || historyStatusFilter !== "all"
                                        ? "No records match your current filter criteria. Try adjusting your search or filters."
                                        : "Website generation records will appear here once you capture or redesign a site."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200/80">
                                                {/* Select-all checkbox */}
                                                <th className="px-5 py-4 w-10 text-center">
                                                    <button
                                                        onClick={toggleSelectAllPage}
                                                        title={allCurrentPageSelected ? "Deselect Page" : "Select Page"}
                                                        className="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mx-auto"
                                                    >
                                                        <CheckboxIcon className="w-4 h-4" />
                                                    </button>
                                                </th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Source URL</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date & Time</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset Size</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Active</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {currentHistoryItems.map((site) => {
                                                const isSelected = selectedIds.has(site.id);
                                                return (
                                                    <tr
                                                        key={site.id}
                                                        className={`transition-colors hover:bg-slate-50/80 ${
                                                            isSelected ? "bg-indigo-50/30" : ""
                                                        } ${result?.id === site.id ? "ring-1 ring-inset ring-primary/20 bg-primary/5" : ""}`}
                                                    >
                                                        {/* Per-row checkbox */}
                                                        <td className="px-5 py-4 text-center">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleSelect(site.id); }}
                                                                className={`flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                                                                    isSelected ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"
                                                                }`}
                                                            >
                                                                {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                                            </button>
                                                        </td>

                                                        {/* Source URL */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 max-w-[280px]">
                                                                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-slate-800 truncate">
                                                                        {site.source_url.replace(/^https?:\/\//, '')}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                                                        {site.source_url}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Type */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getTypeBadge(site.generation_type)}
                                                        </td>

                                                        {/* Date & Time */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div>
                                                                <p className="text-xs font-mono text-slate-600">{formatDate(site.created_at)}</p>
                                                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formatTime(site.created_at)}</p>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(site.status)}
                                                        </td>

                                                        {/* Asset Size */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-xs font-mono text-slate-500">
                                                                {formatFileSize(
                                                                    (site.redesigned_html_size || 0) > 0
                                                                        ? site.redesigned_html_size!
                                                                        : site.generated_html_size || 0
                                                                )}
                                                            </span>
                                                        </td>

                                                        {/* Active Toggle */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                {/* Toggle Switch */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); if (site.status === "completed") handleToggleActive(site); }}
                                                                    disabled={togglingActiveId === site.id || site.status !== "completed"}
                                                                    title={site.status !== "completed" ? "Only completed sites can be activated" : site.is_active ? "Click to deactivate" : "Click to activate"}
                                                                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                        site.is_active
                                                                            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                                                                            : "bg-slate-300 hover:bg-slate-400"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                                                                            site.is_active ? "translate-x-6" : "translate-x-1"
                                                                        }`}
                                                                    >
                                                                        {togglingActiveId === site.id && (
                                                                            <span className="absolute inset-0 flex items-center justify-center">
                                                                                <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </button>
                                                                {/* Status Badge */}
                                                                {site.is_active ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                        LIVE
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider bg-slate-100 text-slate-400">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {/* View / Open */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); viewPastSite(site.id); }}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg transition-all cursor-pointer"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                                                    <span>View</span>
                                                                </button>

                                                                {/* Delete */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(site.id); }}
                                                                    disabled={deletingId === site.id}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                                                >
                                                                    {deletingId === site.id ? (
                                                                        <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-600" /> Deleting...</>
                                                                    ) : (
                                                                        <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {/* Pagination footer */}
                                    {filteredHistory.length > HISTORY_PER_PAGE && (
                                        <div className="px-6 py-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                                            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                                                Showing{" "}
                                                <span className="text-slate-800 font-semibold font-mono">{historyIndexFirst + 1}</span>{" "}to{" "}
                                                <span className="text-slate-800 font-semibold font-mono">{Math.min(historyIndexLast, filteredHistory.length)}</span>{" "}of{" "}
                                                <span className="text-slate-800 font-semibold font-mono">{filteredHistory.length}</span>{" "}records
                                                {selectedIds.size > 0 && (
                                                    <span className="ml-2 text-indigo-600 font-bold">· {selectedIds.size} Selected</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={historyPage === 1}
                                                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>

                                                <div className="flex gap-1.5">
                                                    {(() => {
                                                        const maxButtons = 5;
                                                        let start = Math.max(1, historyPage - Math.floor(maxButtons / 2));
                                                        const end = Math.min(historyTotalPages, start + maxButtons - 1);
                                                        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
                                                        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                                                    })().map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setHistoryPage(page)}
                                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                historyPage === page
                                                                    ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                                                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => setHistoryPage(prev => Math.min(prev + 1, historyTotalPages))}
                                                    disabled={historyPage === historyTotalPages}
                                                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
