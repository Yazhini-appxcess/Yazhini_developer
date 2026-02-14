"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";

interface VisitorData {
  day?: string;
  month?: string;
  conversations: number;
  sessions: number;
  submissions: number;
}

export default function VisitorInsightsChart() {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.visitors("day"));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVisitors();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full">
        <h3 className="text-base font-bold text-gray-800 mb-8">Engagements</h3>
        <div className="w-full h-[250px] bg-gray-50 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data.map(item => ({
    day: item.day || item.month,
    conversations: Number(item.conversations) || 0,
    sessions: Number(item.sessions) || 0,
  })) : [];

  const maxValue = chartData.length > 0
    ? Math.max(
      ...chartData.map(d => Math.max(d.conversations, d.sessions)),
      1
    )
    : 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-base font-bold text-gray-800">Engagements</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-1">Monthly interactions overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Conversations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sessions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full" style={{ minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConv" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="colorSess" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxValue * 1.1]}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px"
              }}
              cursor={{ stroke: '#e2e8f0' }}
            />
            <Line
              type="monotone"
              dataKey="conversations"
              stroke="url(#colorConv)"
              strokeWidth={4}
              dot={{ fill: "white", stroke: "#8b5cf6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#8b5cf6" }}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="url(#colorSess)"
              strokeWidth={4}
              dot={{ fill: "white", stroke: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
