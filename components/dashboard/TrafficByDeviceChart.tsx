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

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

const colors = ["#01284e", "#8198b3", "#60a5fa", "#14b8a6", "#1f2937", "#3b82f6", "#a855f7", "#10b981"];

export default function TrafficByDeviceChart() {
  const [data, setData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeviceStats() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.devices());
        if (response.ok) {
          const result = await response.json();
          setData(result.devices || []);
        }
      } catch (error) {
        console.error("Error fetching device stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeviceStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Device</h3>
        <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full min-w-0">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Device</h3>
      <div className="w-full" style={{ height: "300px", minHeight: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="device"
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

