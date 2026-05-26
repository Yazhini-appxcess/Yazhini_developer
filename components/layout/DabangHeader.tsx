"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminUser, getAdminUser, removeAuthToken } from "@/lib/auth";
import { useTheme } from "@/context/ThemeContext";
import { 
  Search, 
  Bell, 
  ArrowLeft, 
  Sparkles, 
  User, 
  LogOut, 
  Activity, 
  Cpu, 
  Command, 
  X,
  FileText,
  Settings,
  Users,
  Terminal,
  Zap,
  Globe
} from "lucide-react";

export default function CLHeader() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { settings } = useTheme();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Command palette state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getAdminUser();
    if (user) {
      setTimeout(() => setAdminUser(user), 0);
    }

    // Keyboard shortcut for command palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const getPageTitle = () => {
    switch (pathname) {
      case "/": return "Dashboard Portal";
      case "/ai": return "Upload Hub";
      case "/bot": return `${settings?.company_name || "Atlas"} Copilot`;
      case "/documents": return "Document Library";
      case "/messages": return "Conversations";
      case "/sage-300": return "Sage Connect";
      case "/procore": return "Procore Sync";
      case "/database-hub": return "Database Hub";
      case "/database": return "Database Integration";
      case "/erp": return "ERP Hub";
      case "/crm": return "CRM Hub";
      case "/mes": return "MES Hub";
      case "/admin-management": return "Admin Management";
      case "/activity-log": return "Activity Logs";
      case "/website": return "Main Website";
      default: return pathname?.startsWith('/mes') ? "MES Connect" : "Dashboard";
    }
  };

  const getSubTitle = () => {
    switch (pathname) {
      case "/ai": return "Ingest knowledge bases and files";
      case "/bot": return `Interact with your ${settings?.company_name || "Atlas"} assistant`;
      case "/documents": return "Grounding knowledge database files";
      case "/sage-300": return "Enterprise ERP configuration and link";
      case "/procore": return "Project management file grounding";
      case "/database-hub": return "Connect structured knowledge sources";
      case "/database": return "Connect structured data sources";
      case "/erp": return "Enterprise environment integrations";
      case "/crm": return "Customer relationship management settings";
      case "/mes": return "Power shop-floor execution integrations";
      case "/admin-management": return "System access credentials and RBAC";
      case "/activity-log": return "Track system events and admin operations";
      default: return "Futuristic Enterprise AI SaaS Console";
    }
  };

  const initials = adminUser?.first_name
    ? `${adminUser.first_name.charAt(0)}${adminUser.last_name?.charAt(0) || ""}`.toUpperCase()
    : "A";

  const commandShortcuts = [
    { name: "Go to Dashboard", shortcut: "⌘D", action: () => router.push("/"), icon: <Activity className="w-4 h-4" /> },
    { name: "Upload Documents", shortcut: "⌘U", action: () => router.push("/ai"), icon: <FileText className="w-4 h-4" /> },
    { name: "Open Doc Library", shortcut: "⌘L", action: () => router.push("/documents"), icon: <Settings className="w-4 h-4" /> },
    { name: "User Management", shortcut: "⌘M", action: () => router.push("/admin-management"), icon: <Users className="w-4 h-4" /> },
  ];

  const notifications = [
    { id: 1, title: "System Node Synced", desc: "Database vector indices rebuilt.", time: "2 min ago", type: "success" },
    { id: 2, title: "Document Processed", desc: "Financial_Report_Q1.pdf is now live.", time: "10 min ago", type: "info" },
    { id: 3, title: "AI Query Threshold", desc: "98.4% accuracy maintained.", time: "1 hour ago", type: "warning" },
  ];

  return (
    <>
      <header className="glass-header h-16 flex items-center justify-between px-6 mx-4 mt-4 rounded-[20px] sticky top-4 z-30 border border-white/60 shadow-lg bg-white/70 backdrop-blur-xl">
        {/* Left: Back Arrow + Page Header */}
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-[13px] font-extrabold text-slate-800 leading-tight tracking-wider uppercase font-display">
              {getPageTitle()}
            </h2>
            <p className="text-[9.5px] text-slate-500 font-medium tracking-tight mt-0.5">{getSubTitle()}</p>
          </div>
        </div>

        {/* Right: Search command, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* AI-powered search command button */}
          <div className="relative">
            <motion.button
              onClick={() => setShowCommandPalette(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 w-52 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl text-slate-500 hover:text-slate-800 transition-all text-left text-xs font-medium cursor-pointer shadow-sm relative overflow-hidden accent-glow"
            >
              <Search className="w-3.5 h-3.5 icon-accent" />
              <span>Search commands...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-[9px] font-semibold bg-white rounded border border-slate-200/80 font-mono text-slate-400 shadow-sm">
                ⌘K
              </kbd>
            </motion.button>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-800 transition-all cursor-pointer relative shadow-sm accent-glow"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            </motion.button>

            {/* Notifications Menu */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="absolute right-0 mt-3 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-4 w-80 border border-slate-200/80 shadow-2xl text-slate-800"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Live System Logs</h4>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-lg font-bold">3 Active</span>
                    </div>
                    <div className="space-y-2.5">
                      {notifications.map(n => (
                        <div key={n.id} className="text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              n.type === "success" ? "bg-emerald-500" : n.type === "info" ? "bg-indigo-500" : "bg-amber-500"
                            }`} />
                            <p className="text-[11px] font-bold text-slate-800">{n.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                          <span className="text-[8px] text-slate-400 block font-mono mt-1">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          {/* User Profile Area */}
          <div className="flex items-center gap-3 relative">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-extrabold text-slate-800 tracking-tight leading-tight">
                {adminUser?.is_superuser ? "Super Core Admin" : (adminUser?.first_name || "Admin")}
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-mono font-medium tracking-tighter">{adminUser?.email || "offline"}</span>
              </div>
            </div>

            {/* Avatar button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative group flex-shrink-0 cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center text-[12px] font-black border border-slate-200/80 shadow-sm bg-slate-50"
                style={{
                  background: "rgba(var(--primary-rgb), 0.12)",
                  color: "rgb(var(--primary-rgb))",
                }}
              >
                {initials}
              </motion.div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </button>

            {/* Profile Dropdown Modal */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="absolute right-0 top-12 z-50 bg-white/95 backdrop-blur-md rounded-2xl p-4.5 w-64 border border-slate-200/80 shadow-2xl text-slate-800"
                  >
                    <div className="px-1 py-1 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 icon-ai" />
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Enterprise Member</span>
                      </div>
                      <p className="text-[13px] font-bold text-slate-800 truncate mt-1">
                        {adminUser?.first_name
                          ? `${adminUser.first_name} ${adminUser.last_name || ""}`.trim()
                          : "Admin"}
                      </p>
                      <p className="text-[9.5px] text-slate-500 truncate mt-0.5 font-mono">{adminUser?.email}</p>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    {/* Diagnostics Metrics */}
                    <div className="bg-slate-50/60 border border-slate-200/60 rounded-xl p-3 space-y-2 mb-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-slate-400" /> Core Latency</span>
                        <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" /> 12ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> API Gateway</span>
                        <span className="font-mono text-slate-700 font-bold">Online</span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* AI command palette / universal search modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              ref={commandPaletteRef}
              className="bg-white border border-slate-200/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              {/* Header Input */}
              <div className="flex items-center px-4 py-3 border-b border-slate-100 relative bg-slate-50/50">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 animate-pulse" />
                <input
                  type="text"
                  placeholder="Type a page command or search queries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-slate-800 placeholder-slate-400 w-full outline-none font-medium"
                  autoFocus
                />
                <button
                  onClick={() => setShowCommandPalette(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Suggestions */}
              <div className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                <p className="px-3 py-1.5 text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">Core Page Operations</p>
                <div className="space-y-0.5 mt-1">
                  {commandShortcuts
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.action();
                          setShowCommandPalette(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
                          <span className="text-slate-400">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                        <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 rounded border border-slate-200 font-mono text-slate-500 shadow-sm">
                          {item.shortcut}
                        </kbd>
                      </button>
                    ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Command className="w-3.5 h-3.5" /> Navigation Command Console</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
