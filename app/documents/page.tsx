"use client";

import { useCallback, useEffect, useState } from "react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { API_ENDPOINTS } from "@/lib/api";
import { getAdminUser, getAuthToken, authFetch } from "@/lib/auth";
import {
  Trash2,
  FileText,
  Calendar,
  X,
  Eye,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  text_content?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "external" | "internal">("all");

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    const user = getAdminUser();
    setIsSuperAdmin(!!user?.is_superuser);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch(API_ENDPOINTS.documents.list);
      if (!response.ok) throw new Error("Failed to load documents");
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      setDeletingId(id);
      const response = await authFetch(API_ENDPOINTS.documents.delete(id), { method: "DELETE" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete document");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      if (selectedDoc?.id === id) { setShowPreviewModal(false); setSelectedDoc(null); }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} document(s)? This action cannot be undone.`)) return;

    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) => authFetch(API_ENDPOINTS.documents.delete(id), { method: "DELETE" }))
    );

    const deleted = ids.filter((_, i) => results[i].status === "fulfilled");
    setDocuments((prev) => prev.filter((doc) => !deleted.includes(doc.id)));
    setSelectedIds(new Set());
    if (selectedDoc && deleted.includes(selectedDoc.id)) { setShowPreviewModal(false); setSelectedDoc(null); }
    setBulkDeleting(false);
  };

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "all") return true;
    return doc.agent_type === activeTab;
  });

  const currentPageIds = (() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredDocuments.slice(indexOfFirstItem, indexOfLastItem).map((d) => d.id);
  })();

  const allCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const someCurrentPageSelected =
    currentPageIds.some((id) => selectedIds.has(id)) && !allCurrentPageSelected;

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredDocuments.map((d) => d.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("word") || mimeType.includes("docx")) return "Word";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "Excel";
    return "File";
  };

  const getFileIconColor = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "text-rose-500";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "text-blue-500";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "text-emerald-500";
    return "text-slate-400";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "picture_as_pdf";
    if (mimeType.includes("word") || mimeType.includes("doc")) return "description";
    if (mimeType.includes("excel") || mimeType.includes("sheet")) return "table_chart";
    return "insert_drive_file";
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);

  const CheckboxIcon = allCurrentPageSelected
    ? CheckSquare
    : someCurrentPageSelected
    ? MinusSquare
    : Square;

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <CLSidebar />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <CLHeader />

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Page Header and Tab Selectors */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase font-display">Document Library</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Review corporate training inputs, sync state indices and manage knowledge base grounding assets.
                </p>
              </div>

              {/* Segment filter pills */}
              <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-xl shadow-sm self-start">
                <button
                  onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-widest cursor-pointer ${
                    activeTab === "all" ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  style={activeTab === "all" ? { background: "rgb(var(--primary-rgb))" } : {}}
                >
                  All Segments
                </button>
                <button
                  onClick={() => { setActiveTab("external"); setCurrentPage(1); }}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-widest cursor-pointer ${
                    activeTab === "external" ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  style={activeTab === "external" ? { background: "rgb(var(--primary-rgb))" } : {}}
                >
                  External Copilot
                </button>
                <button
                  onClick={() => { setActiveTab("internal"); setCurrentPage(1); }}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all duration-200 uppercase tracking-widest cursor-pointer ${
                    activeTab === "internal" ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                  style={activeTab === "internal" ? { background: "rgb(var(--primary-rgb))" } : {}}
                >
                  Internal Copilot
                </button>
              </div>
            </div>

            {/* Bulk Actions overlay */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-wrap items-center gap-4 px-5 py-3.5 bg-slate-900 border border-slate-850 rounded-xl shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-indigo-500 animate-pulse" />
                  
                  <span className="text-xs font-semibold text-white flex-1">
                    {selectedIds.size} document{selectedIds.size > 1 ? "s" : ""} selected for operation
                  </span>

                  {selectedIds.size < filteredDocuments.length && (
                    <button
                      onClick={selectAll}
                      className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      Select all {filteredDocuments.length}
                    </button>
                  )}

                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear Selection
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold bg-red-650 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-60 cursor-pointer shadow-md"
                  >
                    {bulkDeleting ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    {bulkDeleting ? "Deleting Files…" : `Bulk Delete (${selectedIds.size})`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error notifications */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-semibold">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Ingestion Data List */}
            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Querying database indexes...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {activeTab === "all" ? "No Grounding Assets Processed" : `No ${activeTab === "internal" ? "Internal" : "External"} Knowledge`}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                  {activeTab === "all"
                    ? "Commit files or crawl webpages in the Upload Hub to parse them into your AI training vector databases."
                    : "No assets match segment filter parameters."}
                </p>
                <a href="/ai" className="btn-primary inline-flex items-center gap-2">
                  Inbound Data Hub
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80">
                        {/* Select-all checkbox */}
                        <th className="px-5 py-4 w-10 text-center">
                          <button
                            onClick={toggleSelectAllPage}
                            title={allCurrentPageSelected ? "Deselect Page" : "Select Page"}
                            className="flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mx-auto"
                          >
                            <CheckboxIcon className="w-4.5 h-4.5" />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Knowledge Asset</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Size</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Upload Date</th>
                        {isSuperAdmin && (
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Operator</th>
                        )}
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Segment</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Grounding Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Operation Panel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentDocuments.map((doc) => {
                        const isSelected = selectedIds.has(doc.id);
                        return (
                          <tr
                            key={doc.id}
                            className={`transition-colors hover:bg-slate-50/80 ${
                              isSelected ? "bg-indigo-50/30" : ""
                            }`}
                          >
                            {/* Per-row checkbox */}
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id); }}
                                className={`flex items-center justify-center transition-colors cursor-pointer mx-auto ${
                                  isSelected ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"
                                }`}
                              >
                                {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                              </button>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <span className={`material-icons-round text-[20px] ${getFileIconColor(doc.mime_type)} flex-shrink-0`}>
                                  {getFileIcon(doc.mime_type)}
                                </span>
                                <div>
                                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px]">
                                    {doc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                    {doc.processed ? "Vector Embeddings Built" : "Indexing Embeddings..."}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs font-mono text-slate-500">{formatFileSize(doc.file_size)}</span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                              {formatDate(doc.created_at)}
                            </td>

                            {isSuperAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                                {doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : <span className="text-slate-400 italic">System Core</span>}
                              </td>
                            )}

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                                doc.agent_type === "internal"
                                  ? "badge-internal"
                                  : "badge-external"
                              }`}>
                                {doc.agent_type === "internal" ? "Internal" : "External"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                                doc.processed ? "badge-processed" : "badge-pending"
                              }`}>
                                {doc.processed ? "Synced" : "Indexing"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Preview */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setShowPreviewModal(true); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Preview</span>
                                </button>

                                {/* Download */}
                                {!doc.file_path?.startsWith("http") && (
                                  <a
                                    href={`${API_ENDPOINTS.documents.file(doc.id)}?disposition=attachment&token=${getAuthToken()}`}
                                    download={doc.name}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Export</span>
                                  </a>
                                )}

                                {/* Delete */}
                                <button
                                  onClick={() => handleDelete(doc.id, doc.name)}
                                  disabled={deletingId === doc.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                                >
                                  {deletingId === doc.id ? (
                                    <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-600" /> Syncing...</>
                                  ) : (
                                    <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination footer */}
                  {filteredDocuments.length > ITEMS_PER_PAGE && (
                    <div className="px-6 py-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                        Display <span className="text-slate-800 font-semibold font-mono">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="text-slate-800 font-semibold font-mono">{Math.min(indexOfLastItem, filteredDocuments.length)}</span> of{" "}
                        <span className="text-slate-800 font-semibold font-mono">{filteredDocuments.length}</span> logs
                        {selectedIds.size > 0 && (
                          <span className="ml-2 text-indigo-600 font-bold">· {selectedIds.size} Selected</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex gap-1.5">
                          {(() => {
                            const maxButtons = 5;
                            let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                            const end = Math.min(totalPages, start + maxButtons - 1);
                            if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
                            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                          })().map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentPage === page
                                  ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-955"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 bg-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview modal overlay */}
      <AnimatePresence>
        {showPreviewModal && selectedDoc && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-xl shadow-lg max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{selectedDoc.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Processed Index grounding content</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto bg-slate-50 flex-1 custom-scrollbar">
                {selectedDoc.processed && selectedDoc.text_content ? (
                  <div className="prose max-w-none">
                    <pre className="bg-white border border-slate-200 rounded-xl p-5 font-mono text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
                      {selectedDoc.text_content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4">
                      <Eye className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No Grounding content built</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mt-2 leading-relaxed">
                      This grounding asset has not indexed text parameters yet. Confirm ingestion state is synced.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                {!selectedDoc?.file_path?.startsWith("http") && (
                  <a
                    href={`${API_ENDPOINTS.documents.file(selectedDoc.id)}?disposition=attachment&token=${getAuthToken()}`}
                    download={selectedDoc.name}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Original
                  </a>
                )}
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer shadow-sm transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
