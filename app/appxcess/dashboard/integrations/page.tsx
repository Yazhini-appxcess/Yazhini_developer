"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    CheckCircle2,
    Globe,
    Database,
    Briefcase,
    LayoutGrid,
    Webhook,
    Search,
    Monitor
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { API_URL } from "@/lib/api";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";

interface Integration {
    id: number;
    category: string;
    name: string;
    description: string;
    logo_url: string;
    primary_color: string;
    documentation_url?: string;
    is_active: boolean;
}

const CATEGORIES = [
    { id: "erp", label: "ERP Hub", icon: Briefcase },
    { id: "crm", label: "CRM Hub", icon: LayoutGrid },
    { id: "mes", label: "MES Hub", icon: Monitor },
    { id: "database", label: "Database Hub", icon: Database },
    { id: "api", label: "API Connectors", icon: Webhook },
];

export default function AppXcessIntegrationsPage() {
    const router = useRouter();
    const { settings, refreshSettings } = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [activeCategory, setActiveCategory] = useState("erp");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        category: "erp",
        name: "",
        description: "",
        logo_url: "",
        primary_color: "#000000",
        documentation_url: "",
        is_active: true
    });

    useEffect(() => {
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }
        fetchIntegrations();
    }, [router]);

    const fetchIntegrations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/integrations`);
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data);
            }
        } catch (error) {
            console.error("Failed to load integrations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("appxcess_token");
            const url = editingId
                ? `${API_URL}/api/integrations/${editingId}`
                : `${API_URL}/api/integrations`;

            const method = editingId ? "PUT" : "POST";

            // Ensure category matches current tab if adding new
            const payload = { ...formData, category: activeCategory };

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchIntegrations();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error("Failed to save integration", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this integration?")) return;

        try {
            const token = localStorage.getItem("appxcess_token");
            const res = await fetch(`${API_URL}/api/integrations/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                setIntegrations(integrations.filter(i => i.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete integration", error);
        }
    };

    const openEditModal = (integration: Integration) => {
        setFormData({
            category: integration.category,
            name: integration.name,
            description: integration.description,
            logo_url: integration.logo_url,
            primary_color: integration.primary_color,
            documentation_url: integration.documentation_url || "",
            is_active: integration.is_active
        });
        setEditingId(integration.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            category: activeCategory,
            name: "",
            description: "",
            logo_url: "",
            primary_color: "#000000",
            documentation_url: "",
            is_active: true
        });
        setEditingId(null);
    };

    const filteredIntegrations = integrations.filter(i => i.category === activeCategory);

    if (loading && integrations.length === 0) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <AppXcessSidebar />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48" />

                <div className="w-full p-12 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Core Connectivity</p>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                Integration Hubs
                                <div className="bg-primary/10 p-2 rounded-2xl">
                                    <Globe className="w-8 h-8 text-primary" />
                                </div>
                            </h1>
                            <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl leading-relaxed">
                                Manage the dynamic integration services available to your tenants across ERP, CRM, and Databases.
                            </p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Integration</span>
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-bold transition-all border ${activeCategory === cat.id
                                        ? "bg-white border-primary shadow-xl shadow-primary/10 text-primary scale-105"
                                        : "bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300"
                                    }`}
                            >
                                <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? "text-primary" : "text-slate-400"}`} />
                                {cat.label}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeCategory === cat.id ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {integrations.filter(i => i.category === cat.id).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Integration Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredIntegrations.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"
                                    style={{ backgroundColor: `${item.primary_color}10` }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center">
                                            <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = "https://www.google.com/s2/favicons?domain=example.com&sz=128"} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-3">{item.name}</h3>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: item.primary_color }}
                                        />
                                        <span className="uppercase tracking-widest">{item.category} Integration</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State Add Button */}
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group min-h-[300px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Add Service</h3>
                                <p className="text-sm text-slate-500 font-medium">Register a new {activeCategory} integration</p>
                            </div>
                        </button>
                    </div>
                </div>
            </main>

            {/* Config Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">{activeCategory.toUpperCase()} Hub</p>
                                <h3 className="font-black text-2xl text-slate-900">
                                    {editingId ? "Edit Integration" : "New Integration"}
                                </h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Name</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="e.g. Sage 300"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Documentation URL</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="https://example.com/docs"
                                        value={formData.documentation_url}
                                        onChange={e => setFormData({ ...formData, documentation_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="Brief description of the integration capabilities..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo URL (Favicon)</label>
                                    <div className="flex gap-4">
                                        <input
                                            required
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="https://..."
                                            value={formData.logo_url}
                                            onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                        />
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-2 shrink-0 flex items-center justify-center">
                                            {formData.logo_url && <img src={formData.logo_url} alt="" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Color</label>
                                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-2 pr-5">
                                        <input
                                            type="color"
                                            className="w-12 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                                            value={formData.primary_color}
                                            onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                        />
                                        <div className="font-mono font-bold text-slate-600 flex-1">
                                            {formData.primary_color}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        <span className="animate-pulse">Saving...</span>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Save Integration</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
