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
  Cell,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";

interface DocumentImportance {
  id: number;
  name: string;
  chunk_count: number;
  file_size: number;
  importance_score: number;
  created_at: string | null;
}

export default function DocumentImportanceChart() {
  const [data, setData] = useState<DocumentImportance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocumentImportance() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.documentImportance(10));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching document importance:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocumentImportance();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Document Importance</h3>
        <div className="w-full h-[250px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0
    ? data.map(doc => ({
      name: doc.name.length > 20 ? doc.name.substring(0, 20) + "..." : doc.name,
      fullName: doc.name,
      score: doc.importance_score,
      chunks: doc.chunk_count,
    }))
    : [];

  const maxScore = Math.max(...chartData.map(d => d.score), 100);

  // Color gradient based on importance score
  const getColor = (score: number) => {
    if (score >= 80) return "#8198b3"; // Green for high importance
    if (score >= 50) return "#01284e"; // Blue for medium importance
    return "#94a3b8"; // Gray for low importance
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Document Importance</h3>
      <p className="text-xs text-gray-500 mb-4">
        Based on chunk count - documents with more content chunks are more likely to be used in queries
      </p>
      <div className="w-full" style={{ height: "250px", minHeight: "250px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              domain={[0, maxScore]}
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
              formatter={(value: any, name: any, props: any) => {
                if (name === "score") {
                  return [`${value}%`, "Importance Score"];
                }
                return [value, name];
              }}
              labelFormatter={(label) => {
                const doc = chartData.find(d => d.name === label);
                return doc?.fullName || label;
              }}
            />
            <Bar dataKey="score" name="Importance Score" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8198b3] rounded"></div>
              <span className="text-gray-600">High (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#01284e] rounded"></div>
              <span className="text-gray-600">Medium (50-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#94a3b8] rounded"></div>
              <span className="text-gray-600">Low (&lt;50%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

