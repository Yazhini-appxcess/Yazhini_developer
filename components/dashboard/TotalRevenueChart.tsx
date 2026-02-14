"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";

interface ActivityData {
  day?: string;
  date?: string;
  questions: number;
  documents: number;
}

export default function TotalRevenueChart() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.activity("day"));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching activity stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full">
        <h3 className="text-base font-bold text-gray-800 mb-8">Query Activity</h3>
        <div className="w-full h-[250px] bg-gray-50 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [
    { day: "Mon", questions: 0, documents: 0 },
    { day: "Tue", questions: 0, documents: 0 },
    { day: "Wed", questions: 0, documents: 0 },
    { day: "Thu", questions: 0, documents: 0 },
    { day: "Fri", questions: 0, documents: 0 },
    { day: "Sat", questions: 0, documents: 0 },
    { day: "Sun", questions: 0, documents: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800">Query Activity</h3>
        <p className="text-[11px] text-gray-400 font-medium mt-1">Weekly query trends</p>
      </div>

      <div className="flex-1 w-full" style={{ minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorQuestions" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey={chartData[0]?.day ? "day" : "date"}
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
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px"
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar
              dataKey="questions"
              name="AI Questions"
              fill="url(#colorQuestions)"
              radius={[4, 4, 4, 4]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
