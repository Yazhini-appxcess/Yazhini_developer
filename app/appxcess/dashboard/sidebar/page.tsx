"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    PanelLeft,
    Save,
    RefreshCw,
    Monitor,
    MousePointer2,
    Eye,
    EyeOff,
    CheckCircle2,
    Sparkles,
    Upload,
    History,
    Plus,
    Trash2,
    Link as LinkIcon,
    Database,
    Router as RouterIcon,
    AppWindow,
    Edit2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    GripVertical,
    FolderPlus,
    AlertTriangle,
    Shield
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import AppXcessSidebar from "@/components/layout/AppXcessSidebar";
import { toast, Toaster } from "sonner";

interface CustomLink {
    name: string;
    href: string;
    icon: string;
    role?: string;
    openType?: string;
}

interface CustomSection {
    title: string;
    links: CustomLink[];
}

export default function SidebarConfigPage() {
    const router = useRouter();
    const { settings, refreshSettings } = useTheme();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [sidebarBg, setSidebarBg] = useState("#ffffff");
    const [sidebarText, setSidebarText] = useState("#0f172a");
    const [sidebarEnabled, setSidebarEnabled] = useState(true);

    // Sidebar Items Controls
    const [showDashboard, setShowDashboard] = useState(true);
    const [showCopilot, setShowCopilot] = useState(true);
    const [showUploadHub, setShowUploadHub] = useState(true);
    const [showDocuments, setShowDocuments] = useState(true);
    const [showConversations, setShowConversations] = useState(true);
    const [showAdminManagement, setShowAdminManagement] = useState(true);
    const [showActivityLog, setShowActivityLog] = useState(true);
    const [showErpHub, setShowErpHub] = useState(true);
    const [showCrmHub, setShowCrmHub] = useState(true);
    const [showDatabaseHub, setShowDatabaseHub] = useState(true);
    const [showApiDocs, setShowApiDocs] = useState(true);
    const [showIotHub, setShowIotHub] = useState(true);
    const [showMicrosoftHub, setShowMicrosoftHub] = useState(true);
    const [showMesHub, setShowMesHub] = useState(true);

    // Category Labels
    const [integrationLabel, setIntegrationLabel] = useState("Integration");
    const [customLinksLabel, setCustomLinksLabel] = useState("Custom Links");

    // Custom Sections
    const [customSections, setCustomSections] = useState<CustomSection[]>([]);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    
    // Collapse/Expand state for category cards
    const [collapsedSections, setCollapsedSections] = useState<{ [key: number]: boolean }>({});

    // Inline edit category state
    const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
    const [editingCategoryTitle, setEditingCategoryTitle] = useState("");

    // Inline link form toggles
    const [showAddLinkForm, setShowAddLinkForm] = useState<{ [key: number]: boolean }>({});
    
    // Inline link form inputs
    const [linkInputs, setLinkInputs] = useState<{
        [key: number]: {
            name: string;
            href: string;
            icon: string;
            role: string;
            openType: string;
        }
    }>({});

    // Delete confirmation modal state
    const [deleteTarget, setDeleteTarget] = useState<{
        type: "category" | "link";
        categoryIndex: number;
        linkIndex?: number;
    } | null>(null);

    // Drag and drop sorting states
    const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
    const [draggedLink, setDraggedLink] = useState<{ categoryIndex: number; linkIndex: number } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("appxcess_token");
        if (!token) {
            router.push("/appxcess/login");
            return;
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        if (settings) {
            setSidebarBg(settings.sidebar_bg_color || "#ffffff");
            setSidebarText(settings.sidebar_text_color || "#0f172a");
            setSidebarEnabled(settings.sidebar_enabled ?? true);

            setShowDashboard(settings.show_dashboard ?? true);
            setShowCopilot(settings.show_copilot ?? true);
            setShowUploadHub(settings.show_upload_hub ?? true);
            setShowDocuments(settings.show_documents ?? true);
            setShowConversations(settings.show_conversations ?? true);
            setShowAdminManagement(settings.show_admin_management ?? true);
            setShowActivityLog(settings.show_activity_log ?? true);
            setShowErpHub(settings.show_erp_hub ?? true);
            setShowCrmHub(settings.show_crm_hub ?? true);
            setShowDatabaseHub(settings.show_database_hub ?? true);
            setShowApiDocs(settings.show_api_docs ?? true);
            setShowIotHub(settings.show_iot_hub ?? true);
            setShowMicrosoftHub(settings.show_microsoft_hub ?? true);
            setShowMesHub(settings.show_mes_hub ?? true);
            setCustomSections(settings.custom_sections || []);
            setIntegrationLabel(settings.integration_label || "Integration");
            setCustomLinksLabel(settings.custom_links_label || "Custom Links");
        }
    }, [settings]);

    const handleSave = async (updatedSections?: CustomSection[]) => {
        setSaving(true);
        setSuccess(false);
        try {
            const token = localStorage.getItem("appxcess_token");
            const finalSections = updatedSections || customSections;

            const response = await fetch(`${API_URL}/api/appxcess/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...settings,
                    sidebar_bg_color: sidebarBg,
                    sidebar_text_color: sidebarText,
                    sidebar_enabled: sidebarEnabled,
                    show_dashboard: showDashboard,
                    show_copilot: showCopilot,
                    show_upload_hub: showUploadHub,
                    show_documents: showDocuments,
                    show_conversations: showConversations,
                    show_admin_management: showAdminManagement,
                    show_activity_log: showActivityLog,
                    show_erp_hub: showErpHub,
                    show_crm_hub: showCrmHub,
                    show_database_hub: showDatabaseHub,
                    show_api_docs: showApiDocs,
                    show_iot_hub: showIotHub,
                    show_microsoft_hub: showMicrosoftHub,
                    show_mes_hub: showMesHub,
                    custom_sections: finalSections,
                    integration_label: integrationLabel,
                    custom_links_label: customLinksLabel
                })
            });

            if (response.ok) {
                await refreshSettings();
                setSuccess(true);
                toast.success("Navigation configuration updated successfully!");
                setTimeout(() => setSuccess(false), 3000);
            } else {
                toast.error("Failed to save navigation layout settings.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving the configuration.");
        } finally {
            setSaving(false);
        }
    };

    // Category Management
    const handleAddCategory = () => {
        const title = newSectionTitle.trim();
        if (!title) {
            toast.warning("Please enter a category name.");
            return;
        }

        // Duplicate category name validation
        const exists = customSections.some(
            (sec) => sec.title.toLowerCase() === title.toLowerCase()
        );
        if (exists) {
            toast.error(`Category "${title}" already exists!`);
            return;
        }

        const updatedSections = [...customSections, { title, links: [] }];
        setCustomSections(updatedSections);
        setNewSectionTitle("");
        
        // Auto-save changes immediately for persistence
        handleSave(updatedSections);
        toast.success(`Category "${title}" created successfully.`);
    };

    const handleStartEditCategory = (index: number, currentTitle: string) => {
        setEditingCategoryIndex(index);
        setEditingCategoryTitle(currentTitle);
    };

    const handleSaveCategoryEdit = (index: number) => {
        const title = editingCategoryTitle.trim();
        if (!title) {
            toast.warning("Category name cannot be empty.");
            return;
        }

        // Check duplicates excluding the current one
        const exists = customSections.some(
            (sec, i) => i !== index && sec.title.toLowerCase() === title.toLowerCase()
        );
        if (exists) {
            toast.error(`Category "${title}" already exists!`);
            return;
        }

        const updated = [...customSections];
        const oldTitle = updated[index].title;
        updated[index].title = title;
        setCustomSections(updated);
        setEditingCategoryIndex(null);
        
        handleSave(updated);
        toast.success(`Renamed "${oldTitle}" to "${title}".`);
    };

    const handleCancelCategoryEdit = () => {
        setEditingCategoryIndex(null);
    };

    // Collapse/Expand state handler
    const toggleCollapse = (index: number) => {
        setCollapsedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Link Inputs Management
    const handleLinkInputChange = (
        sectionIndex: number,
        field: keyof ReturnType<typeof getInitialLinkState>,
        value: string
    ) => {
        setLinkInputs(prev => ({
            ...prev,
            [sectionIndex]: {
                ...(prev[sectionIndex] || getInitialLinkState()),
                [field]: value
            }
        }));
    };

    const getInitialLinkState = () => ({
        name: "",
        href: "",
        icon: "link",
        role: "all",
        openType: "internal"
    });

    const handleAddLink = (sectionIndex: number) => {
        const input = linkInputs[sectionIndex] || getInitialLinkState();
        const name = input.name.trim();
        const href = input.href.trim();

        if (!name || !href) {
            toast.warning("Display Name and Route/URL are required.");
            return;
        }

        const updatedSections = [...customSections];
        const section = updatedSections[sectionIndex];
        
        // Add new link to links array
        section.links = [
            ...(section.links || []),
            {
                name,
                href,
                icon: input.icon || "link",
                role: input.role || "all",
                openType: input.openType || "internal"
            }
        ];

        setCustomSections(updatedSections);
        
        // Reset link inputs for this section
        setLinkInputs(prev => ({
            ...prev,
            [sectionIndex]: getInitialLinkState()
        }));
        
        // Hide inline form
        setShowAddLinkForm(prev => ({
            ...prev,
            [sectionIndex]: false
        }));

        handleSave(updatedSections);
        toast.success(`Added link "${name}" to "${section.title}".`);
    };

    // Deletion Modal logic
    const triggerDelete = (
        type: "category" | "link",
        categoryIndex: number,
        linkIndex?: number
    ) => {
        setDeleteTarget({ type, categoryIndex, linkIndex });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        const updated = [...customSections];
        const { type, categoryIndex, linkIndex } = deleteTarget;

        if (type === "category") {
            const title = updated[categoryIndex].title;
            updated.splice(categoryIndex, 1);
            setCustomSections(updated);
            
            // Clean up inputs and collapse states
            const updatedInputs = { ...linkInputs };
            delete updatedInputs[categoryIndex];
            setLinkInputs(updatedInputs);

            const updatedCollapses = { ...collapsedSections };
            delete updatedCollapses[categoryIndex];
            setCollapsedSections(updatedCollapses);

            handleSave(updated);
            toast.success(`Category "${title}" deleted.`);
        } else if (type === "link" && linkIndex !== undefined) {
            const linkName = updated[categoryIndex].links[linkIndex].name;
            updated[categoryIndex].links.splice(linkIndex, 1);
            setCustomSections(updated);
            
            handleSave(updated);
            toast.success(`Link "${linkName}" removed.`);
        }

        setDeleteTarget(null);
    };

    // Drag and Drop (HTML5 Native)
    const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
        setDraggedCategoryIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleCategoryDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
        
        const list = [...customSections];
        const draggedItem = list[draggedCategoryIndex];
        list.splice(draggedCategoryIndex, 1);
        list.splice(index, 0, draggedItem);
        
        setDraggedCategoryIndex(index);
        setCustomSections(list);
    };

    const handleCategoryDragEnd = () => {
        setDraggedCategoryIndex(null);
        handleSave(customSections);
    };

    const handleLinkDragStart = (e: React.DragEvent, categoryIndex: number, linkIndex: number) => {
        setDraggedLink({ categoryIndex, linkIndex });
        e.stopPropagation();
    };

    const handleLinkDragOver = (e: React.DragEvent, categoryIndex: number, linkIndex: number) => {
        e.preventDefault();
        if (!draggedLink) return;
        if (draggedLink.categoryIndex !== categoryIndex) return; // Only allow sorting within same category
        if (draggedLink.linkIndex === linkIndex) return;

        const sections = [...customSections];
        const links = [...(sections[categoryIndex].links || [])];
        const draggedItem = links[draggedLink.linkIndex];
        
        links.splice(draggedLink.linkIndex, 1);
        links.splice(linkIndex, 0, draggedItem);
        sections[categoryIndex].links = links;

        setDraggedLink({ categoryIndex, linkIndex });
        setCustomSections(sections);
        e.stopPropagation();
    };

    const handleLinkDragEnd = () => {
        setDraggedLink(null);
        handleSave(customSections);
    };

    const ControlToggle = ({ label, checked, onChange, icon: Icon }: { label: string, checked: boolean, onChange: (val: boolean) => void, icon: React.ComponentType<{ className?: string }> }) => (
        <div
            onClick={() => onChange(!checked)}
            className={`flex flex-col gap-4 p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${checked
                ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl transition-colors duration-300 ${checked ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${checked ? "bg-primary" : "bg-slate-200"}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? "translate-x-4" : ""}`} />
                </div>
            </div>
            <div>
                <p className={`font-bold text-sm tracking-tight ${checked ? "text-primary" : "text-slate-900"}`}>{label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{checked ? "System Visible" : "Hidden"}</p>
            </div>
        </div>
    );

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Toaster position="top-right" richColors />
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
                                <span className="text-slate-900">Sidebar Layout</span>
                            </nav>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sidebar Configuration</h1>
                            <p className="text-slate-500 mt-2 text-lg">Manage interface aesthetics and granular menu visibility</p>
                        </div>

                        <button
                            onClick={() => handleSave()}
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
                        {/* Row 1: Canvas & Interaction Model */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Interface Aesthetics */}
                            <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Monitor className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sidebar Canvas</h3>
                                </div>

                                <div className="max-w-md space-y-6">
                                    {/* Sidebar Toggle & Colors Cluster */}
                                    <div
                                        onClick={() => setSidebarEnabled(!sidebarEnabled)}
                                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${sidebarEnabled
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-slate-50 border-slate-200 text-slate-400"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <PanelLeft className="w-5 h-5" />
                                            <span className="font-bold text-sm">Deployment Active</span>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sidebarEnabled ? "bg-white/20" : "bg-slate-200"}`}>
                                            {sidebarEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Canvas Background</label>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl group focus-within:border-primary transition-all">
                                                <input
                                                    type="color"
                                                    value={sidebarBg}
                                                    onChange={(e) => setSidebarBg(e.target.value)}
                                                    className="h-8 w-12 cursor-pointer border-0 rounded-lg bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Canvas Text</label>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl group focus-within:border-primary transition-all">
                                                <input
                                                    type="color"
                                                    value={sidebarText}
                                                    onChange={(e) => setSidebarText(e.target.value)}
                                                    className="h-8 w-12 cursor-pointer border-0 rounded-lg bg-transparent"
                                                />
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
                                        <MousePointer2 className="w-5 h-5 text-sky-400" />
                                    </div>
                                    <h4 className="text-lg font-bold tracking-tight leading-tight">Interaction Model</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                        Configuring these visibility toggles will immediately propagate to all tenant administrators and superusers. Use the canvas settings to align the interface with your organization&apos;s specific color palette.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Menu Arrangement */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-10 shadow-sm w-full">
                            <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Arrangement</h3>
                                        <p className="text-slate-500 font-medium text-sm">Toggle visibility of specific modules for active users</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {/* Main Navigation Category */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Main Navigation</span>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                        <ControlToggle label="Dashboard" icon={Monitor} checked={showDashboard} onChange={setShowDashboard} />
                                        <ControlToggle label="Internal Assistant" icon={Sparkles} checked={showCopilot} onChange={setShowCopilot} />
                                        <ControlToggle label="Upload Hub" icon={Upload} checked={showUploadHub} onChange={setShowUploadHub} />
                                        <ControlToggle label="Document Library" icon={Eye} checked={showDocuments} onChange={setShowDocuments} />
                                        <ControlToggle label="Conversations" icon={History} checked={showConversations} onChange={setShowConversations} />
                                        <ControlToggle label="Admin Management" icon={Plus} checked={showAdminManagement} onChange={setShowAdminManagement} />
                                        <ControlToggle label="Activity Log" icon={History} checked={showActivityLog} onChange={setShowActivityLog} />
                                    </div>
                                </div>

                                {/* Integration Category with Editable Label */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-primary transition-all">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Label:</span>
                                            <input
                                                type="text"
                                                value={integrationLabel}
                                                onChange={(e) => setIntegrationLabel(e.target.value)}
                                                className="bg-transparent text-[10px] font-black text-slate-900 uppercase tracking-[0.1em] outline-none min-w-[100px]"
                                                placeholder="Integration Label"
                                            />
                                        </div>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                        <ControlToggle label="ERP Hub" icon={Eye} checked={showErpHub} onChange={setShowErpHub} />
                                        <ControlToggle label="CRM Hub" icon={Eye} checked={showCrmHub} onChange={setShowCrmHub} />
                                        <ControlToggle label="Database Hub" icon={Database} checked={showDatabaseHub} onChange={setShowDatabaseHub} />
                                        <ControlToggle label="API Docs" icon={Eye} checked={showApiDocs} onChange={setShowApiDocs} />
                                        <ControlToggle label="IoT Hub" icon={RouterIcon} checked={showIotHub} onChange={setShowIotHub} />
                                        <ControlToggle label="Microsoft Hub" icon={AppWindow} checked={showMicrosoftHub} onChange={setShowMicrosoftHub} />
                                        <ControlToggle label="MES Hub" icon={Monitor} checked={showMesHub} onChange={setShowMesHub} />
                                    </div>
                                </div>

                                {/* Custom Categories Context Label */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-primary transition-all">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Context:</span>
                                            <input
                                                type="text"
                                                value={customLinksLabel}
                                                onChange={(e) => setCustomLinksLabel(e.target.value)}
                                                className="bg-transparent text-[10px] font-black text-slate-900 uppercase tracking-[0.1em] outline-none min-w-[120px]"
                                                placeholder="Custom Links Header"
                                            />
                                        </div>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>
                                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-dashed border-slate-200 text-center">
                                        <p className="text-xs text-slate-400 font-medium">Configure individual categories and links in the Custom Navigation section below</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Custom Navigation */}
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-10 shadow-sm w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <FolderPlus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Custom Navigation</h3>
                                        <p className="text-slate-500 font-medium text-sm">Inject dynamic categories and links into the user sidebar</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        placeholder="New Category Name (e.g. Resources)"
                                        className="w-64 px-4 py-3 bg-slate-100 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="h-12 px-6 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" /> Add Category
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {customSections.map((section, sIndex) => {
                                    const isCollapsed = !!collapsedSections[sIndex];
                                    const isEditing = editingCategoryIndex === sIndex;

                                    return (
                                        <div
                                            key={sIndex}
                                            draggable={!isEditing}
                                            onDragStart={(e) => handleCategoryDragStart(e, sIndex)}
                                            onDragOver={(e) => handleCategoryDragOver(e, sIndex)}
                                            onDragEnd={handleCategoryDragEnd}
                                            className={`bg-slate-50/50 rounded-3xl p-8 border border-slate-200/60 relative transition-all duration-300 ${
                                                draggedCategoryIndex === sIndex ? "opacity-40 scale-[0.98] border-dashed border-primary" : ""
                                            }`}
                                        >
                                            {/* Category Header */}
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {/* Drag Handle */}
                                                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center">
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>
                                                    
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2 flex-1 max-w-md">
                                                            <input
                                                                type="text"
                                                                value={editingCategoryTitle}
                                                                onChange={(e) => setEditingCategoryTitle(e.target.value)}
                                                                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary w-full text-slate-900"
                                                                onKeyDown={(e) => e.key === "Enter" && handleSaveCategoryEdit(sIndex)}
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveCategoryEdit(sIndex)}
                                                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={handleCancelCategoryEdit}
                                                                className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400">Category</span>
                                                            <div className="h-3 w-px bg-slate-300" />
                                                            <span className="text-sm font-bold text-slate-900 truncate">{section.title}</span>
                                                            
                                                            {/* Edit Trigger */}
                                                            <button
                                                                onClick={() => handleStartEditCategory(sIndex, section.title)}
                                                                className="p-1 text-slate-400 hover:text-primary rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                                                title="Rename Category"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Collapse/Expand Toggle */}
                                                    <button
                                                        onClick={() => toggleCollapse(sIndex)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                        title={isCollapsed ? "Expand Category" : "Collapse Category"}
                                                    >
                                                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                                    </button>

                                                    {/* Add Link Trigger */}
                                                    <button
                                                        onClick={() => setShowAddLinkForm(prev => ({ ...prev, [sIndex]: !prev[sIndex] }))}
                                                        className="px-3 py-1.5 bg-slate-900 text-white hover:opacity-90 rounded-xl text-[10px] font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Link
                                                    </button>

                                                    {/* Delete Category Trigger */}
                                                    <button
                                                        onClick={() => triggerDelete("category", sIndex)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Category Links Body */}
                                            {!isCollapsed && (
                                                <div className="space-y-6">
                                                    {/* Links sorting canvas */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                        {(section.links || []).map((link, lIndex) => (
                                                            <div
                                                                key={lIndex}
                                                                draggable
                                                                onDragStart={(e) => handleLinkDragStart(e, sIndex, lIndex)}
                                                                onDragOver={(e) => handleLinkDragOver(e, sIndex, lIndex)}
                                                                onDragEnd={handleLinkDragEnd}
                                                                className={`flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 transition-all duration-200 group/link ${
                                                                    draggedLink?.categoryIndex === sIndex && draggedLink?.linkIndex === lIndex
                                                                        ? "opacity-30 scale-95 border-dashed border-primary"
                                                                        : "hover:border-slate-300 hover:shadow-sm"
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    {/* Drag handle link */}
                                                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                                                                        <GripVertical className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0">
                                                                        <span className="material-icons-round text-sm">{link.icon || "link"}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs font-bold text-slate-900 truncate">{link.name}</p>
                                                                        <p className="text-[10px] font-medium text-slate-400 truncate max-w-[130px]" title={link.href}>
                                                                            {link.href}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-1.5">
                                                                    {/* Attributes Badges */}
                                                                    {link.role && link.role !== "all" && (
                                                                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-0.5" title={`Access: ${link.role}`}>
                                                                            <Shield className="w-2.5 h-2.5" /> {link.role.replace("_access", "")}
                                                                        </span>
                                                                    )}
                                                                    {link.openType === "external" && (
                                                                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                                            EXT
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        onClick={() => triggerDelete("link", sIndex, lIndex)}
                                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center opacity-0 group-hover/link:opacity-100 cursor-pointer"
                                                                        title="Remove Link"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {(!section.links || section.links.length === 0) && (
                                                            <div className="col-span-full py-6 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                                                                <p className="text-xs text-slate-400 font-medium">No links added yet</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Add Link Form Panel */}
                                                    {showAddLinkForm[sIndex] && (
                                                        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                                                <span className="text-xs font-bold text-slate-900">Add New Link to {section.title}</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                                                {/* Link Name */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Link Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={linkInputs[sIndex]?.name || ""}
                                                                        onChange={(e) => handleLinkInputChange(sIndex, "name", e.target.value)}
                                                                        placeholder="e.g. Reports"
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                                                                    />
                                                                </div>

                                                                {/* Route / URL */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Route / URL</label>
                                                                    <input
                                                                        type="text"
                                                                        value={linkInputs[sIndex]?.href || ""}
                                                                        onChange={(e) => handleLinkInputChange(sIndex, "href", e.target.value)}
                                                                        placeholder="e.g. /reports"
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                                                                    />
                                                                </div>

                                                                {/* Icon Selector */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icon</label>
                                                                    <select
                                                                        value={linkInputs[sIndex]?.icon || "link"}
                                                                        onChange={(e) => handleLinkInputChange(sIndex, "icon", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-950"
                                                                    >
                                                                        <option value="link">Link Icon</option>
                                                                        <option value="description">Document</option>
                                                                        <option value="folder">Folder</option>
                                                                        <option value="star">Star</option>
                                                                        <option value="settings">Settings</option>
                                                                        <option value="analytics">Analytics</option>
                                                                        <option value="info">Info</option>
                                                                        <option value="person">User Profile</option>
                                                                        <option value="help">Question Mark</option>
                                                                        <option value="category">Category Card</option>
                                                                        <option value="database">Database Storage</option>
                                                                        <option value="cloud">Cloud Ingest</option>
                                                                        <option value="build">Build Tools</option>
                                                                    </select>
                                                                </div>

                                                                {/* Access Role */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role / Access</label>
                                                                    <select
                                                                        value={linkInputs[sIndex]?.role || "all"}
                                                                        onChange={(e) => handleLinkInputChange(sIndex, "role", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-950"
                                                                    >
                                                                        <option value="all">All Administrators</option>
                                                                        <option value="superadmin_only">Super Admin Only</option>
                                                                        <option value="dashboard_access">Dashboard Permission</option>
                                                                        <option value="copilot_access">Copilot Permission</option>
                                                                        <option value="upload_hub_access">Upload Hub Permission</option>
                                                                        <option value="document_library_access">Document Library Permission</option>
                                                                        <option value="conversations_access">Conversations Permission</option>
                                                                        <option value="users_access">Users Permission</option>
                                                                        <option value="activity_log_access">Activity Logs Permission</option>
                                                                    </select>
                                                                </div>

                                                                {/* Link Target Type */}
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Open Type</label>
                                                                    <select
                                                                        value={linkInputs[sIndex]?.openType || "internal"}
                                                                        onChange={(e) => handleLinkInputChange(sIndex, "openType", e.target.value)}
                                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-955"
                                                                    >
                                                                        <option value="internal">Internal Route (NextJS)</option>
                                                                        <option value="external">Open in New Tab (External)</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-end gap-3 pt-3">
                                                                <button
                                                                    onClick={() => setShowAddLinkForm(prev => ({ ...prev, [sIndex]: false }))}
                                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAddLink(sIndex)}
                                                                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                                                                >
                                                                    Save Link
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {customSections.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/30">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                                            <FolderPlus className="w-8 h-8" />
                                        </div>
                                        <p className="text-lg font-bold text-slate-400">Empty Navigation Canvas</p>
                                        <p className="text-sm text-slate-400 mt-1">Create your first custom category to start mapping links</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom confirmation dialog before delete */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {deleteTarget.type === "category" ? "Delete Category" : "Remove Link"}
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            {deleteTarget.type === "category"
                                ? `Are you sure you want to delete the category "${customSections[deleteTarget.categoryIndex].title}"? This will permanently remove all links inside it.`
                                : `Are you sure you want to remove this link from the category?`}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-200 cursor-pointer"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
