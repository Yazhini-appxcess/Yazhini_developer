"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Save,
    RefreshCw,
    Palette,
    Type,
    Upload,
    CheckCircle2,
    Info
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/lib/api";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";

export default function WidgetConfigPage() {
    const router = useRouter();
    const { settings, refreshSettings } = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [widgetName, setWidgetName] = useState("Leucadia Assistant");
    const [widgetPrimaryColor, setWidgetPrimaryColor] = useState("#0f172a");
    const [widgetLogoUrl, setWidgetLogoUrl] = useState<string | null>(null);
    const [logoCacheBuster, setLogoCacheBuster] = useState(Date.now());

    useEffect(() => {
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }

        if (settings) {
            setWidgetName(settings.widget_name || "Leucadia Assistant");
            setWidgetPrimaryColor(settings.widget_primary_color || "#0f172a");
            setWidgetLogoUrl(settings.widget_logo_url || null);
            setLoading(false);
        }
    }, [settings, router]);

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const token = localStorage.getItem("appxcess_token");
            const res = await fetch(`${API_URL}/api/appxcess/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    widget_name: widgetName,
                    widget_primary_color: widgetPrimaryColor
                })
            });

            if (res.ok) {
                await refreshSettings();
                setLogoCacheBuster(Date.now());
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save widget settings", error);
        } finally {
            setSaving(false);
        }
    };

    const uploadLogoFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "widget_logo");

        setSaving(true);
        try {
            const token = localStorage.getItem("appxcess_token");
            const res = await fetch(`${API_URL}/api/appxcess/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                await refreshSettings();
                setLogoCacheBuster(Date.now());
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to upload widget logo", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadLogoFile(file);
    };

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <AppXcessSidebar />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

                <div className="w-full p-12 relative z-10">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/appxcess/dashboard')}>AppXcess</span>
                                <span>/</span>
                                <span className="text-slate-900">Widget Config</span>
                            </nav>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Widget Configuration</h1>
                            <p className="text-slate-500 mt-2 text-lg">Customize the appearance and branding of your AI Chatbot widget</p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 h-12 px-8 rounded-xl font-bold transition-all duration-300 shadow-xl ${success
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : "bg-primary text-white hover:opacity-90 shadow-primary/30"
                                }`}
                        >
                            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {saving ? "Saving Changes..." : success ? "Config Applied" : "Save Configuration"}
                        </button>
                    </div>

                    <div className="space-y-12">
                        {/* Row 1: Widget Identity & Visual Asset */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Widget Identity Card */}
                            <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Type className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Widget Identity</h3>
                                </div>

                                <div className="max-w-md space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Assistant Display Name</label>
                                        <input
                                            type="text"
                                            value={widgetName}
                                            onChange={(e) => setWidgetName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 text-slate-900 font-medium text-xs"
                                            placeholder="Enter assistant name..."
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium mt-2 ml-1">This name appears at the top of the chat window.</p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Theme Color (Primary)</label>
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl group focus-within:border-primary transition-all">
                                            <input
                                                type="color"
                                                value={widgetPrimaryColor}
                                                onChange={(e) => setWidgetPrimaryColor(e.target.value)}
                                                className="h-8 w-12 cursor-pointer border-0 rounded-lg bg-transparent"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[10px] font-bold text-slate-900 lowercase">{widgetPrimaryColor}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">HEX Code</span>
                                            </div>
                                            <div className="ml-auto pr-2 text-slate-400">
                                                <Palette className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help Component */}
                            <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <MessageSquare className="w-5 h-5 text-sky-400" />
                                    </div>
                                    <h4 className="text-lg font-bold tracking-tight leading-tight">Widget Branding</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                        Changes here reflect across all user-facing interfaces. The assistant name and color theme are applied to the live production widget in real-time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Visual Asset */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm w-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Visual Asset</h3>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-40 h-40 rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200 flex items-center justify-center p-4 relative group/logo">
                                    {widgetLogoUrl ? (
                                        <img
                                            src={`${widgetLogoUrl}?t=${logoCacheBuster}`}
                                            alt="Widget Logo"
                                            className="w-full h-full object-contain transition-transform group-hover/logo:scale-110"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <Upload className="w-8 h-8" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Asset</span>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-900/0 hover:bg-slate-900/80 rounded-2xl transition-all opacity-0 hover:opacity-100">
                                        <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                        <div className="flex flex-col items-center gap-2 text-white">
                                            <Upload className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Update Logo</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                        <div className="flex gap-3">
                                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-xs font-medium text-amber-900 leading-relaxed">
                                                The avatar logo appears alongside every assistant response.
                                                We recommend a square image (minimum 512x512px) with a transparent background.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = (e: Event) => {
                                                const files = (e.target as HTMLInputElement).files;
                                                if (files?.[0]) {
                                                    uploadLogoFile(files[0]);
                                                }
                                            };
                                            input.click();
                                        }}
                                        className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-xs shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.98] cursor-pointer"
                                    >
                                        Upload New Asset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Preview Section */}
                        <div className="bg-slate-900 rounded-3xl p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl opacity-50" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                                <div className="max-w-md">
                                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-3">Real-time Preview</p>
                                    <h3 className="text-2xl font-bold text-white tracking-tight mb-4">Interaction Profile</h3>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                                        This is how your assistant will appear to end-users.
                                        Click save to apply these changes to the live production widget.
                                    </p>
                                </div>

                                <div className="flex-1 w-full max-w-xl">
                                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                                        {/* Chat Header */}
                                        <div className="p-5 flex items-center gap-3 bg-white border-b border-slate-100">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1.5 overflow-hidden">
                                                {widgetLogoUrl ? (
                                                    <img src={`${widgetLogoUrl}?t=${logoCacheBuster}`} alt="Logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 rounded-lg" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900" style={{ color: widgetPrimaryColor }}>{widgetName}</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Body */}
                                        <div className="p-6 space-y-4 bg-slate-50/30">
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                                    {widgetLogoUrl && <img src={`${widgetLogoUrl}?t=${logoCacheBuster}`} alt="Avatar" className="w-full h-full object-contain" />}
                                                </div>
                                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[80%]">
                                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                                        Hello! I&apos;m your {widgetName}. How can I help you today?
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start flex-row-reverse gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-[9px] font-bold text-white">
                                                    U
                                                </div>
                                                <div className="bg-slate-900 p-3 rounded-2xl rounded-tr-none text-white shadow-lg max-w-[80%]">
                                                    <p className="text-xs font-medium leading-relaxed">
                                                        I need help with my integration settings.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
