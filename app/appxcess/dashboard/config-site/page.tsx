/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Globe,
    Save,
    RefreshCw,
    Upload,
    Plus,
    Trash2,
    Layout,
    Type,
    Image as ImageIcon,
    Target,
    Settings,
    CheckCircle2,
    Palette,
    Layers,
    Info,
    ChevronRight,
    Search,
    Sparkles
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { toast, Toaster } from "sonner";



// TODO: Re-enable Website Module later
// Website Module is gated by its own feature flag, separate from Website
// Generation (/appxcess/website-generation). Currently DISABLED. To restore, flip the
// flag to true — the full implementation below is preserved untouched.
const ENABLE_WEBSITE_MODULE = false;

export default function WebsiteConfigPage() {
    const router = useRouter();
    useEffect(() => {
        if (!ENABLE_WEBSITE_MODULE) {
            router.replace("/appxcess/dashboard/branding");
        }
    }, [router]);
    if (!ENABLE_WEBSITE_MODULE) return null;
    return <_WebsiteConfigPageImpl />;
}

function _WebsiteConfigPageImpl() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/website/config`);
            const data = response.data;
            // Ensure defaults for arrays
            data.header_links = data.header_links || [];
            data.services_list = data.services_list || [];
            data.features_list = data.features_list || [];
            data.stats_list = data.stats_list || [];
            data.footer_social_links = data.footer_social_links || [];
            data.footer_columns = data.footer_columns || [];
            setConfig(data);
        } catch (error) {
            console.error("Error fetching website config:", error);
            toast.error("Failed to load website configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/api/website/config`, config);
            toast.success("Website configuration saved successfully!");
        } catch (error) {
            console.error("Error saving website config:", error);
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setConfig((prev: any) => ({ ...prev, [field]: value }));
    };

    const addListItem = (field: string, template: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [field]: [...prev[field], template]
        }));
    };

    const removeListItem = (field: string, index: number) => {
        setConfig((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const updateListItem = (field: string, index: number, subfield: string, value: any) => {
        setConfig((prev: any) => {
            const newList = [...prev[field]];
            newList[index] = { ...newList[index], [subfield]: value };
            return { ...prev, [field]: newList };
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "navigation", label: "Navigation", icon: Search },
        { id: "hero", label: "Hero Section", icon: Layout },
        { id: "about", label: "About Us", icon: Info },
        { id: "services", label: "Services", icon: Layers },
        { id: "features", label: "Community", icon: ImageIcon },
        { id: "stats", label: "Impact & CTA", icon: Target },
        { id: "footer", label: "Footer", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <AppXcessSidebar />
            <Toaster position="top-right" richColors />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />

                <div className="w-full p-8 lg:p-12 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/appxcess/dashboard')}>AppXcess</span>
                                <span>/</span>
                                <span className="text-slate-900">Website Config</span>
                            </nav>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dynamic Website Control</h1>
                            <p className="text-slate-500 mt-2 text-lg">Manage all content, colors, and assets for the corporate site</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.open('/website', '_blank')}
                                className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Globe className="w-4 h-4" />
                                View Website
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 h-12 px-8 rounded-xl font-bold bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto pb-px">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? "border-primary text-primary bg-primary/5"
                                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Form Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                        {/* Dynamic Section Based on Tab */}
                        <div className="lg:col-span-2 space-y-8">
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <FormSection title="Branding & Colors" icon={Palette}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField
                                                label="Company Name"
                                                value={config.company_name}
                                                onChange={(val) => updateField("company_name", val)}
                                            />
                                            <InputField
                                                label="Logo URL"
                                                value={config.logo_url}
                                                onChange={(val) => updateField("logo_url", val)}
                                                placeholder="https://..."
                                            />
                                        </div>

                                    </FormSection>

                                    <FormSection title="SEO Metadata" icon={Search}>
                                        <InputField
                                            label="Page Title"
                                            value={config.seo_title}
                                            onChange={(val) => updateField("seo_title", val)}
                                        />
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Meta Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 font-medium text-sm min-h-[100px]"
                                                value={config.seo_description || ""}
                                                onChange={(e) => updateField("seo_description", e.target.value)}
                                            />
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "navigation" && (
                                <div className="space-y-6">
                                    <FormSection title="Main Navigation (Navbar)" icon={Search}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField label="Login Button Text" value={config.navbar_login_text} onChange={(val) => updateField("navbar_login_text", val)} />
                                            <InputField label="Login Link" value={config.navbar_login_link} onChange={(val) => updateField("navbar_login_link", val)} />
                                            <InputField label="Portal Button Text" value={config.navbar_cta_text} onChange={(val) => updateField("navbar_cta_text", val)} />
                                            <InputField label="Portal Link" value={config.navbar_cta_link} onChange={(val) => updateField("navbar_cta_link", val)} />
                                        </div>
                                    </FormSection>

                                    <FormSection title="Header Menu Links" icon={Plus}>
                                        <div className="space-y-4">
                                            {config.header_links.map((link: any, index: number) => (
                                                <div key={index} className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                                    <button onClick={() => removeListItem("header_links", index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                    <InputField label="Link Name" value={link.name} onChange={(val) => updateListItem("header_links", index, "name", val)} />
                                                    <InputField label="Href (e.g. #services)" value={link.href} onChange={(val) => updateListItem("header_links", index, "href", val)} />
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem("header_links", { name: "New Link", href: "#" })} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-primary/30 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Header Link</button>
                                        </div>
                                    </FormSection>
                                </div>
                            )}
                            {activeTab === "hero" && (
                                <div className="space-y-6">
                                    <FormSection title="Main Content" icon={Type}>
                                        <InputField
                                            label="Hero Title"
                                            value={config.hero_title || ""}
                                            onChange={(val) => updateField("hero_title", val)}
                                        />
                                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                                            <InputField
                                                label="Hero Subtitle (Badge)"
                                                value={config.hero_subtitle || ""}
                                                onChange={(val) => updateField("hero_subtitle", val)}
                                            />
                                            <InputField
                                                label="Hero Image URL"
                                                value={config.hero_image_url || ""}
                                                onChange={(val) => updateField("hero_image_url", val)}
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Hero Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 font-medium text-sm min-h-[100px]"
                                                value={config.hero_description || ""}
                                                onChange={(e) => updateField("hero_description", e.target.value)}
                                            />
                                        </div>
                                    </FormSection>

                                    <FormSection title="Call to Actions" icon={Plus}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <InputField label="Primary CTA Text" value={config.hero_cta_text || ""} onChange={(val) => updateField("hero_cta_text", val)} />
                                                <InputField label="Primary CTA Link" value={config.hero_cta_link || ""} onChange={(val) => updateField("hero_cta_link", val)} />
                                            </div>
                                            <div className="space-y-4">
                                                <InputField label="Secondary CTA Text" value={config.hero_secondary_cta_text || ""} onChange={(val) => updateField("hero_secondary_cta_text", val)} />
                                                <InputField label="Secondary CTA Link" value={config.hero_secondary_cta_link || ""} onChange={(val) => updateField("hero_secondary_cta_link", val)} />
                                            </div>
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "about" && (
                                <div className="space-y-6">
                                    <FormSection title="About Us Content" icon={Info}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField label="Title" value={config.about_title || ""} onChange={(val) => updateField("about_title", val)} />
                                            <InputField label="Subtitle" value={config.about_subtitle || ""} onChange={(val) => updateField("about_subtitle", val)} />
                                            <InputField label="CTA Button Text" value={config.about_cta_text || ""} onChange={(val) => updateField("about_cta_text", val)} />
                                            <InputField label="CTA Button Link" value={config.about_cta_link || ""} onChange={(val) => updateField("about_cta_link", val)} />
                                        </div>
                                        <InputField label="Image URL" value={config.about_image_url || ""} onChange={(val) => updateField("about_image_url", val)} className="mt-4" />
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Main Description</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[100px]"
                                                    value={config.about_description || ""}
                                                    onChange={(e) => updateField("about_description", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mission Statement</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[100px]"
                                                    value={config.about_mission || ""}
                                                    onChange={(e) => updateField("about_mission", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "services" && (
                                <div className="space-y-6">
                                    <FormSection title="Services Header" icon={Type}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField label="Section Title" value={config.services_title || ""} onChange={(val) => updateField("services_title", val)} />
                                            <InputField label="Button Label (Learn More)" value={config.services_cta_text || ""} onChange={(val) => updateField("services_cta_text", val)} />
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Section Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[100px]"
                                                value={config.services_description || ""}
                                                onChange={(e) => updateField("services_description", e.target.value)}
                                            />
                                        </div>
                                    </FormSection>
                                    <FormSection title="Services List" icon={Layers}>
                                        <div className="space-y-4">
                                            {config.services_list.map((service: any, index: number) => (
                                                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                                    <button
                                                        onClick={() => removeListItem("services_list", index)}
                                                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <InputField label="Title" value={service.title || ""} onChange={(val) => updateListItem("services_list", index, "title", val)} />
                                                        <InputField label="Icon (Lucide name)" value={service.icon || ""} onChange={(val) => updateListItem("services_list", index, "icon", val)} />
                                                    </div>
                                                    <div className="mt-4">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                                                        <input
                                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                                                            value={service.description || ""}
                                                            onChange={(e) => updateListItem("services_list", index, "description", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addListItem("services_list", { title: "New Service", icon: "Home", description: "..." })}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Service
                                            </button>
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "features" && (
                                <div className="space-y-6">
                                    <FormSection title="Features Header" icon={Type}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputField label="Section Title" value={config.features_title || ""} onChange={(val) => updateField("features_title", val)} />
                                            <InputField label="Button Label (Explore)" value={config.features_cta_text || ""} onChange={(val) => updateField("features_cta_text", val)} />
                                        </div>
                                        <InputField label="Description" value={config.features_description || ""} onChange={(val) => updateField("features_description", val)} className="mt-4" />
                                    </FormSection>
                                    <FormSection title="Features List" icon={ImageIcon}>
                                        <div className="space-y-4">
                                            {config.features_list.map((feature: any, index: number) => (
                                                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                                    <button onClick={() => removeListItem("features_list", index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <InputField label="Title" value={feature.title || ""} onChange={(val) => updateListItem("features_list", index, "title", val)} />
                                                        <InputField label="Description" value={feature.description || ""} onChange={(val) => updateListItem("features_list", index, "description", val)} />
                                                        <InputField label="Icon" value={feature.icon || ""} onChange={(val) => updateListItem("features_list", index, "icon", val)} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem("features_list", { title: "Feature", description: "...", icon: "Activity" })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary/30 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Panel</button>
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "stats" && (
                                <div className="space-y-6">
                                    <FormSection title="Impact Numbers" icon={Target}>
                                        <div className="space-y-4">
                                            {config.stats_list.map((stat: any, index: number) => (
                                                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                                                    <button onClick={() => removeListItem("stats_list", index)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <InputField label="Number (e.g. 60k+)" value={stat.label || ""} onChange={(val) => updateListItem("stats_list", index, "label", val)} />
                                                        <InputField label="Topic (e.g. Community)" value={stat.value || ""} onChange={(val) => updateListItem("stats_list", index, "value", val)} />
                                                        <InputField label="Sublabel (e.g. Residents)" value={stat.sublabel || ""} onChange={(val) => updateListItem("stats_list", index, "sublabel", val)} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem("stats_list", { label: "0", value: "Topic", sublabel: "Unit" })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary/30 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Stat</button>
                                        </div>
                                    </FormSection>

                                    <FormSection title="Main Call to Action (CTA)" icon={Sparkles}>
                                        <InputField label="CTA Title" value={config.cta_title || ""} onChange={(val) => updateField("cta_title", val)} />
                                        <div className="mt-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">CTA Description</label>
                                            <textarea
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[100px]"
                                                value={config.cta_description || ""}
                                                onChange={(e) => updateField("cta_description", e.target.value)}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                                            <InputField label="Button Text" value={config.cta_button_text || ""} onChange={(val) => updateField("cta_button_text", val)} />
                                            <InputField label="Button Link" value={config.cta_button_link || ""} onChange={(val) => updateField("cta_button_link", val)} />
                                        </div>
                                    </FormSection>
                                </div>
                            )}

                            {activeTab === "footer" && (
                                <div className="space-y-6">
                                    <FormSection title="Footer Branding" icon={Layout}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">About Text</label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-h-[100px]"
                                                    value={config.footer_about || ""}
                                                    onChange={(e) => updateField("footer_about", e.target.value)}
                                                />
                                            </div>
                                            <InputField label="Copyright Text" value={config.footer_copyright || ""} onChange={(val) => updateField("footer_copyright", val)} />
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <InputField label="Privacy Policy Link" value={config.footer_privacy_link || ""} onChange={(val) => updateField("footer_privacy_link", val)} />
                                                <InputField label="Terms of Service Link" value={config.footer_terms_link || ""} onChange={(val) => updateField("footer_terms_link", val)} />
                                            </div>
                                        </div>
                                    </FormSection>
                                    <FormSection title="Footer Columns" icon={Layers}>
                                        <div className="space-y-8">
                                            {config.footer_columns.map((col: any, colIndex: number) => (
                                                <div key={colIndex} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl relative animate-fade-up">
                                                    <button onClick={() => removeListItem("footer_columns", colIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                    <InputField label="Column Title" value={col.title} onChange={(val) => updateListItem("footer_columns", colIndex, "title", val)} />
                                                    <div className="mt-4 space-y-3">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Links</label>
                                                        {col.links.map((link: any, linkIndex: number) => (
                                                            <div key={linkIndex} className="flex gap-2">
                                                                <input
                                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                                                    placeholder="Name"
                                                                    value={link.name}
                                                                    onChange={(e) => {
                                                                        const newCols = [...config.footer_columns];
                                                                        newCols[colIndex].links[linkIndex].name = e.target.value;
                                                                        updateField("footer_columns", newCols);
                                                                    }}
                                                                />
                                                                <input
                                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                                                    placeholder="Link"
                                                                    value={link.href}
                                                                    onChange={(e) => {
                                                                        const newCols = [...config.footer_columns];
                                                                        newCols[colIndex].links[linkIndex].href = e.target.value;
                                                                        updateField("footer_columns", newCols);
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newCols = [...config.footer_columns];
                                                                        newCols[colIndex].links = newCols[colIndex].links.filter((_: any, i: number) => i !== linkIndex);
                                                                        updateField("footer_columns", newCols);
                                                                    }}
                                                                    className="text-red-400 p-2"
                                                                ><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const newCols = [...config.footer_columns];
                                                                newCols[colIndex].links.push({ name: "New Link", href: "#" });
                                                                updateField("footer_columns", newCols);
                                                            }}
                                                            className="text-xs font-bold text-primary flex items-center gap-1.5 ml-1 mt-2"
                                                        ><Plus className="w-3 h-3" /> Add Link</button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => addListItem("footer_columns", { title: "Category", links: [] })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-primary/30 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Column</button>
                                        </div>
                                    </FormSection>
                                </div>
                            )}
                        </div>

                        {/* Preview / Sidebar Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">Live Integration</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        All changes made here are applied in real-time. The corporate website at <span className="text-white font-mono">/website</span> will immediately reflect your updates once saved.
                                    </p>
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-300">Backend Ready</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-300">Dynamic Styles Enabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pro Tip</h4>
                                <p className="text-slate-600 text-xs leading-relaxed">
                                    Use high-quality images from Unsplash or your own assets to maintain the premium feel. The website uses glassmorphism and heavy blur, which works best with vibrant background images.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function FormSection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, className }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, className?: string }) {
    return (
        <div className={`group ${className}`}>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-primary transition-colors">{label}</label>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all duration-200 text-slate-900 font-medium text-xs"
            />
        </div>
    );
}


