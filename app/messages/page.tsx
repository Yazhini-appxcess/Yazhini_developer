"use client";

import React, { useState, useEffect } from "react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { MessageSquare, Trash2, ExternalLink, Calendar, User, Mail, Phone, Search, X } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken, authFetch } from "@/lib/auth";

// Function to parse markdown-like formatting
const parseMessageContent = (content: string) => {
  // Helper function to parse inline formatting (bold, etc.)
  const parseInlineFormatting = (text: string): (string | React.ReactElement)[] => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let keyCounter = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Split by lines to handle different formatting
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Skip markdown headings (###, ##, #)
    if (trimmedLine.startsWith('###') || trimmedLine.startsWith('##') || trimmedLine.startsWith('#')) {
      return; // Skip this line
    }

    // Handle bullet points with •
    if (trimmedLine.startsWith('•')) {
      const bulletContent = trimmedLine.substring(1).trim();
      const formattedContent = parseInlineFormatting(bulletContent);
      elements.push(
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1">
          <span className="font-bold mt-0.5 text-primary">•</span>
          <span>{formattedContent}</span>
        </div>
      );
    }
    // Handle bullet points with -
    else if (trimmedLine.startsWith('- ') && !trimmedLine.startsWith('- **')) {
      const subContent = trimmedLine.substring(2);
      const formattedContent = parseInlineFormatting(subContent);
      elements.push(
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1 ml-4">
          <span className="mt-0.5">-</span>
          <span>{formattedContent}</span>
        </div>
      );
    }
    // Handle bold headings (lines that are entirely bold)
    else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.split('**').length === 3) {
      const headingText = trimmedLine.replace(/\*\*/g, '').trim();
      elements.push(
        <div key={`line-${lineIndex}`} className="font-semibold text-gray-900 mt-3 mb-1.5">
          {headingText}
        </div>
      );
    }
    // Empty line
    else if (trimmedLine === '') {
      elements.push(<br key={`line-${lineIndex}`} />);
    }
    // Regular paragraph with inline formatting
    else {
      const formattedContent = parseInlineFormatting(line);
      elements.push(
        <p key={`line-${lineIndex}`} className="my-1.5">
          {formattedContent}
        </p>
      );
    }
  });

  return elements;
};

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
  user_ip: string | null;
  user_agent: string | null;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadConversations(activeTab);
  }, [activeTab]);

  const loadConversations = async (type: string = "all") => {
    try {
      setLoading(true);
      let url = API_ENDPOINTS.conversations.list;
      if (type !== "all") {
        url += `?agent_type=${type}`;
      }
      const response = await authFetch(url);
      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await authFetch(API_ENDPOINTS.conversations.delete(id), {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      setConversations(conversations.filter((c) => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete conversation");
    }
  };

  const formatDate = (dateString: string) => {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    // Backend sends UTC timestamps, so we need to ensure proper parsing
    let date: Date;
    const trimmed = dateString.trim();

    // If it's already a valid ISO string with timezone, use it directly
    if (trimmed.includes('Z') || trimmed.match(/[+-]\d{2}:\d{2}$/)) {
      date = new Date(trimmed);
    } else if (trimmed.includes('T')) {
      // ISO format without timezone - assume UTC
      date = new Date(trimmed + 'Z');
    } else {
      // Fallback - try parsing as-is
      date = new Date(trimmed);
    }

    // Convert to browser local timezone for display
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    let date: Date;
    const trimmed = dateString.trim();

    // If it's already a valid ISO string with timezone, use it directly
    if (trimmed.includes('Z') || trimmed.match(/[+-]\d{2}:\d{2}$/)) {
      date = new Date(trimmed);
    } else if (trimmed.includes('T')) {
      // ISO format without timezone - assume UTC
      date = new Date(trimmed + 'Z');
    } else {
      // Fallback - try parsing as-is
      date = new Date(trimmed);
    }

    // Convert to browser local timezone for display
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden">
      {/* Left Sidebar */}
      <CLSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <CLHeader />

        {/* Messages Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Conversations List */}
          <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-indigo-650" />
                Conversations
              </h2>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 mb-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === "external"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  External
                </button>
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    activeTab === "internal"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Internal
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-10 pr-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-2.5">
                {conversations.filter(conv =>
                  !searchQuery ||
                  conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} conversations
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Loading data...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-xs font-semibold text-red-500">{error}</div>
              ) : conversations.filter(conv =>
                !searchQuery ||
                conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-500">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                conversations
                  .filter(conv =>
                    !searchQuery ||
                    conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b border-slate-100 cursor-pointer transition-all ${
                        selectedConversation?.id === conv.id
                          ? "bg-indigo-50/30 border-l-2 border-l-indigo-600"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                              conv.user_name || conv.user_email
                                ? "bg-indigo-50 text-indigo-750 border-indigo-100 font-bold"
                                : "bg-slate-100 text-slate-650 border-slate-200"
                            }`}>
                              {conv.user_name ? (
                                <span className="text-xs font-bold">
                                  {conv.user_name.charAt(0).toUpperCase()}
                                </span>
                              ) : conv.user_email ? (
                                <span className="text-xs font-bold">
                                  {conv.user_email.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {conv.user_name || conv.user_email || `Session: ${conv.session_id.substring(0, 12)}...`}
                              </p>
                              {conv.user_name && conv.user_email && (
                                <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {conv.user_email}
                                </p>
                              )}
                              {!conv.user_name && !conv.user_email && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  ID: {conv.session_id.substring(0, 12)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this conversation?")) {
                              deleteConversation(conv.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Agent Type Badge */}
                      <div className="flex gap-2 mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          conv.agent_type === 'internal'
                            ? 'bg-slate-100 text-slate-650 border border-slate-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {conv.agent_type === 'internal' ? 'Internal' : 'External'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(conv.updated_at)}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="flex-1 flex flex-col bg-slate-50/40">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        selectedConversation.user_name || selectedConversation.user_email
                          ? "bg-indigo-50 text-indigo-750 border-indigo-100 font-bold"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {selectedConversation.user_name ? (
                          <span className="text-base font-bold">
                            {selectedConversation.user_name.charAt(0).toUpperCase()}
                          </span>
                        ) : selectedConversation.user_email ? (
                          <span className="text-base font-bold">
                            {selectedConversation.user_email.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 mb-1">
                          {selectedConversation.user_name || selectedConversation.user_email || "Anonymous User"}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium">
                          {selectedConversation.user_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{selectedConversation.user_email}</span>
                            </div>
                          )}
                          {selectedConversation.user_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{selectedConversation.user_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Started: {formatDate(selectedConversation.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-indigo-700" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                          msg.role === "user"
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                        }`}
                        style={
                          msg.role === "user"
                            ? { background: "rgb(var(--primary-rgb, 79 70 229))" }
                            : undefined
                        }
                      >
                        <div className="text-sm leading-relaxed">
                          {msg.role === "assistant" ? parseMessageContent(msg.content) : msg.content}
                        </div>
                        <p className={`text-[10px] mt-2 font-mono ${
                          msg.role === "user" ? "text-white/70" : "text-slate-400"
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-slate-650" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-50/10">
                <div className="text-center max-w-sm bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-indigo-700" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Select a conversation</h3>
                  <p className="text-xs text-slate-500 leading-normal mt-1.5">Choose a conversation from the sidebar feed to load the message audit logs and session parameters.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
