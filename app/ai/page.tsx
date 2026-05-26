"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import DocumentUpload from "@/components/ai/DocumentUpload";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { Trash2, Eye, Download, X } from "lucide-react";

interface DocumentItem {
  id: number;
  name: string;
  created_at: string;
  file_size: number;
  processed: boolean;
  text_content?: string | null;
}

export default function AIPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchDocuments = async () => {
    try {
      const token = getAuthToken();
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
      const token = getAuthToken();
      const response = await fetch(API_ENDPOINTS.documents.delete(id), {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete document");
      }

      // Remove from list
      setDocuments(documents.filter((doc) => doc.id !== id));
      if (selectedDoc?.id === id) {
        setShowPreviewModal(false);
        setSelectedDoc(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

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
          <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
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
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Action</th>
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
                          <td className="px-6 py-4">
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
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* View Button (Internal Preview) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDoc(doc);
                                  setShowPreviewModal(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                                title="View Processed Content"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                              </button>

                              {/* Download Button */}
                              <a
                                href={`${API_ENDPOINTS.documents.file(doc.id)}?disposition=attachment&token=${getAuthToken()}`}
                                download={doc.name}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                              </a>

                              {/* Delete Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id, doc.name);
                                }}
                                disabled={deletingId === doc.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Document"
                              >
                                {deletingId === doc.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    <span className="hidden sm:inline">Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
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

      {/* Processed Content Preview Modal */}
      {showPreviewModal && selectedDoc && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{selectedDoc.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Processed Knowledge Content</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto bg-white flex-1">
              {selectedDoc.text_content ? (
                <div className="prose prose-slate max-w-none">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {selectedDoc.text_content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">No processed content available</h4>
                  <p className="text-slate-500 max-w-sm mt-2">
                    This document may still be processing or failed to extract text content.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <a
                href={`${API_ENDPOINTS.documents.file(selectedDoc.id)}?disposition=attachment&token=${getAuthToken()}`}
                download={selectedDoc.name}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                Download Original
              </a>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
