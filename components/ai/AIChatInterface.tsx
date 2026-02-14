"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Home, MessageSquare, Clock, Zap, Bot, ArrowLeft, XCircle, ChevronLeft, User } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isHtml?: boolean;
}

interface Conversation {
  id: string;
  session_id: string;
  ended: boolean;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// Format markdown text to HTML logic (kept from original or adapted)
function formatMessage(text: string): string {
  if (!text) return '';

  // Escape HTML first to prevent XSS (basic)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle newlines
  const lines = html.split('\n');
  let formattedLines: string[] = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for bullet points
    if (line.match(/^[•\-\*]\s/)) {
      if (!inList || listType !== 'ul') {
        if (inList && listType === 'ol') formattedLines.push('</ol>');
        formattedLines.push('<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">');
        inList = true;
        listType = 'ul';
      }
      formattedLines.push(`<li style="margin: 4px 0;">${line.replace(/^[•\-\*]\s*/, '')}</li>`);
    }
    // Check for numbered lists
    else if (line.match(/^\d+[\.\)]\s/)) {
      if (!inList || listType !== 'ol') {
        if (inList && listType === 'ul') formattedLines.push('</ul>');
        formattedLines.push('<ol style="margin: 8px 0; padding-left: 20px;">');
        inList = true;
        listType = 'ol';
      }
      formattedLines.push(`<li style="margin: 4px 0;">${line.replace(/^\d+[\.\)]\s*/, '')}</li>`);
    }
    else {
      if (inList) {
        formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = '';
      }
      if (line) formattedLines.push(`<p style="margin: 8px 0;">${line}</p>`);
      else formattedLines.push('<br>');
    }
  }

  if (inList) formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');

  return formattedLines.join('');
}

interface AIChatInterfaceProps {
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  initialView?: "home" | "conversations" | "chat";
  agentType?: "internal" | "external";
}

