"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Sparkles, 
  Settings2,
  Database,
  Layers,
  ChevronDown,
  Terminal,
  Compass,
  ArrowRightLeft
} from "lucide-react";

export default function CLSidebar() {
  const { settings } = useTheme();
  const pathname = usePathname() || "";
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  
  // Sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("Default Core");

  useEffect(() => {
    // Load collapse state from localstorage
    const collapsed = localStorage.getItem("sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);
    setMounted(true);

    const checkSuperAdmin = () => {
      const adminUser = localStorage.getItem("admin_user");
      if (adminUser) {
        try {
          const user = JSON.parse(adminUser);
          setIsSuperAdmin(!!user.is_superuser);
          setPermissions(user.permissions || []);
          setUserEmail(user.email || "");
          setUserName(user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Admin");
        } catch (e) {
          console.error("Error parsing admin user:", e);
        }
      }
    };

    checkSuperAdmin();
    window.addEventListener("storage", checkSuperAdmin);
    return () => window.removeEventListener("storage", checkSuperAdmin);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar_collapsed", String(nextState));
  };

  const mainMenuItems = [
    { name: "Dashboard", href: "/", icon: "grid_view", permission: "dashboard_access", show: settings?.show_dashboard ?? true },
    { name: `${settings?.company_name || ""} Copilot`, href: "/bot", icon: "smart_toy", permission: "copilot_access", show: settings?.show_copilot ?? true },
    { name: "Upload Hub", href: "/ai", icon: "cloud_upload", permission: "upload_hub_access", show: settings?.show_upload_hub ?? true },
    { name: "Document Library", href: "/documents", icon: "description", permission: "document_library_access", show: settings?.show_documents ?? true },
    { name: "Conversations", href: "/messages", icon: "forum", permission: "conversations_access", show: settings?.show_conversations ?? true },
    { name: "Admin Management", href: "/admin-management", icon: "manage_accounts", permission: "users_access", show: settings?.show_admin_management ?? true },
    { name: "Activity Log", href: "/activity-log", icon: "history", permission: "activity_log_access", show: settings?.show_activity_log ?? true },
    { name: "Backup", href: "/appxcess/backup", icon: "restore_from_trash", permission: "superadmin_only", show: true },
  ];

  const visibleMenuItems = mainMenuItems.filter(item => {
    if (item.permission === "superadmin_only") return isSuperAdmin;
    return (isSuperAdmin || permissions.includes(item.permission)) && item.show;
  });

  const systemItems = [
    { name: "Database Hub", href: "/database-hub", icon: "storage", show: settings?.show_database_hub ?? true },
    { name: "API", href: "/api-docs", icon: "api", show: settings?.show_api_docs ?? true },
    { name: "IoT", href: "/iot", icon: "router", show: settings?.show_iot_hub ?? true },
    { name: "Microsoft", href: "/microsoft", icon: "window", show: settings?.show_microsoft_hub ?? true },
    { name: "Usage", href: "/usage", icon: "data_usage", show: true },
  ].filter(item => item.show);

  if (isSuperAdmin && settings && !settings.sidebar_enabled) {
    return null;
  }

  const showErpHub = settings?.show_erp_hub ?? true;
  const showCrmHub = settings?.show_crm_hub ?? true;
  const showMesHub = settings?.show_mes_hub ?? true;

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Framer Motion staggered list variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
  } as const;

  if (!mounted) {
    return (
      <aside 
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
        className="w-64 h-[calc(100vh-2rem)] m-4 rounded-[24px] border flex-shrink-0 hidden lg:block shadow-xl" 
      />
    );
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 88 : 260 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      style={{
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-text)',
      }}
      className="m-4 rounded-[24px] border flex flex-col flex-shrink-0 relative overflow-hidden hidden lg:flex h-[calc(100vh-2rem)] z-40 group/sidebar shadow-2xl backdrop-blur-xl"
    >
      {/* Dynamic Ambient Backlight inside Sidebar */}
      <div 
        style={{ background: 'rgba(var(--primary-rgb), 0.08)' }}
        className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[40px] pointer-events-none -mr-16 -mt-16 transition-opacity duration-300 group-hover/sidebar:opacity-100" 
      />

      {/* Collapse Trigger Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-12 z-50 w-6.5 h-6.5 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 border dynamic-switcher-btn"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="px-4 pt-6 pb-4 flex flex-col relative z-20">
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer select-none group/logo relative">
          {settings?.logo_url ? (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-md flex-shrink-0 border relative dynamic-logo-wrapper">
              <img
                src={settings.logo_url}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-md flex-shrink-0 border relative"
              style={{
                background: "linear-gradient(135deg, var(--primary-color) 0%, rgba(var(--primary-rgb), 0.7) 100%)",
                borderColor: "var(--sidebar-border)",
                color: "#ffffff",
              }}
            >
              {(settings?.company_name || "A").charAt(0).toUpperCase()}
            </div>
          )}
          
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <h1 className="font-extrabold text-[14px] leading-tight tracking-tight truncate font-display uppercase" style={{ color: 'var(--sidebar-text)' }}>
                {settings?.company_name || "Admin Portal"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">Live Node</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Workspace Switcher Component */}
        {!isCollapsed && (
          <div className="mt-4 px-1 relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full py-2 px-3 rounded-xl border flex items-center justify-between text-left text-xs font-semibold transition-all duration-150 cursor-pointer shadow-sm dynamic-switcher-btn"
            >
              <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 flex-shrink-0 animate-pulse icon-accent" />
                <span className="truncate">{selectedWorkspace}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--sidebar-text)', opacity: 0.7 }} />
            </button>

            <AnimatePresence>
              {showWorkspaceMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 right-0 mt-1 z-50 p-1.5 rounded-xl border shadow-2xl dynamic-dropdown-menu"
                  >
                    {["Default Core", "AI Grounding Hub", "Analytics Engine"].map((ws) => (
                      <button
                        key={ws}
                        onClick={() => {
                          setSelectedWorkspace(ws);
                          setShowWorkspaceMenu(false);
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-left text-xs font-medium transition-colors ${
                          selectedWorkspace === ws
                            ? "dynamic-dropdown-item-active"
                            : "dynamic-dropdown-item"
                        }`}
                      >
                        {ws}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mx-4 h-px" style={{ background: 'var(--sidebar-border)', opacity: 0.5 }} />

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-1"
        >
          {visibleMenuItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative flex items-center justify-start py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                    isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                  } ${
                    isActive ? "dynamic-nav-item-active" : "dynamic-nav-item"
                  }`}
                >
                  {/* Sliding Gradient Beam on Active */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 z-0"
                      style={{
                        background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)'
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 28 }}
                    />
                  )}

                  {/* Clean left active line */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ background: `var(--primary-color)` }}
                    />
                  )}

                  <span
                    className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10"
                    style={{ color: isActive ? `var(--primary-color)` : 'var(--sidebar-text)' }}
                  >
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span className="truncate relative z-10 transition-colors duration-200">
                      {item.name}
                    </span>
                  )}

                  {/* Collapsed State Tooltip */}
                  {isCollapsed && hoveredItem === item.name && (
                    <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                      {item.name}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* Integrations Header */}
          {isSuperAdmin && (showErpHub || showCrmHub || showMesHub) && (
            <div className="pt-4 pb-1.5">
              {!isCollapsed ? (
                <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
                  {settings?.integration_label || "Integrations"}
                </p>
              ) : (
                <div className="w-8 h-[1px] mx-auto my-2" style={{ background: 'var(--sidebar-border)', opacity: 0.5 }} />
              )}
            </div>
          )}

          {/* Integration Links */}
          {isSuperAdmin && (
            <>
              {showErpHub && (
                <motion.div variants={itemVariants}>
                  <Link
                    href="/erp"
                    onMouseEnter={() => setHoveredItem("ERP Hub")}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                      isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                    } ${
                      pathname.startsWith("/erp") || pathname === "/sage-300" || pathname === "/procore"
                        ? "dynamic-nav-item-active"
                        : "dynamic-nav-item"
                    }`}
                  >
                    {(pathname.startsWith("/erp") || pathname === "/sage-300" || pathname === "/procore") && (
                      <>
                        <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                      </>
                    )}
                    <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: (pathname.startsWith("/erp") || pathname === "/sage-300" || pathname === "/procore") ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                      business_center
                    </span>
                    {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">ERP Hub</span>}
                    {isCollapsed && hoveredItem === "ERP Hub" && (
                      <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                        ERP Hub
                      </div>
                    )}
                  </Link>
                </motion.div>
              )}

              {showCrmHub && (
                <motion.div variants={itemVariants}>
                  <Link
                    href="/crm"
                    onMouseEnter={() => setHoveredItem("CRM Hub")}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                      isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                    } ${
                      pathname.startsWith("/crm")
                        ? "dynamic-nav-item-active"
                        : "dynamic-nav-item"
                    }`}
                  >
                    {pathname.startsWith("/crm") && (
                      <>
                        <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                      </>
                    )}
                    <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: pathname.startsWith("/crm") ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                      account_tree
                    </span>
                    {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">CRM Hub</span>}
                    {isCollapsed && hoveredItem === "CRM Hub" && (
                      <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                        CRM Hub
                      </div>
                    )}
                  </Link>
                </motion.div>
              )}

              {showMesHub && (
                <motion.div variants={itemVariants}>
                  <Link
                    href="/mes"
                    onMouseEnter={() => setHoveredItem("MES Hub")}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                      isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                    } ${
                      pathname.startsWith("/mes")
                        ? "dynamic-nav-item-active"
                        : "dynamic-nav-item"
                    }`}
                  >
                    {pathname.startsWith("/mes") && (
                      <>
                        <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                      </>
                    )}
                    <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: pathname.startsWith("/mes") ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                      precision_manufacturing
                    </span>
                    {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">MES Hub</span>}
                    {isCollapsed && hoveredItem === "MES Hub" && (
                      <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                        MES Hub
                      </div>
                    )}
                  </Link>
                </motion.div>
              )}
            </>
          )}

          {/* System Section */}
          {isSuperAdmin && systemItems.length > 0 && (
            <>
              <div className="pt-4 pb-1.5">
                {!isCollapsed ? (
                  <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>System</p>
                ) : (
                  <div className="w-8 h-[1px] mx-auto my-2" style={{ background: 'var(--sidebar-border)', opacity: 0.5 }} />
                )}
              </div>
              {systemItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div key={item.name} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                        isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                      } ${
                        isActive ? "dynamic-nav-item-active" : "dynamic-nav-item"
                      }`}
                    >
                      {isActive && (
                        <>
                          <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                        </>
                      )}
                      <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: isActive ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">{item.name}</span>}
                      {isCollapsed && hoveredItem === item.name && (
                        <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </>
          )}

          {/* Custom Dynamic Sections */}
          {settings?.custom_sections?.map((section, sIndex) => {
            const visibleLinks = (section.links || []).filter((link: any) => {
              if (!link.role || link.role === "all") return true;
              if (link.role === "superadmin_only") return isSuperAdmin;
              return isSuperAdmin || permissions.includes(link.role);
            });

            if (visibleLinks.length === 0) return null;

            return (
              <div key={`section-${sIndex}`}>
                <div className="pt-4 pb-1.5">
                  {!isCollapsed ? (
                    <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>{section.title}</p>
                  ) : (
                    <div className="w-8 h-[1px] mx-auto my-2" style={{ background: 'var(--sidebar-border)', opacity: 0.5 }} />
                  )}
                </div>
                {visibleLinks.map((link: any, lIndex: number) => {
                  const isActive = pathname === link.href;
                  
                  if (link.openType === "external") {
                     return (
                      <motion.div key={`custom-${sIndex}-${lIndex}`} variants={itemVariants}>
                        <a
                           href={link.href}
                           target="_blank"
                           rel="noopener noreferrer"
                           onMouseEnter={() => setHoveredItem(link.name)}
                           onMouseLeave={() => setHoveredItem(null)}
                           className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                             isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                           } ${
                             isActive ? "dynamic-nav-item-active" : "dynamic-nav-item"
                           }`}
                        >
                          {isActive && (
                            <>
                              <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                            </>
                          )}
                          <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: isActive ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                            {link.icon || "link"}
                          </span>
                          {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">{link.name}</span>}
                          {isCollapsed && hoveredItem === link.name && (
                            <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                              {link.name}
                            </div>
                          )}
                        </a>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div key={`custom-${sIndex}-${lIndex}`} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onMouseEnter={() => setHoveredItem(link.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`group relative flex items-center py-3 rounded-2xl text-[13px] font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                          isCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 gap-3.5"
                        } ${
                          isActive ? "dynamic-nav-item-active" : "dynamic-nav-item"
                        }`}
                      >
                        {isActive && (
                          <>
                            <motion.div layoutId="active-indicator" className="absolute inset-0 z-0" style={{ background: 'linear-gradient(90deg, var(--sidebar-hover-bg) 0%, transparent 100%)' }} />
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: `var(--primary-color)` }} />
                          </>
                        )}
                        <span className="material-icons-round text-[20px] flex-shrink-0 transition-all duration-200 relative z-10" style={{ color: isActive ? `var(--primary-color)` : 'var(--sidebar-text)' }}>
                          {link.icon || "link"}
                        </span>
                        {!isCollapsed && <span className="truncate relative z-10 transition-colors duration-200">{link.name}</span>}
                        {isCollapsed && hoveredItem === link.name && (
                          <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                            {link.name}
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </motion.div>
      </nav>

      {/* Futuristic glowing Quick AI Assistant Button */}
      {!isCollapsed ? (
        <div className="px-4 py-3 relative z-20">
          <button className="w-full copilot-btn px-4 py-2.5 flex items-center gap-2 justify-center cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Launch AI Copilot</span>
          </button>
        </div>
      ) : (
        <div className="px-2 py-3 flex justify-center relative z-20">
          <button
            onMouseEnter={() => setHoveredItem("Launch AI")}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-11 h-11 copilot-btn-icon flex items-center justify-center cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {hoveredItem === "Launch AI" && (
              <div className="absolute left-[76px] bg-slate-950 border border-white/10 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none animate-scale-in">
                Launch AI Copilot
              </div>
            )}
          </button>
        </div>
      )}

      <div className="mx-4 h-px" style={{ background: 'var(--sidebar-border)', opacity: 0.5 }} />

      {/* User Info Footer */}
      <div className="px-4 py-4 relative z-20">
        <div className={`flex items-center rounded-2xl transition-all duration-150 cursor-default ${
          isCollapsed ? "justify-center p-1.5" : "px-3 py-2.5 gap-3"
        } dynamic-profile-card`}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-black flex-shrink-0 relative border"
            style={{
              background: `rgba(var(--primary-rgb), 0.15)`,
              borderColor: `var(--sidebar-border)`,
              color: `var(--primary-color)`,
            }}
          >
            {(userName || "A").charAt(0).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border rounded-full" style={{ borderColor: 'var(--sidebar-bg)' }} />
          </div>
          
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[12px] font-bold truncate" style={{ color: 'var(--sidebar-text)' }}>
                {userName || "Admin"}
              </p>
              <p className="text-[9.5px] truncate font-mono mt-0.5" style={{ color: 'var(--sidebar-text)', opacity: 0.7 }}>{userEmail}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
