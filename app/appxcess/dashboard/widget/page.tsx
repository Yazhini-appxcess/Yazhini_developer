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
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />

                <div className="w-full p-12 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Module / Experience</p>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                Widget Config
                                <div className="bg-primary/10 p-2 rounded-2xl">
                                    <MessageSquare className="w-8 h-8 text-primary" />
                                </div>
                            </h1>
                            <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl leading-relaxed">
                                Customize the appearance and branding of your AI Chatbot widget.
                                Changes here reflect across all user-facing interfaces.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => refreshSettings()}
                                className="p-4 bg-white border border-slate-200 rounded-3xl text-slate-500 hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-3 px-8 py-4 bg-[#0c32ed] text-white rounded-[2rem] font-bold shadow-2xl shadow-[#0c32ed]/20 hover:bg-[#0a2bcc] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {success ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        <span>Changes Saved</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                        {/* Core Settings Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {/* Widget Identity Card */}
                            <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Type className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Widget Identity</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assistant Display Name</label>
                                            <div className="relative group/input">
                                                <input
                                                    type="text"
                                                    value={widgetName}
                                                    onChange={(e) => setWidgetName(e.target.value)}
                                                    className="w-full bg-white border-2 border-slate-100 rounded-3xl px-6 py-4 outline-none focus:border-primary transition-all font-bold text-slate-900 shadow-sm group-hover/input:shadow-md"
                                                    placeholder="Enter assistant name..."
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium ml-1">This name appears at the top of the chat window.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color (Primary)</label>
                                            <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-[2rem]">
                                                <div className="relative group/color">
                                                    <input
                                                        type="color"
                                                        value={widgetPrimaryColor}
                                                        onChange={(e) => setWidgetPrimaryColor(e.target.value)}
                                                        className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl overflow-hidden"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={widgetPrimaryColor}
                                                        onChange={(e) => setWidgetPrimaryColor(e.target.value)}
                                                        className="bg-transparent font-mono font-black text-slate-900 outline-none text-xl tracking-tight"
                                                    />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HEX Code</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Asset Card */}
                            <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mb-16 group-hover:bg-indigo-500/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                            <Palette className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visual Asset</h3>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-10 items-center">
                                        <div className="w-48 h-48 rounded-[2.5rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center p-6 relative group/logo shadow-inner">
                                            {widgetLogoUrl ? (
                                                <img
                                                    src={`${widgetLogoUrl}?t=${logoCacheBuster}`}
                                                    alt="Widget Logo"
                                                    className="w-full h-full object-contain transition-transform group-hover/logo:scale-110"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-slate-300">
                                                    <Upload className="w-10 h-10" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">No Asset</span>
                                                </div>
                                            )}

                                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-900/0 hover:bg-slate-900/80 rounded-[2.5rem] transition-all opacity-0 hover:opacity-100">
                                                <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                                <div className="flex flex-col items-center gap-2 text-white">
                                                    <Upload className="w-6 h-6" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Update Logo</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex-1 space-y-6">
                                            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                                                <div className="flex gap-3">
                                                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
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
                                                className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                            >
                                                Upload New Asset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="bg-slate-900 rounded-[3.5rem] p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-subtle.svg')] opacity-10" />
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                                <div className="max-w-md">
                                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-4">Real-time Preview</p>
                                    <h3 className="text-4xl font-black text-white tracking-tight mb-6">Interaction Profile</h3>
                                    <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                        This is how your assistant will appear to end-users.
                                        Click save to apply these changes to the live production widget.
                                    </p>
                                </div>

                                <div className="flex-1 w-full max-w-xl">
                                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
                                        {/* Chat Header */}
                                        <div className="p-6 flex items-center gap-4 bg-white border-b border-slate-100">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 p-2 overflow-hidden">
                                                {widgetLogoUrl ? (
                                                    <img src={`${widgetLogoUrl}?t=${logoCacheBuster}`} alt="Logo" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full bg-primary/10 rounded-lg" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900" style={{ color: widgetPrimaryColor }}>{widgetName}</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Body */}
                                        <div className="p-8 space-y-6 bg-slate-50/30">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                                    {widgetLogoUrl && <img src={`${widgetLogoUrl}?t=${logoCacheBuster}`} alt="Avatar" className="w-full h-full object-contain" />}
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[80%]">
                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                                        Hello! I&apos;m your {widgetName}. How can I help you today?
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start flex-row-reverse gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-900 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                                                    U
                                                </div>
                                                <div className="bg-slate-900 p-4 rounded-2xl rounded-tr-none text-white shadow-lg max-w-[80%]">
                                                    <p className="text-sm font-medium leading-relaxed">
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
