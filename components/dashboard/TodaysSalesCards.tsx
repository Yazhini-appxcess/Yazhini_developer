"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileText, MessageSquare, Bolt } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface TodayStats {
  documents_processed: number;
  documents_change: string;
  ai_queries: number;
  ai_queries_change: string;
  active_sessions: number;
  active_sessions_change: string;
}

export default function TodaysSalesCards() {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.today());
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching today's stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Documents Uploaded",
      value: stats?.documents_processed || 0,
      change: stats?.documents_change || "0% from yesterday",
      badge: "+12%",
      badgeColor: "bg-white/20 text-white",
      icon: FileText,
      iconColor: "text-white",
      fullColor: "bg-[#10b981]",
      bars: ["h-2 bg-white/20", "h-3 bg-white/20", "h-1 bg-white/40", "h-4 bg-white"],
      cardBg: "bg-[#10b981]",
      textColor: "text-white",
      subTextColor: "text-white/80"
    },
    {
      title: "AI Queries",
      value: stats?.ai_queries || 0,
      change: stats?.ai_queries_change || "0% from yesterday",
      badge: "Stable",
      badgeColor: "bg-white/20 text-white",
      icon: MessageSquare,
      iconColor: "text-white",
      fullColor: "bg-[#8b5cf6]",
      bars: ["h-4 bg-white/20", "h-2 bg-white/40", "h-3 bg-white/20", "h-1 bg-white"],
      cardBg: "bg-[#8b5cf6]",
      textColor: "text-white",
      subTextColor: "text-white/80"
    },
    {
      title: "Active Sessions",
      value: stats?.active_sessions || 0,
      change: stats?.active_sessions_change || "+0 from yesterday",
      badge: "Active",
      badgeColor: "bg-white/20 text-white",
      icon: Bolt,
      iconColor: "text-white",
      fullColor: "bg-[#f59e0b]",
      bars: ["h-3 bg-white", "h-4 bg-white/20", "h-2 bg-white/40", "h-4 bg-white"],
      cardBg: "bg-[#f59e0b]",
      textColor: "text-white",
      subTextColor: "text-white/80"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl h-40 animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-gray-200"></div>
        <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-[0.2em]">Activity Overview</p>
        <div className="h-[1px] w-12 bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.cardBg} p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-shadow group`}>
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${card.badgeColor}`}>{card.badge}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/90">{card.title}</p>
                <div className="flex items-end gap-3 mt-1">
                  <h3 className={`text-4xl font-bold ${card.textColor}`}>{card.value}</h3>
                  <div className="flex gap-1 mb-1.5 h-6 items-end">
                    {card.bars.map((barClass, i) => (
                      <div key={i} className={`w-1 rounded-full ${barClass}`}></div>
                    ))}
                  </div>
                </div>
                <p className={`text-[11px] mt-2 font-medium ${card.subTextColor}`}>{card.change} from Yesterday</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