export default function AIChatInterface({
  onClose,
  className,
  style,
  initialView = "home",
  agentType = "internal"
}: AIChatInterfaceProps) {
  const [view, setView] = useState<"home" | "conversations" | "chat">(initialView);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Summarize document",
    "Check sync status",
    "Export monthly report",
    "View user logs"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If starting in chat view, ensure we check for ongoing first or just start fresh if preferred
    // For now, if initialView is chat, we might want to trigger startNewConversation equivalent if no history
    if (initialView === "chat" && !conversationStarted && messages.length === 0) {
      // Optional: Auto-start conversation logic could go here
      // But usually the user types first or we show welcome. 
      // If we want welcome message immediately:
      startNewConversation();
    }
  }, [initialView]);

  useEffect(() => {
    // Initialize session ID
    let sid = localStorage.getItem('cl_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substr(2, 16);
      localStorage.setItem('cl_session_id', sid);
    }
    setSessionId(sid);
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.bot.suggestions}?agent_type=${agentType}`);
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Failed to load suggestions", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === "chat") {
      scrollToBottom();
    }
  }, [messages, view, loading]);

  const loadConversations = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.conversations.listUser(sessionId)}&agent_type=${agentType}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  useEffect(() => {
    if (view === "conversations") {
      loadConversations();
    }
  }, [view, sessionId]);

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setConversationStarted(false);
    setShowThankYou(false);
    setView("chat");
    // Show welcome message
    setTimeout(() => {
      const welcomeMsg: Message = {
        role: 'assistant',
        content: "Hello there! 👋 How can I assist you today?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
    }, 100);
  };

  const checkAndLoadOngoingConversation = async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(API_ENDPOINTS.conversations.listUser(sessionId));
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        const ongoing = data.conversations.find((c: Conversation) => !c.ended);
        if (ongoing) {
          setCurrentConversationId(ongoing.id);
          setMessages(ongoing.messages);
          setConversationStarted(true);
          setView("chat");
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleChatWithUs = async () => {
    const hasOngoing = await checkAndLoadOngoingConversation();
    if (!hasOngoing) {
      startNewConversation();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Use timeout to ensure state is updated before sending
    setTimeout(() => {
      const btn = document.getElementById('chat-send-button');
      btn?.click();
    }, 0);
  };

  const sendMessage = async (overrideQuery?: string) => {
    const messageText = overrideQuery || query.trim();
    if (!messageText) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideQuery) setQuery("");
    setLoading(true);
    setConversationStarted(true);

    try {
      const res = await fetch(API_ENDPOINTS.bot.chat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          website_url: typeof window !== 'undefined' ? window.location.href : '',
          user_agent: navigator.userAgent,
          agent_type: agentType
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, there was an error. Please try again."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const endChat = async () => {
    if (confirm('Are you sure you want to end this chat?')) {
      try {
        await fetch(`${API_ENDPOINTS.conversations.end}?session_id=${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages })
        });
        setShowThankYou(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper to render conversation list item
  const renderConversationItem = (conv: Conversation) => {
    const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
    let preview = "No messages yet";
    if (lastMsg) {
      const div = document.createElement('div');
      div.innerHTML = lastMsg.content; // rough text extraction
      preview = (div.textContent || div.innerText || "").substring(0, 60) + "...";
    }

    return (
      <div
        key={conv.id}
        onClick={() => {
          setCurrentConversationId(conv.id);
          setMessages(conv.messages);
          setConversationStarted(!conv.ended);
          setView("chat");
        }}
        className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-[#01284e] transition-all"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#212529] mb-1">{conv.ended ? 'Ended' : 'Ongoing'}</p>
            <p className="text-[11px] text-[#6c757d] mb-1">{new Date(conv.created_at).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })}</p>
            <p className="text-xs text-[#495057] truncate">{preview}</p>
          </div>
          <span className={`w-2 h-2 rounded-full mt-1 ${conv.ended ? 'bg-gray-400' : 'bg-[#81c341]'}`}></span>
        </div>
      </div>
    );
  };

  // --- Views ---

  // Header is common
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-[#01284e] to-[#81c341] text-white px-4 py-3 rounded-t-2xl flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {view === "chat" && (
          <button onClick={() => setView("home")} className="p-1 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center overflow-hidden">
          <img
            src="/LWWD_Logo.jpg"
            alt="LEUCADIA"
            className="w-7 h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">LEUCADIA Assistant</h3>
          <p className="text-[11px] opacity-95 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-[#81c341] rounded-full inline-block shadow-[0_0_3px_rgba(129,195,65,0.6)]"></span>
            We are online!
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {view === "chat" && conversationStarted && !showThankYou && (
          <button onClick={endChat} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors" title="End Chat">
            <XCircle className="w-4 h-4" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-white text-2xl leading-none hover:opacity-80 p-1"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-xl h-full flex flex-col overflow-hidden relative ${className || ''}`}
      style={style || { width: '450px', height: '600px' }}
    >

      {/* {renderHeader()} */}

      {/* Thank You Overlay */}
      {showThankYou && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 text-[#81c341]">
            <MessageSquare className="w-16 h-16 mx-auto" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-[#212529] mb-3">Thank You!</h3>
          <p className="text-sm text-[#6c757d] leading-relaxed mb-6">
            We appreciate your time. If you have any more questions, feel free to start a new conversation.
          </p>
          <button
            onClick={startNewConversation}
            className="bg-gradient-to-r from-[#01284e] to-[#81c341] text-white border-none py-3 px-6 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all w-full max-w-[280px]"
          >
            Start a New Conversation
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#f8f9fa] flex flex-col relative">

        {/* Home View */}
        {view === "home" && !showThankYou && (
          <div className="flex-1 flex flex-col p-4 items-center overflow-y-auto">
            <div className="text-center py-6 w-full">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#01284e] to-[#81c341] flex items-center justify-center text-2xl shadow-md">🤖</div>
              <h3 className="text-base font-bold text-[#212529] mb-1">Welcome to Leucadia Assistant</h3>
              <p className="text-xs text-[#6c757d]">Your AI-powered assistant is here to help</p>
            </div>

            <div className="w-full space-y-2.5 mb-6">
              {[
                { icon: Clock, title: "24/7 Support", sub: "Available round the clock" },
                { icon: Zap, title: "Instant Responses", sub: "Get answers in seconds" },
                { icon: Bot, title: "Smart AI Assistant", sub: "Intelligent and helpful responses" }
              ].map((Item, i) => (
                <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#01284e] to-[#81c341] flex items-center justify-center flex-shrink-0">
                    <Item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#212529]">{Item.title}</h4>
                    <p className="text-[10px] text-[#6c757d]">{Item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleChatWithUs}
              className="mt-auto w-full py-3 bg-gradient-to-r from-[#01284e] to-[#81c341] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with us
            </button>
          </div>
        )}

        {/* Conversations View */}
        {view === "conversations" && !showThankYou && (
          <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-hidden">
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {conversations.length > 0 ? (
                conversations.map(renderConversationItem)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#6c757d] p-8 text-center">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs mt-1 opacity-70">Start chatting to see your conversations here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat View */}
        {view === "chat" && !showThankYou && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={conversationViewRef}>
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {/* Assistant Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-[#01284e] flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-[#01284e] text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                        }`}>
                        <div dangerouslySetInnerHTML={{ __html: msg.isHtml ? msg.content : formatMessage(msg.content) }} />
                      </div>
                      {/* Timestamp */}
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* User Avatar */}
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-[#01284e] flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#e9ecef] rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area (Only if ongoing) */}
            {(!currentConversationId || conversationStarted) && (
              <div className="p-3 pt-2">
                {/* Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-200 bg-white text-[13px] text-gray-700 hover:border-[#01284e] hover:text-[#01284e] hover:bg-blue-50/50 transition-all shadow-sm flex-shrink-0 cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-full border border-gray-200 flex items-center px-1 py-2 pl-4 shadow-lg shadow-gray-200/50">
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#212529]"
                    placeholder="Enter your message..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={loading}
                  />
                  <button
                    id="chat-send-button"
                    onClick={() => sendMessage()}
                    disabled={loading || !query.trim()}
                    className="w-9 h-9 rounded-full bg-[#01284e] flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </div>
            )}
            {currentConversationId && !conversationStarted && (
              <div className="bg-[#fee2e2] p-3 text-center text-xs text-[#991b1b] font-medium border-t border-[#fecaca]">
                This conversation has ended.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Tabs */}
      {!showThankYou && view !== 'chat' && (
        <div className="bg-white border-t border-gray-200 flex">
          <button
            onClick={() => setView("home")}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'home' ? 'text-[#81c341]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Home</span>
            {view === 'home' && <div className="w-full h-0.5 bg-[#81c341] absolute bottom-0 max-w-[50%] rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setView("conversations")}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'conversations' ? 'text-[#81c341]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquare className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Conversations</span>
            {view === 'conversations' && <div className="w-full h-0.5 bg-[#81c341] absolute bottom-0 max-w-[50%] rounded-t-full"></div>}
          </button>
        </div>
      )}
    </div>
  );
}
