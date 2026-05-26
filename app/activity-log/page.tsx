"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { History, Search, Filter, User, Info, ArrowLeft } from "lucide-react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";

interface ActivityLog {
    id: number;
    user_email: string;
    action: string;
    details: Record<string, unknown> | null;
    timestamp: string;
}

export default function ActivityLogPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAction, setFilterAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        const userStr = localStorage.getItem("admin_user");
        if (!userStr) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (!user.is_superuser) {
                router.push("/");
                return;
            }
        } catch {
            router.push("/login");
            return;
        }

        loadLogs();
    }, [router]);

    const loadLogs = async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch(apiUrl("api/admin/activity-logs"), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load activity logs");
            }

            const data = await response.json();
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === "all" || log.action === filterAction;
        const notSystemInit = log.action !== "SYSTEM_INIT";
        return matchesSearch && matchesAction && notSystemInit;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterAction]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

    const getActionColor = (action: string) => {
        switch (action) {
            case "LOGIN": return "text-indigo-700 bg-indigo-50 border-indigo-100";
            case "CREATE_ADMIN": return "text-emerald-700 bg-emerald-50 border-emerald-100";
            case "DELETE_ADMIN": return "text-rose-700 bg-rose-50 border-rose-100";
            case "UPDATE_PERMISSIONS": return "text-amber-700 bg-amber-50 border-amber-100";
            case "RESET_PASSWORD": return "text-purple-700 bg-purple-50 border-purple-100";
            case "UPLOAD_DOCUMENT": return "text-sky-700 bg-sky-50 border-sky-100";
            case "DELETE_DOCUMENT": return "text-rose-700 bg-rose-50 border-rose-100";
            case "SCRAPE_URL": return "text-emerald-700 bg-emerald-50 border-emerald-100";
            case "DELETE_CONVERSATION": return "text-orange-700 bg-orange-50 border-orange-100";
            case "RESTORE_CONVERSATION": return "text-cyan-700 bg-cyan-50 border-cyan-100";
            case "PERMANENT_DELETE_CONVERSATION": return "text-rose-700 bg-rose-50 border-rose-150";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    const formatDetails = (details: Record<string, unknown> | null) => {
        if (!details) return "-";
        return Object.entries(details).map(([key, value]) => (
            <div key={key} className="text-[11px] leading-relaxed">
                <span className="font-bold text-slate-500 uppercase mr-1.5">{key.replace(/_/g, ' ')}:</span>
                <span className="text-slate-700 font-mono">{value && typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#fafafa]">
                <CLSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">Reading security logs...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden">
            <CLSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <CLHeader />
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-slate-600" />
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase font-display">Activity logs</h1>
                                <p className="text-xs text-slate-500 mt-0.5">Audit trail of all administrative actions in the system</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl">
                                <p className="text-xs font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Filters Panel */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user or action..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input w-full pl-11 pr-4 py-2.5 text-xs font-semibold"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Operations</option>
                                    <option value="LOGIN">Login</option>
                                    <option value="CREATE_ADMIN">Create Admin</option>
                                    <option value="DELETE_ADMIN">Delete Admin</option>
                                    <option value="UPDATE_PERMISSIONS">Update Permissions</option>
                                    <option value="RESET_PASSWORD">Reset Password</option>
                                    <option value="UPLOAD_DOCUMENT">Upload Document</option>
                                    <option value="DELETE_DOCUMENT">Delete Document</option>
                                    <option value="SCRAPE_URL">Scrape URL</option>
                                    <option value="DELETE_CONVERSATION">Delete Conversation</option>
                                    <option value="RESTORE_CONVERSATION">Restore Conversation</option>
                                    <option value="PERMANENT_DELETE_CONVERSATION">Permanent Delete</option>
                                </select>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200/80">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-505">Operator node</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-505">Operation action</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-505">Details mapping</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-505">Timestamp logs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                                                    <Info className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                                    <p>No audit trail logs match query inputs.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700">{log.user_email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            {formatDetails(log.details)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {filteredLogs.length > ITEMS_PER_PAGE && (
                                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                                    <div className="text-[11px] text-slate-550 font-semibold uppercase tracking-wider">
                                        Showing <span className="text-slate-800 font-semibold font-mono">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 font-semibold font-mono">{Math.min(indexOfLastItem, filteredLogs.length)}</span> of <span className="text-slate-800 font-semibold font-mono">{filteredLogs.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Previous
                                        </button>

                                        <div className="flex gap-1.5">
                                            {(() => {
                                                const maxButtons = 5;
                                                let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                                                const end = Math.min(totalPages, start + maxButtons - 1);

                                                if (end - start + 1 < maxButtons) {
                                                    start = Math.max(1, end - maxButtons + 1);
                                                }

                                                return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                                            })().map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page
                                                        ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-955"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
