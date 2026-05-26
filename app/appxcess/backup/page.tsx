"use client";

import React, { useState, useEffect } from "react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { MessageSquare, RotateCcw, Search, Calendar, User, Mail, Phone, Trash2, ArrowLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import Link from "next/link";

interface Message {
    role: string;
    content: string;
    timestamp: string;
}

interface Conversation {
    id: string;
    session_id: string;
    agent_type?: string;
    website_url: string | null;
    messages: Message[];
    created_at: string;
    updated_at: string;
    user_name?: string | null;
    user_email?: string | null;
    user_phone?: string | null;
}

export default function BackupPage() {
    const [backups, setBackups] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [restoring, setRestoring] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.conversations.backupList, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("You don't have permission to access backups");
                }
                throw new Error("Failed to load backups");
            }
            const data = await response.json();
            setBackups(data.conversations || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load backups");
        } finally {
            setLoading(false);
        }
    };

    const restoreConversation = async (id: string) => {
        if (!confirm("Are you sure you want to restore this conversation?")) return;

        try {
            setRestoring(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.conversations.restore(id), {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("You don't have permission to restore conversations");
                }
                throw new Error("Failed to restore conversation");
            }
            setBackups(backups.filter((c) => c.id !== id));
            if (selectedConversation?.id === id) {
                setSelectedConversation(null);
            }
            alert("Conversation restored successfully");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to restore conversation");
        } finally {
            setRestoring(false);
        }
    };

    const deletePermanently = async (id: string) => {
        if (!confirm("CRITICAL WARNING: This will permanently delete this conversation from the database. This action CANNOT be undone. Are you sure?")) return;

        try {
            setDeleting(true);
            const token = getAuthToken();
            const response = await fetch(API_ENDPOINTS.conversations.permanentDelete(id), {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("You don't have permission to permanently delete conversations");
                }
                throw new Error("Failed to permanently delete conversation");
            }
            setBackups(backups.filter((c) => c.id !== id));
            if (selectedConversation?.id === id) {
                setSelectedConversation(null);
            }
            alert("Conversation permanently deleted");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to permanently delete conversation");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredBackups = backups.filter(conv =>
        !searchQuery ||
        conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <CLSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <CLHeader />

                <div className="flex-1 overflow-hidden flex">
                    {/* Backups List */}
                    <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5 text-primary" />
                                    Conversation Backup
                                </h2>
                                <Link
                                    href="/messages"
                                    className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to List
                                </Link>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search backups..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-text"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider font-bold">
                                {filteredBackups.length} deleted conversations found
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : filteredBackups.length === 0 ? (
                                <div className="p-12 text-center">
                                    <RotateCcw className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">No backups found</p>
                                </div>
                            ) : (
                                filteredBackups.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${selectedConversation?.id === conv.id
                                            ? "bg-primary/5 border-l-4 border-l-primary"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-bold text-gray-900 truncate flex-1">
                                                {conv.user_name || conv.user_email || `ID: ${conv.session_id.substring(0, 8)}`}
                                            </p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${conv.agent_type === 'internal' ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                                                {conv.agent_type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            Deleted on {formatDate(conv.updated_at)}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    restoreConversation(conv.id);
                                                }}
                                                disabled={restoring || deleting}
                                                className="py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Restore
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePermanently(conv.id);
                                                }}
                                                disabled={restoring || deleting}
                                                className="py-1.5 bg-white text-red-600 border border-red-100 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preview Detail */}
                    <div className="flex-1 bg-gray-50 flex flex-col">
                        {selectedConversation ? (
                            <>
                                <div className="p-6 bg-white border-b border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {selectedConversation.user_name || "Anonymous User"}
                                    </h3>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        {selectedConversation.user_email && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {selectedConversation.user_email}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Started {formatDate(selectedConversation.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                    {selectedConversation.messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-2xl p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-800 border border-gray-100'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a backup to preview and restore</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
