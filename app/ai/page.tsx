"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import DocumentUpload from "@/components/ai/DocumentUpload";
import { API_ENDPOINTS } from "@/lib/api";
import { Trash2 } from "lucide-react";

export default function AIPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(API_ENDPOINTS.documents.list, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.slice(0, 3)); // Only show top 3 as per design
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchDocuments();
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "picture_as_pdf";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "description";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "table_chart";
    return "insert_drive_file";
  };

  const getFileIconBg = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "bg-rose-50 text-rose-500";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "bg-primary/10 text-primary";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "bg-emerald-50 text-emerald-500";
    return "bg-slate-50 text-slate-500";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden text-slate-900 font-display">
      <CLSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CLHeader />

        {/* AI Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <DocumentUpload onUploadSuccess={fetchDocuments} />

            {/* Recent Uploads Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-slate-900">Recent Uploads</h3>
                <Link href="/documents" className="text-sm font-medium text-primary hover:underline">View All Documents</Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upload Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-primary mx-auto" />
                        </td>
                      </tr>
                    ) : documents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                          No recent uploads found.
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-primary/[0.04] transition-colors cursor-pointer group">
                          <td className="px-6 py-4 flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${getFileIconBg(doc.mime_type)}`}>
                              <span className="material-icons-round text-lg">{getFileIcon(doc.mime_type)}</span>
                            </div>
                            <span className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{doc.name}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{formatFileSize(doc.file_size)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${doc.processed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-primary/10 text-primary"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${doc.processed ? "bg-emerald-500" : "bg-primary animate-pulse"}`} />
                              {doc.processed ? "Completed" : "Processing"}
                            </span>
                          </td>
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
