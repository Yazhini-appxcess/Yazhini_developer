"use client";

import { useEffect, useState } from "react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { getAdminUser } from "@/lib/auth";
import { Trash2, FileText, Calendar, X, File, FileSpreadsheet, Presentation } from "lucide-react";

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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const user = getAdminUser();
    setIsSuperAdmin(!!user?.is_superuser);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.documents.list);
      if (!response.ok) {
        throw new Error("Failed to load documents");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
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
      const response = await fetch(API_ENDPOINTS.documents.delete(id), {
        method: "DELETE",
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Use California timezone
    return date.toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return <FileText className="w-6 h-6 text-red-600" />;
    }
    if (mimeType.includes("word") || mimeType.includes("doc")) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    if (mimeType.includes("excel") || mimeType.includes("xls") || mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    }
    if (mimeType.includes("powerpoint") || mimeType.includes("ppt") || mimeType.includes("presentation")) {
      return <Presentation className="w-6 h-6 text-orange-600" />;
    }
    return <File className="w-6 h-6 text-gray-600" />;
  };

  const [activeTab, setActiveTab] = useState<"all" | "external" | "internal">("all");

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "all") return true;
    return doc.agent_type === activeTab;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <CLSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <CLHeader />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Library</h1>
                <p className="text-sm text-gray-600">
                  Manage your knowledge base. Delete documents to remove them from the AI's training data.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "all" ? "bg-[#01284e] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  All Segments
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "external" ? "bg-[#01284e] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  External Assistant
                </button>
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "internal" ? "bg-[#01284e] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Copilot
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === "all" ? "No documents uploaded" : `No ${activeTab === "internal" ? "Copilot" : "External"} documents`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "all"
                    ? "Upload documents from the AI Hub page to get started."
                    : `Try switching to a different tab or upload documents for the ${activeTab === "internal" ? "Copilot" : "External Bot"}.`}
                </p>
                <a
                  href="/ai"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Go to AI Hub
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Upload Date
                        </th>
                        {isSuperAdmin && (
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Uploaded By
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getFileIcon(doc.mime_type)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {doc.processed ? "Processed" : "Processing..."}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatFileSize(doc.file_size)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(doc.created_at)}
                            </div>
                          </td>
                          {isSuperAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {doc.uploader ? (
                                  <span>{doc.uploader.first_name} {doc.uploader.last_name}</span>
                                ) : (
                                  <span className="text-gray-400 italic">Unknown</span>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${doc.agent_type === "internal"
                                ? "bg-slate-100 text-slate-800 border border-slate-200"
                                : "bg-blue-50 text-blue-800 border border-blue-100"
                                }`}
                            >
                              {doc.agent_type === "internal" ? "Copilot" : "External"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${doc.processed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {doc.processed ? "Processed" : "Processing"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDelete(doc.id, doc.name)}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
