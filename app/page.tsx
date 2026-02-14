"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { getAdminUser } from "@/lib/auth";

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function Home() {
  const pathname = usePathname();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "external" | "internal">("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(API_ENDPOINTS.documents.delete(id), {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      // Remove from list
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
        const [docsResponse, statsResponse, activityResponse] = await Promise.all([
          fetch(API_ENDPOINTS.documents.list),
          fetch(API_ENDPOINTS.dashboard.today(activeTab)),
          fetch(API_ENDPOINTS.dashboard.visitors("day", activeTab))
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

          // Generate last 7 days based on California time
          const days = [];
          for (let i = 6; i >= 0; i--) {
            // Get current date in California
            const now = new Date();
            const caDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
            caDate.setDate(caDate.getDate() - i);
            days.push(caDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })); // "Feb 02"
          }

          // Merge with API data
          const mergedData = days.map(day => {
            const found = activityData.data.find((item: any) => {
              // API returns "Feb 02" format, check for match
              // Depending on backend, handle date normalization
              // Assuming backend returns "MMM DD" or we need to normalize key
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
    if (mimeType.includes("pdf")) return "text-red-500";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "text-blue-500";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "text-green-500";
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
      // tickItem is expected to be "Feb 02"
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

  return (
    <div className="flex h-screen bg-white">
      <CLSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <CLHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Global Filter */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
                <p className="text-sm text-slate-500">Track performance and engagement across agents</p>
              </div>
              <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeTab === "all" ? "bg-[#01284e] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  All Segments
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeTab === "external" ? "bg-[#01284e] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  External Assistant
                </button>
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeTab === "internal" ? "bg-[#01284e] text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Copilot (Internal)
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-accent-emerald hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <span className="material-icons-round text-accent-emerald">article</span>
                  </div>
                  {stats && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stats.documents_change.startsWith('+')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                      }`}>
                      <span className="material-icons-round text-[14px] mr-1">
                        {stats.documents_change.startsWith('+') ? 'trending_up' : 'trending_down'}
                      </span>
                      {stats.documents_change}
                    </span>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Documents Uploaded</h3>
                <div className="flex items-end space-x-3 mt-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">{stats ? stats.documents_processed.toLocaleString() : '...'}</span>
                  <div className="flex items-end space-x-1 pb-1">
                    <div className="w-1.5 h-3 bg-emerald-200 rounded-full"></div>
                    <div className="w-1.5 h-5 bg-emerald-400 rounded-full"></div>
                    <div className="w-1.5 h-4 bg-accent-emerald rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{stats ? stats.documents_change : '0%'} from yesterday</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-accent-violet hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-violet-50 rounded-xl">
                    <span className="material-icons-round text-accent-violet">forum</span>
                  </div>
                  {stats && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stats.ai_queries_change.startsWith('+')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                      }`}>
                      <span className="material-icons-round text-[14px] mr-1">
                        {stats.ai_queries_change.startsWith('+') ? 'trending_up' : 'trending_down'}
                      </span>
                      {stats.ai_queries_change}
                    </span>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">AI Queries</h3>
                <div className="flex items-end space-x-3 mt-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">{stats ? stats.ai_queries.toLocaleString() : '...'}</span>
                  <div className="flex items-end space-x-1 pb-1">
                    <div className="w-1.5 h-4 bg-violet-200 rounded-full"></div>
                    <div className="w-1.5 h-2 bg-violet-400 rounded-full"></div>
                    <div className="w-1.5 h-6 bg-accent-violet rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{stats ? stats.ai_queries_change : '0%'} from yesterday</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-accent-amber hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <span className="material-icons-round text-accent-amber">sensors</span>
                  </div>
                  {stats && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stats.active_sessions_change.startsWith('+')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                      }`}>
                      <span className="material-icons-round text-[14px] mr-1">
                        {stats.active_sessions_change.startsWith('+') ? 'trending_up' : 'trending_down'}
                      </span>
                      {stats.active_sessions_change}
                    </span>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Active Sessions</h3>
                <div className="flex items-end space-x-3 mt-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">{stats ? stats.active_sessions.toLocaleString() : '...'}</span>
                  <div className="flex items-end space-x-1 pb-1">
                    <div className="w-1.5 h-3 bg-amber-200 rounded-full"></div>
                    <div className="w-1.5 h-4 bg-amber-400 rounded-full"></div>
                    <div className="w-1.5 h-5 bg-accent-amber rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{stats ? stats.active_sessions_change : '0%'} from yesterday</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Engagements Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200/50 relative">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">
                      Platform Engagements
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Weekly interactions overview
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-violet"></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conversations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald"></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Queries</span>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  {engagementData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData}>
                        <defs>
                          {/* Violet Gradient for Conversations */}
                          <linearGradient id="areaGradientViolet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="lineGradientViolet" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>

                          {/* Emerald Gradient for Sessions */}
                          <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="lineGradientEmerald" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          tickFormatter={formatXAxis}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                          dy={15}
                        />
                        <Tooltip
                          cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="conversations"
                          stroke="url(#lineGradientViolet)"
                          strokeWidth={4}
                          fill="url(#areaGradientViolet)"
                          dot={{ fill: '#8b5cf6', stroke: 'white', strokeWidth: 3, r: 6 }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="Conversations"
                        />
                        <Area
                          type="monotone"
                          dataKey="queries"
                          stroke="url(#lineGradientEmerald)"
                          strokeWidth={4}
                          fill="url(#areaGradientEmerald)"
                          dot={{ fill: '#10b981', stroke: 'white', strokeWidth: 3, r: 6 }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                          name="Queries"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <span className="material-icons-round text-3xl mb-2">show_chart</span>
                      <p className="text-sm">No engagement data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Query Activity */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200/50 flex flex-col justify-between">
                <div className="mb-8 pl-1">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Query Activity</h3>
                  <p className="text-xs text-slate-500 font-medium">Weekly query trends</p>
                </div>

                <div className="h-64 flex flex-col justify-between relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 h-48 grid grid-rows-4 pointer-events-none -z-10 opacity-50 w-full">
                    <div className="border-t border-slate-100 dark:border-slate-700 border-dashed"></div>
                    <div className="border-t border-slate-100 dark:border-slate-700 border-dashed"></div>
                    <div className="border-t border-slate-100 dark:border-slate-700 border-dashed"></div>
                    <div className="border-t border-slate-100 dark:border-slate-700 border-dashed"></div>
                  </div>

                  {/* Bars */}
                  <div className="flex items-end justify-between h-48 px-2 relative z-10">
                    {(() => {
                      // Calculate default active index (max query day) once
                      const maxQueries = Math.max(...engagementData.map(e => Number(e.queries)), 0);
                      const defaultActiveIndex = engagementData.findIndex(e => Number(e.queries) === maxQueries);

                      return engagementData.map((d, i) => {
                        const max = Math.max(maxQueries, 1);

                        // Pyramid pattern for default state
                        const pyramidHeights = [30, 45, 65, 85, 65, 45, 30];
                        const defaultHeight = pyramidHeights[i] || 30;

                        // Actual height based on data (min 10% for visibility if 0)
                        const actualHeight = Math.max((Number(d.queries) / max) * 100, 10);

                        // Determine if this bar is active (hovered OR default)
                        const isActive = hoveredBarIndex !== null ? hoveredBarIndex === i : i === defaultActiveIndex;

                        // Use actual height if active, otherwise pyramid height
                        const heightPercentage = isActive ? actualHeight : defaultHeight;

                        // Colors for each day
                        const barColors = [
                          'bg-violet-400 group-hover:bg-violet-400', // Mon
                          'bg-pink-400 group-hover:bg-pink-400',   // Tue
                          'bg-blue-400 group-hover:bg-blue-400',   // Wed
                          'bg-amber-400 group-hover:bg-amber-400', // Thu
                          'bg-emerald-400 group-hover:bg-emerald-400', // Fri
                          'bg-indigo-400 group-hover:bg-indigo-400', // Sat
                          'bg-cyan-400 group-hover:bg-cyan-400',   // Sun
                        ];

                        const activeColor = barColors[i % barColors.length];

                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center flex-1 group h-full justify-end cursor-pointer"
                            onMouseEnter={() => setHoveredBarIndex(i)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            <div
                              className={`w-3 rounded-full transition-all duration-500 ease-out relative ${isActive ? activeColor : 'bg-slate-50'}`}
                              style={{ height: `${heightPercentage}%` }}
                            >
                              {/* Tooltip */}
                              <div className={`absolute -top-10 left-1/2 -translate-x-1/2
                                     bg-slate-900 text-white text-[10px]
                                     px-2 py-1 rounded shadow-lg whitespace-nowrap
                                     after:content-[''] after:absolute after:top-full
                                     after:left-1/2 after:-translate-x-1/2
                                     after:border-4 after:border-transparent
                                     after:border-t-slate-900
                                     transform transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} pointer-events-none`}>
                                {d.queries} Queries
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between px-1 mt-2">
                    {(() => {
                      const maxQueries = Math.max(...engagementData.map(e => Number(e.queries)), 0);
                      const defaultActiveIndex = engagementData.findIndex(e => Number(e.queries) === maxQueries);

                      return engagementData.map((d, i) => {
                        const dayName = new Date(d.day + ", " + new Date().getFullYear()).toLocaleDateString('en-US', { weekday: 'short' });
                        const isActive = hoveredBarIndex !== null ? hoveredBarIndex === i : i === defaultActiveIndex;

                        const barColors = [
                          'text-violet-500',
                          'text-pink-500',
                          'text-blue-500',
                          'text-amber-500',
                          'text-emerald-500',
                          'text-indigo-500',
                          'text-cyan-500',
                        ];
                        const activeTextColor = barColors[i % barColors.length];

                        return (
                          <div key={i} className="flex-1 text-center group">
                            <span className={`text-[9px] font-medium transition-colors duration-300 ${isActive ? `${activeTextColor} font-bold` : 'text-slate-400'}`}>
                              {dayName}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-lg text-slate-900">Recent Documents</h3>
                </div>
                <Link href="/documents" className="text-primary text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Document Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Agent</th>
                      <th className="px-6 py-4">Status</th>
                      {adminUser?.is_superuser && <th className="px-6 py-4">Uploaded By</th>}
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          Loading documents...
                        </td>
                      </tr>
                    ) : documents.filter(d => activeTab === 'all' || d.agent_type === activeTab).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No {activeTab === 'all' ? '' : activeTab === 'internal' ? 'Copilot ' : 'External '}documents found.
                        </td>
                      </tr>
                    ) : (
                      documents
                        .filter(d => activeTab === 'all' || d.agent_type === activeTab)
                        .map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 flex items-center space-x-3">
                              <span className={`material-icons-round ${getFileIconColor(doc.mime_type)}`}>
                                {getFileIcon(doc.mime_type)}
                              </span>
                              <span className="text-sm font-medium text-slate-900">{doc.name}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{getFileType(doc.mime_type)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${doc.agent_type === 'internal'
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                {doc.agent_type === 'internal' ? 'Copilot' : 'External'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${doc.processed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                                }`}>
                                {doc.processed ? "Processed" : "Pending"}
                              </span>
                            </td>
                            {adminUser?.is_superuser && (
                              <td className="px-6 py-4 text-sm text-slate-900">
                                {doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : 'Unknown'}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-slate-500">{formatDate(doc.created_at)}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id, doc.name);
                                }}
                                disabled={deletingId === doc.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === doc.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div >
    </div >
  );
}
