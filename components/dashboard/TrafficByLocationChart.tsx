"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { API_ENDPOINTS } from "@/lib/api";

interface LocationData {
  name: string;
  value: number;
  color: string;
}

export default function TrafficByLocationChart() {
  const [data, setData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.locations());
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching location stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Location</h3>
        <div className="w-full h-[300px] bg-gray-50 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full min-w-0">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Location</h3>
      <div className="flex items-center flex-wrap lg:flex-nowrap gap-4">
        <div className="flex-1 min-w-0" style={{ height: "300px", minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-shrink-0 lg:ml-8">
          <div className="space-y-3">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                  <div className="text-xs text-gray-500">{entry.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

