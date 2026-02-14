"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";

interface Document {
  id: number;
  name: string;
  chunk_count: number;
  created_at: string;
}

export default function TopProductsTable() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopDocuments() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.topDocuments(10));
        if (response.ok) {
          const result = await response.json();
          setDocuments(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching top documents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopDocuments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Top Documents</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxChunks = Math.max(...documents.map(d => d.chunk_count), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top Documents</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Document</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Chunks</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Usage</th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? (
              documents.map((doc, index) => {
                const popularity = (doc.chunk_count / maxChunks) * 100;
                return (
                  <tr key={doc.id} className="border-b border-gray-100">
                    <td className="py-3 px-3 text-xs text-gray-900 truncate max-w-[200px]" title={doc.name}>
                      {doc.name}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-900">{doc.chunk_count}</td>
                <td className="py-3 px-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${popularity}%` }}
                    ></div>
                  </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-xs text-gray-500">
                  No documents yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

