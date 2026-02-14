"use client";

import React, { useState, useEffect } from "react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { MessageSquare, Trash2, ExternalLink, Calendar, User, Mail, Phone, Search, X } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

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
          <span className="font-bold mt-0.5 text-primary-600">•</span>
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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.conversations.delete(id), {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      setConversations(conversations.filter((c) => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete conversation");
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

    // Convert to California timezone for display
    return date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
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

    // Convert to California timezone for display
    return date.toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <CLSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <CLHeader />

        {/* Messages Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversations
              </h2>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${activeTab === "all" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "external" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  External
                </button>
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "internal" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Copilot
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-text"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {conversations.filter(conv =>
                  !searchQuery ||
                  conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} conversations
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading conversations...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : conversations.filter(conv =>
                !searchQuery ||
                conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
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
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedConversation?.id === conv.id
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conv.user_name
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-200 text-gray-600"
                              }`}>
                              {conv.user_name ? (
                                <span className="text-sm font-semibold">
                                  {conv.user_name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {conv.user_name || `Session: ${conv.session_id.substring(0, 12)}...`}
                              </p>
                              {conv.user_email && (
                                <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {conv.user_email}
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
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Agent Type Badge */}
                      <div className="flex gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${conv.agent_type === 'internal'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {conv.agent_type === 'internal' ? 'Copilot' : 'External'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conv.updated_at)}
                        </div>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                          {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedConversation.user_name
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-200 text-gray-600"
                        }`}>
                        {selectedConversation.user_name ? (
                          <span className="text-lg font-semibold">
                            {selectedConversation.user_name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {selectedConversation.user_name || "Conversation Details"}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {selectedConversation.user_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{selectedConversation.user_email}</span>
                            </div>
                          )}
                          {selectedConversation.user_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedConversation.user_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Started: {formatDate(selectedConversation.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "user"
                          ? "bg-[#01284e] text-white rounded-tr-none"
                          : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                          }`}
                      >
                        <div className={`text-sm leading-relaxed ${msg.role === "user" ? "text-white" : "text-gray-800"
                          }`}>
                          {msg.role === "assistant" ? parseMessageContent(msg.content) : msg.content}
                        </div>
                        <p className={`text-xs mt-2 ${msg.role === "user" ? "text-white/70" : "text-gray-500"
                          }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-[#01284e] flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Select a conversation to view messages</p>
                  <p className="text-sm text-gray-400 mt-1">Choose a conversation from the list to start reading</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

