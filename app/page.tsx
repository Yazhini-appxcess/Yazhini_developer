"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { Trash2, ArrowUpRight, TrendingUp, TrendingDown, FileText, ArrowRight, ShieldCheck, Box, Info } from "lucide-react";
import { getAdminUser, getAuthToken, AdminUser, authFetch } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Document {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  agent_type: string;
  processed: boolean;
  uploaded_by: number | null;
  uploader: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  documents_processed: number;
  documents_change: string;
  ai_queries: number;
  ai_queries_change: string;
  active_sessions: number;
  active_sessions_change: string;
  form_submissions: number;
  form_submissions_change: string;
}

interface EngagementData {
  day: string;
  conversations: number;
  sessions: number;
  submissions: number;
  queries: number;
}

interface TokenUsageData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
    color: string;
  }[];
  total_usage: number;
  estimated_cost?: number;
}

export default function Home() {
  const pathname = usePathname();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "external" | "internal">("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [tokenUsageData, setTokenUsageData] = useState<TokenUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await authFetch(API_ENDPOINTS.documents.delete(id), {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsResponse, statsResponse, activityResponse, tokenUsageResponse] = await Promise.all([
          authFetch(API_ENDPOINTS.documents.list),
          authFetch(API_ENDPOINTS.dashboard.today(activeTab)),
          authFetch(API_ENDPOINTS.dashboard.visitors("day", activeTab)),
          authFetch(API_ENDPOINTS.dashboard.tokenUsage("day", activeTab))
        ]);

        const user = getAdminUser();
        setAdminUser(user);

        if (docsResponse.ok) {
          const data = await docsResponse.json();
          const sortedDocs = data.sort((a: Document, b: Document) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ).slice(0, 5);
          setDocuments(sortedDocs);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();

          const days = [];
          for (let i = 6; i >= 0; i--) {
            const now = new Date();
            const caDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
            caDate.setDate(caDate.getDate() - i);
            days.push(caDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
          }

          const mergedData = days.map(day => {
            const found = activityData.data.find((item: EngagementData) => {
              return item.day === day || item.day.replace(" 0", " ") === day.replace(" 0", " ");
            });
            return found || {
              day,
              conversations: 0,
              sessions: 0,
              submissions: 0,
              queries: 0
            };
          });

          setEngagementData(mergedData);
        }

        if (tokenUsageResponse.ok) {
          const tokenData = await tokenUsageResponse.json();
          setTokenUsageData(tokenData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "picture_as_pdf";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "description";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "table_chart";
    return "insert_drive_file";
  };

  const getFileIconColor = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "text-rose-500";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "text-blue-500";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "text-emerald-500";
    return "text-slate-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(`${tickItem}, ${new Date().getFullYear()}`);
      return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    } catch (e) {
      return tickItem;
    }
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("word") || mimeType.includes("docx")) return "Word";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "Excel";
    return "File";
  };

  // Recharts Custom Dark Glass Tooltip with micro-glows
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur-md p-3.5 border border-white/10 rounded-2xl shadow-2xl text-left text-xs text-white animate-scale-in">
          <p className="text-slate-400 font-mono text-[9px] mb-1.5 uppercase tracking-wider">{label}</p>
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 mt-1.5">
              <span className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: p.color || p.fill, boxShadow: `0 0 8px ${p.color || p.fill}` }} />
              <span className="text-slate-300 font-medium">{p.name}:</span>
              <span className="font-bold font-mono ml-auto text-white">{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const statCards = [
    {
      label: "Documents Processed",
      value: stats ? stats.documents_processed.toLocaleString() : "—",
      change: stats?.documents_change ?? null,
      icon: "article",
      cardClass: "stat-card-emerald",
      iconColor: "text-emerald-500",
      accentGlow: "shadow-emerald-500/5",
      accentBar: "bg-emerald-500",
    },
    {
      label: "AI Queries Run",
      value: stats ? stats.ai_queries.toLocaleString() : "—",
      change: stats?.ai_queries_change ?? null,
      icon: "forum",
      cardClass: "stat-card-violet",
      iconColor: "text-violet-500",
      accentGlow: "shadow-violet-500/5",
      accentBar: "bg-violet-500",
    },
    {
      label: "Active Core Sessions",
      value: stats ? stats.active_sessions.toLocaleString() : "—",
      change: stats?.active_sessions_change ?? null,
      icon: "sensors",
      cardClass: "stat-card-amber",
      iconColor: "text-amber-500",
      accentGlow: "shadow-amber-500/5",
      accentBar: "bg-amber-500",
    },
    {
      label: "Form Grounding Data",
      value: stats ? stats.form_submissions?.toLocaleString() ?? "0" : "—",
      change: stats?.form_submissions_change ?? null,
      icon: "assignment_turned_in",
      cardClass: "stat-card-blue",
      iconColor: "text-blue-500",
      accentGlow: "shadow-blue-500/5",
      accentBar: "bg-blue-500",
    },
  ];

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 180, damping: 20 } }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <CLSidebar />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <CLHeader />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] mx-auto space-y-6 pb-12"
          >
            
            {/* Page Header and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase font-display">
                  Platform Grounding Node
                </h1>
                <p className="text-[12px] text-slate-500 font-medium tracking-tight">Real-time statistics & ingested intelligence data metrics</p>
              </div>

              {/* Segment filter pills */}
              <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm relative z-20">
                {(["all", "external", "internal"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all duration-350 uppercase tracking-widest cursor-pointer relative ${
                      activeTab === tab
                        ? "text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    style={
                      activeTab === tab
                        ? { background: "rgb(var(--primary-rgb))" }
                        : {}
                    }
                  >
                    {tab === "all" ? "Full Hub" : tab === "external" ? "External" : "Internal"}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
              {statCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  variants={widgetVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`${card.cardClass} p-5 rounded-2xl transition-all duration-300 relative overflow-hidden group shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-slate-300 bg-white`}
                >
                  {/* Glass corner accent highlight */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-center">
                      <span className={`material-icons-round text-[22px] ${card.iconColor}`}>{card.icon}</span>
                    </div>
                    {card.change && (
                      <span className={`flex items-center text-[10px] font-extrabold px-2.5 py-1.5 rounded-full shadow-sm ${
                        card.change.startsWith('+')
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                          : 'text-rose-700 bg-rose-50 border border-rose-100'
                      }`}>
                        {card.change.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {card.change}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">{card.label}</p>
                  <div className="flex items-end justify-between mt-2.5 relative z-10">
                    <span className="text-[32px] font-black tracking-tight text-slate-800 leading-none font-display">
                      {loading ? <span className="skeleton-shimmer inline-block w-20 h-9 rounded-xl" /> : card.value}
                    </span>
                    <div className="flex items-end gap-1.5 pb-1">
                      <div className={`w-1 h-3.5 ${card.accentBar} opacity-30 rounded-full`} />
                      <div className={`w-1 h-5 ${card.accentBar} opacity-60 rounded-full`} />
                      <div className={`w-1 h-6.5 ${card.accentBar} rounded-full animate-pulse-slow`} />
                    </div>
                  </div>
                  {card.change && (
                    <p className="text-[9.5px] text-slate-400 mt-3 font-semibold relative z-10">{card.change} against yesterday benchmark</p>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Area Chart: Platform Engagements */}
              <motion.div 
                variants={widgetVariants}
                className="lg:col-span-2 premium-card p-6 rounded-2xl relative overflow-hidden bg-white border border-slate-200/80 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Interface Engagements</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Grounding data ingestion query trends</p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Conversations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Queries</span>
                    </div>
                  </div>
                </div>

                <div className="h-[280px] w-full">
                  {engagementData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData}>
                        <defs>
                          <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                        <XAxis
                          dataKey="day"
                          tickFormatter={formatXAxis}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          dy={12}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="conversations"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#gradViolet)"
                          dot={false}
                          activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                          name="Conversations"
                        />
                        <Area
                          type="monotone"
                          dataKey="queries"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fill="url(#gradEmerald)"
                          dot={false}
                          activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                          name="Queries"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <span className="material-icons-round text-4xl mb-2 text-indigo-500 animate-pulse">show_chart</span>
                      <p className="text-[11px] font-bold uppercase tracking-widest">Awaiting engagement metrics...</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Bar Chart: Weekly Query Trends */}
              <motion.div 
                variants={widgetVariants}
                className="premium-card p-6 rounded-2xl relative overflow-hidden bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Query Logs</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Log query counts by node</p>
                </div>

                <div className="h-44 relative flex items-end justify-between px-2">
                  {/* Dashed background grids */}
                  <div className="absolute inset-0 h-40 grid grid-rows-4 pointer-events-none opacity-20 w-full">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="border-t border-slate-200 border-dashed"></div>
                    ))}
                  </div>

                  {/* Interactive Bars */}
                  {(() => {
                    const maxQueries = Math.max(...engagementData.map(e => Number(e.queries)), 0);
                    const defaultActiveIndex = engagementData.length - 1;

                    return engagementData.map((d, i) => {
                      const max = Math.max(maxQueries, 1);
                      const actualHeight = Math.max((Number(d.queries) / max) * 100, 15);
                      const isActive = hoveredBarIndex !== null ? hoveredBarIndex === i : i === defaultActiveIndex;
                      
                      const barColors = [
                        'from-indigo-500 to-indigo-600',
                        'from-violet-500 to-purple-600',
                        'from-blue-500 to-cyan-600',
                        'from-amber-500 to-orange-600',
                        'from-emerald-500 to-teal-600',
                        'from-indigo-500 to-purple-600',
                        'from-cyan-500 to-blue-600',
                      ];

                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer relative z-10"
                          onMouseEnter={() => setHoveredBarIndex(i)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          <motion.div
                            animate={{ 
                              height: `${actualHeight}%`,
                              scaleX: isActive ? 1.15 : 1
                            }}
                            className={`w-3 rounded-full bg-gradient-to-t ${
                              isActive ? barColors[i % barColors.length] : 'from-slate-100 to-slate-200'
                            } relative transition-all duration-300`}
                          >
                            {/* Popup Tooltip bubble */}
                            <AnimatePresence>
                              {isActive && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-white/10 text-white text-[9px] font-bold px-2 py-1 rounded-xl whitespace-nowrap shadow-xl z-50 pointer-events-none"
                                >
                                  {d.queries}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Date labels */}
                <div className="flex justify-between px-1 mt-4 border-t border-slate-100 pt-2.5">
                  {engagementData.map((d, i) => {
                    const dayName = new Date(d.day + ", " + new Date().getFullYear())
                      .toLocaleDateString('en-US', { weekday: 'short' });
                    const isActive = hoveredBarIndex === i;

                    return (
                      <div key={i} className="flex-1 text-center">
                        <span className={`text-[9px] font-bold tracking-tight transition-colors duration-200 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Token Usage Section */}
            <motion.div 
              variants={widgetVariants}
              className="premium-card p-6 rounded-2xl relative overflow-hidden bg-white border border-slate-200/80 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Token Consumption</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Model token allocation & estimated computational expenses</p>
                </div>
                {tokenUsageData && (
                  <div className="flex items-center gap-6 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl shadow-sm">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tokens</p>
                      <p className="text-base font-black text-slate-800 tracking-tight font-mono mt-0.5">{tokenUsageData.total_usage.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Cost</p>
                      <p className="text-base font-black text-emerald-600 tracking-tight font-mono mt-0.5">${tokenUsageData.estimated_cost?.toFixed(4) ?? "0.00"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[280px] w-full">
                {tokenUsageData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tokenUsageData.labels.map((label, i) => ({
                      label,
                      prompt: tokenUsageData.datasets[0].data[i],
                      completion: tokenUsageData.datasets[1].data[i]
                    }))}>
                      <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}
                      />
                      <Bar dataKey="prompt" name="Prompt (Inputs)" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="completion" name="Completion (Outputs)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <span className="material-icons-round text-4xl mb-2 text-indigo-500 animate-pulse">bar_chart</span>
                    <p className="text-[11px] font-bold uppercase tracking-widest">No usage tokens indexed yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Documents Table Section */}
            <motion.div 
              variants={widgetVariants}
              className="premium-card rounded-2xl overflow-hidden relative border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Indexed Grounding Knowledge</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Most recently ingested corporate datasets and files</p>
                </div>
                <Link
                  href="/documents"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:gap-2 transition-all duration-250"
                >
                  Explore All Knowledge
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Knowledge Asset</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">File Type</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Segment</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Grounding Status</th>
                      {adminUser?.is_superuser && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Operator</th>}
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date Index</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={adminUser?.is_superuser ? 7 : 6} className="px-6 py-12 text-center text-slate-400 text-[12px]">
                          <div className="flex items-center justify-center gap-2.5">
                            <div className="w-4 h-4 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin" />
                            Reading knowledge indexes...
                          </div>
                        </td>
                      </tr>
                    ) : documents.filter(d => activeTab === 'all' || d.agent_type === activeTab).length === 0 ? (
                      <tr>
                        <td colSpan={adminUser?.is_superuser ? 7 : 6} className="px-6 py-12 text-center text-slate-505 text-xs font-semibold">
                          No {activeTab === 'all' ? '' : activeTab === 'internal' ? 'Internal ' : 'External '}documents parsed in current node block.
                        </td>
                      </tr>
                    ) : (
                      documents
                        .filter(d => activeTab === 'all' || d.agent_type === activeTab)
                        .map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className={`material-icons-round text-[20px] ${getFileIconColor(doc.mime_type)}`}>
                                  {getFileIcon(doc.mime_type)}
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{doc.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-400">{getFileType(doc.mime_type)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                doc.agent_type === 'internal' ? 'badge-internal animate-pulse-slow' : 'badge-external'
                              }`}>
                                {doc.agent_type === 'internal' ? 'Internal' : 'External'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                doc.processed ? 'badge-processed' : 'badge-pending animate-pulse'
                              }`}>
                                {doc.processed ? 'Synced' : 'Pending'}
                              </span>
                            </td>
                            {adminUser?.is_superuser && (
                              <td className="px-6 py-4 text-xs font-bold text-slate-650">
                                {doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : 'Super Node'}
                              </td>
                            )}
                            <td className="px-6 py-4 text-xs font-mono font-medium text-slate-400">{formatDate(doc.created_at)}</td>
                            <td className="px-6 py-4 text-right">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id, doc.name);
                                }}
                                disabled={deletingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                              >
                                {deletingId === doc.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-600" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </>
                                )}
                              </motion.button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Governance warning alert */}
            <motion.div 
              variants={widgetVariants}
              className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start shadow-sm"
            >
              <ShieldCheck className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Vector Grounding Guard Compliant</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-medium">
                  All knowledge nodes ingested into the portal are parsed and indexed locally in compliance with strict corporate sanitisation policies. Vector indexes are rebuilt and matched with credentials on user access nodes dynamically.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
