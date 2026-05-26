"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Palette,
    Upload,
    Save,
    RefreshCw,
    Trash2,
    Info,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";
import { toast, Toaster } from "sonner";

interface BrandingFormState {
    companyName: string;
    primaryColor: string;
    logoFile: File | null;
    logoPreview: string | null;
    faviconFile: File | null;
    faviconPreview: string | null;
}

export default function BrandingPage() {
    const router = useRouter();
    const { settings, refreshSettings } = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formState, setFormState] = useState<BrandingFormState>({
        companyName: "",
        primaryColor: "#0f172a",
        logoFile: null,
        logoPreview: null,
        faviconFile: null,
        faviconPreview: null
    });

    const [isInitialized, setIsInitialized] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (settings && !isInitialized) {
            setFormState({
                companyName: settings.company_name || "",
                primaryColor: settings.primary_color || "#0f172a",
                logoFile: null,
                logoPreview: null,
                faviconFile: null,
                faviconPreview: null
            });
            setIsInitialized(true);
        }
    }, [settings, isInitialized]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === "favicon") {
            const allowedFaviconTypes = ["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"];
            if (!allowedFaviconTypes.includes(file.type)) {
                toast.error("Favicon must be image/png, image/x-icon, or image/svg+xml");
                return;
            }
        } else {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file.");
                return;
            }
        }

        if (type === "logo" && formState.logoPreview) {
            URL.revokeObjectURL(formState.logoPreview);
        } else if (type === "favicon" && formState.faviconPreview) {
            URL.revokeObjectURL(formState.faviconPreview);
        }

        const previewUrl = URL.createObjectURL(file);

        setFormState(prev => ({
            ...prev,
            [type === "logo" ? "logoFile" : "faviconFile"]: file,
            [type === "logo" ? "logoPreview" : "faviconPreview"]: previewUrl
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const token = localStorage.getItem("appxcess_token");
            if (!token) {
                toast.error("Authentication required. Please login again.");
                router.push("/appxcess/login");
                return;
            }

            // 1. Upload Logo if selected
            if (formState.logoFile) {
                const logoFormData = new FormData();
                logoFormData.append("file", formState.logoFile);
                logoFormData.append("type", "logo");

                const logoResponse = await fetch(`${API_URL}/api/appxcess/upload`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: logoFormData
                });

                if (!logoResponse.ok) {
                    const data = await logoResponse.json();
                    throw new Error(data.detail || "Failed to upload company logo");
                }
            }

            // 2. Upload Favicon if selected
            if (formState.faviconFile) {
                const faviconFormData = new FormData();
                faviconFormData.append("file", formState.faviconFile);
                faviconFormData.append("type", "favicon");

                const faviconResponse = await fetch(`${API_URL}/api/appxcess/upload`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: faviconFormData
                });

                if (!faviconResponse.ok) {
                    const data = await faviconResponse.json();
                    throw new Error(data.detail || "Failed to upload favicon");
                }
            }

            // 3. Update Settings metadata
            const settingsResponse = await fetch(`${API_URL}/api/appxcess/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...settings, // Preserving other settings
                    company_name: formState.companyName,
                    primary_color: formState.primaryColor
                })
            });

            if (!settingsResponse.ok) {
                const data = await settingsResponse.json();
                throw new Error(data.detail || "Failed to save organization settings");
            }

            // 4. Refresh global settings & reset form state files/previews
            await refreshSettings();
            
            // Clean up preview URLs
            if (formState.logoPreview) URL.revokeObjectURL(formState.logoPreview);
            if (formState.faviconPreview) URL.revokeObjectURL(formState.faviconPreview);

            setFormState(prev => ({
                ...prev,
                logoFile: null,
                logoPreview: null,
                faviconFile: null,
                faviconPreview: null
            }));
            setIsInitialized(false);

            setSuccess(true);
            toast.success("Branding settings applied successfully!");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An error occurred while saving branding settings.";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Initializing Control Plane...</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Toaster position="top-right" richColors />
            <AppXcessSidebar />

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
                                <span className="text-slate-900">Branding</span>
                            </nav>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Brand Identity</h1>
                            <p className="text-slate-500 mt-2 text-lg">Define the visual DNA of your enterprise platform</p>
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
                            {saving ? "Saving Changes..." : success ? "Settings Saved" : "Apply Changes"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* System Information */}
                        <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Information</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-primary transition-colors">Organization Name</label>
                                    <input
                                        type="text"
                                        value={formState.companyName}
                                        onChange={(e) => setFormState(prev => ({ ...prev, companyName: e.target.value }))}
                                        placeholder="Enter company name"
                                        disabled={saving}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 text-slate-900 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Theme Color</label>
                                    <div className="flex items-center gap-3 p-1 bg-slate-50/50 border border-slate-200 rounded-xl">
                                        <input
                                            type="color"
                                            value={formState.primaryColor}
                                            onChange={(e) => setFormState(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            disabled={saving}
                                            className="h-8 w-14 cursor-pointer rounded-lg border-0 bg-transparent ring-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[10px] font-bold text-slate-900 lowercase">{formState.primaryColor}</span>
                                        </div>
                                        <div className="ml-auto pr-2 text-slate-400">
                                            <Palette className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logo Asset */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Company Logo</h4>
                            <div className="relative group/logo">
                                <div className="h-40 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 group-hover/logo:border-primary/30 group-hover/logo:bg-slate-50">
                                    {formState.logoPreview || settings?.logo_url ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                            <img src={(formState.logoPreview || settings?.logo_url) ?? undefined} className="max-h-20 object-contain drop-shadow-lg" alt="Logo Preview" />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => !saving && logoInputRef.current?.click()}
                                                    disabled={saving}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Replace
                                                </button>
                                                {formState.logoPreview && (
                                                    <button
                                                        onClick={() => {
                                                            if (formState.logoPreview) URL.revokeObjectURL(formState.logoPreview);
                                                            setFormState(prev => ({ ...prev, logoFile: null, logoPreview: null }));
                                                        }}
                                                        disabled={saving}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 mb-2 ring-4 ring-slate-50">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">Upload Logo</p>
                                            <button
                                                onClick={() => !saving && logoInputRef.current?.click()}
                                                disabled={saving}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        </>
                                    )}
                                    <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                </div>
                            </div>
                        </div>

                        {/* Favicon Asset */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Favicon</h4>
                            <div className="relative group/favicon">
                                <div className="h-40 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 group-hover/favicon:border-primary/30 group-hover/favicon:bg-slate-50">
                                    {formState.faviconPreview || settings?.favicon_url ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2 border border-slate-100">
                                                <img src={(formState.faviconPreview || settings?.favicon_url) ?? undefined} className="w-full h-full object-contain" alt="Favicon Preview" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => !saving && faviconInputRef.current?.click()}
                                                    disabled={saving}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Replace
                                                </button>
                                                {formState.faviconPreview && (
                                                    <button
                                                        onClick={() => {
                                                            if (formState.faviconPreview) URL.revokeObjectURL(formState.faviconPreview);
                                                            setFormState(prev => ({ ...prev, faviconFile: null, faviconPreview: null }));
                                                        }}
                                                        disabled={saving}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 mb-2 ring-4 ring-slate-50">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-900">Upload Icon</p>
                                            <button
                                                onClick={() => !saving && faviconInputRef.current?.click()}
                                                disabled={saving}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        </>
                                    )}
                                    <input type="file" ref={faviconInputRef} hidden accept="image/png, image/x-icon, image/vnd.microsoft.icon, image/svg+xml" onChange={(e) => handleFileChange(e, 'favicon')} />
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="lg:col-span-3 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl opacity-50" />

                            <div className="relative z-10 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 mt-1">
                                    <Info className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-2">Platform Customization</h4>
                                    <p className="text-indigo-100 leading-relaxed text-sm font-medium opacity-90">
                                        These settings define the high-level branding across all user-facing interfaces. Primary colors affect buttons, active states, and focus rings. Changes are propagated in real-time to all active sessions via our cross-tab synchronization engine.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
