"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { ArrowRight, CheckCircle2, Cloud, FileText, Loader2, Shield } from "lucide-react";

interface MicrosoftService {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    primary_color: string;
}

interface MockFile {
    id: string;
    name: string;
    type: 'folder' | 'file';
    date: string;
}

export default function MicrosoftHubPage() {
    const router = useRouter();
    const [connectedServices, setConnectedServices] = useState<Record<string, boolean>>({});
    const [syncingServices, setSyncingServices] = useState<Record<string, boolean>>({});
    const [selectedServiceForFileSelection, setSelectedServiceForFileSelection] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({}); // serviceId -> filename

    const services: MicrosoftService[] = [
        {
            id: "sharepoint",
            name: "SharePoint",
            description: "Connect your team sites and document libraries.",
            logo_url: "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/sharepoint_48x1.svg",
            primary_color: "#036C70",
        },
        {
            id: "onedrive",
            name: "OneDrive",
            description: "Access personal and shared files from OneDrive for Business.",
            logo_url: "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/onedrive_48x1.svg",
            primary_color: "#0078D4",
        },
        {
            id: "outlook",
            name: "Outlook",
            description: "Sync emails and calendar events for total context.",
            logo_url: "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/outlook_48x1.svg",
            primary_color: "#0078D4",
        }
    ];

    const mockFiles: MockFile[] = [
        { id: "1", name: "HR Policies & Procedures 2025", type: 'folder', date: "Feb 10, 2025" },
        { id: "2", name: "Financial Reports Q4 2024", type: 'folder', date: "Jan 15, 2025" },
        { id: "3", name: "Engineering Specs - Pump Station A", type: 'folder', date: "Mar 01, 2025" },
        { id: "4", name: "Board Meeting Minutes - Feb", type: 'file', date: "Feb 20, 2025" },
    ];

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
        }
    }, [router]);

    const handleConnect = (serviceId: string) => {
        setSyncingServices(prev => ({ ...prev, [serviceId]: true }));
        // Simulate connecting delay
        setTimeout(() => {
            setSyncingServices(prev => ({ ...prev, [serviceId]: false }));

            if (serviceId === "outlook") {
                setConnectedServices(prev => ({ ...prev, [serviceId]: true }));
            } else {
                setSelectedServiceForFileSelection(serviceId);
            }
        }, 1500);
    };

    const handleSelectFile = (file: MockFile) => {
        if (!selectedServiceForFileSelection) return;

        const serviceId = selectedServiceForFileSelection;
        setSelectedFiles(prev => ({ ...prev, [serviceId]: file.name }));
        setConnectedServices(prev => ({ ...prev, [serviceId]: true }));
        setSelectedServiceForFileSelection(null);
    };

    return (
        <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden text-slate-900">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase font-display">Microsoft Integration Hub</h1>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium font-sans">Unify your Microsoft 365 ecosystem with the Internal AI Assistant.</p>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100 shadow-sm animate-pulse uppercase tracking-wider">
                                <Cloud className="w-3.5 h-3.5 mr-1" />
                                <span className="hidden sm:inline">Enterprise Connect Ready</span>
                            </div>
                        </div>

                        {/* File Selection Modal / Overlay Area (Simulation) */}
                        {selectedServiceForFileSelection && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 max-w-2xl w-full flex flex-col max-h-[80vh] overflow-hidden">
                                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/[0.15]">
                                        <h3 className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider text-slate-800">
                                            Select Folder to Sync
                                            <span className="text-[10px] font-semibold text-slate-400 normal-case">from {services.find(s => s.id === selectedServiceForFileSelection)?.name}</span>
                                        </h3>
                                        <button
                                            onClick={() => setSelectedServiceForFileSelection(null)}
                                            className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <div className="p-2 overflow-y-auto custom-scrollbar">
                                        {mockFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                onClick={() => handleSelectFile(file)}
                                                className="flex items-center p-3 hover:bg-indigo-50/50 rounded-xl cursor-pointer transition-colors group"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${file.type === 'folder' ? 'bg-amber-50 border border-amber-100 text-amber-600' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
                                                    {file.type === 'folder' ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                                    ) : (
                                                        <FileText className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{file.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium">{file.date}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 font-medium text-center">
                                        Select a folder to enable Copilot access to its contents.
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group relative overflow-hidden flex flex-col"
                                >
                                    {/* Decoration */}
                                    <div
                                        className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.08] group-hover:opacity-15 transition-opacity duration-500"
                                        style={{ backgroundColor: service.primary_color }}
                                    ></div>

                                    <div className="relative z-10 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center p-2.5 transition-all duration-350 group-hover:scale-105 shadow-sm border bg-white"
                                                style={{
                                                    borderColor: `${service.primary_color}20`
                                                }}
                                            >
                                                <img src={service.logo_url} alt={service.name} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                            {connectedServices[service.id] && (
                                                <div className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 border border-emerald-100">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Synced
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-slate-800 mb-2 tracking-tight">{service.name}</h3>
                                        <p className="text-slate-500 text-xs leading-relaxed mb-6 group-hover:text-slate-600 transition-colors">{service.description}</p>

                                        {connectedServices[service.id] && selectedFiles[service.id] && (
                                            <div className="mb-6 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                                <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">Active Sync</p>
                                                <p className="text-xs font-semibold text-slate-700 truncate">{selectedFiles[service.id]}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 relative z-10">
                                        {connectedServices[service.id] ? (
                                            <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                Connected
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleConnect(service.id)}
                                                disabled={syncingServices[service.id]}
                                                className="btn-primary w-full py-2 disabled:opacity-75"
                                            >
                                                {syncingServices[service.id] ? (
                                                    <>
                                                        <Loader2 className="mr-1.5 w-3.5 h-3.5 animate-spin" />
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        Connect {service.name}
                                                        <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Security Footer */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.02] rounded-full -mr-48 -mt-48 blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-1 text-left">
                                    <h4 className="text-sm font-bold flex items-center text-slate-800 uppercase tracking-wider">
                                        <Shield className="mr-2 w-4 h-4 text-indigo-500" />
                                        Enterprise Grade Security
                                    </h4>
                                    <p className="text-slate-500 max-w-xl text-[11px] leading-relaxed">
                                        Leucadia integrates directly with Microsoft Graph API using OAuth 2.0. We respect your existing Microsoft 365 permissions and access controls automatically.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Powered By</p>
                                        <p className="text-xs font-bold text-slate-700">Microsoft Graph</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm">
                                        <Cloud className="w-4 h-4 text-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
