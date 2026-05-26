"use client";

import { useState } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle, Globe, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function DocumentUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [agentType, setAgentType] = useState<"internal" | "external">("external");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  const [showSensitivityWarning, setShowSensitivityWarning] = useState(false);
  const [sensitivityWarnings, setSensitivityWarnings] = useState<string[]>([]);
  const [sensitivityFile, setSensitivityFile] = useState<File | null>(null);

  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
      setMessage("");
      setShowSensitivityWarning(false);
      setSensitivityWarnings([]);
    }
  };

  const handleUpload = async (force: boolean = false) => {
    const fileToUpload = force ? sensitivityFile : file;

    if (!fileToUpload) {
      setMessage("Please select a file");
      setUploadStatus("error");
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setMessage("");
    if (!force) setShowSensitivityWarning(false);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("agent_type", agentType);

      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const uploadUrl = `${API_ENDPOINTS.documents.upload}${force ? '?force=true' : ''}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        setUploadStatus("success");
        setMessage(`Document "${fileToUpload.name}" uploaded and indexed successfully!`);
        setFile(null);
        setSensitivityFile(null);
        setShowSensitivityWarning(false);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errorData = await res.json();
        console.log("Upload error response:", errorData);

        let detail = errorData.detail;

        if (typeof detail === 'string') {
          try {
            if (detail.includes("'code': 'SENSITIVE_DATA_DETECTED'")) {
              detail = JSON.parse(detail.replace(/'/g, '"'));
            } else {
              detail = JSON.parse(detail);
            }
          } catch (e) {
            // parsing fails, keep string
          }
        }

        const isSensitiveData = detail && (detail.code === "SENSITIVE_DATA_DETECTED" || (typeof detail === 'string' && detail.includes("SENSITIVE_DATA_DETECTED")));

        if (res.status === 400 && isSensitiveData) {
          const warnings = detail.warnings || [];
          if (warnings.length === 0 && typeof detail === 'string') {
            const match = detail.match(/warnings': \[(.*?)\]/);
            if (match && match[1]) {
              setSensitivityWarnings([match[1]]);
            }
          } else {
            setSensitivityWarnings(warnings);
          }

          setSensitivityFile(fileToUpload);
          setShowSensitivityWarning(true);
          setUploadStatus(null);
        } else {
          setUploadStatus("error");
          let paramsMsg = "Failed to upload document";
          if (typeof detail === 'string') {
            paramsMsg = detail;
          } else if (detail?.message) {
            paramsMsg = detail.message;
          }
          setMessage(paramsMsg);
        }
      }
    } catch (err) {
      const error = err as Error;
      setUploadStatus("error");
      setMessage(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleScrape = async () => {
    if (!url) {
      setMessage("Please enter a website URL");
      setUploadStatus("error");
      return;
    }

    setScraping(true);
    setUploadStatus(null);
    setMessage("");

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(API_ENDPOINTS.documents.scrapeUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ url, agent_type: agentType }),
      });

      if (res.ok) {
        setUploadStatus("success");
        setMessage(`Website "${url}" scraped and processed successfully!`);
        setUrl("");
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errorData = await res.json();
        setUploadStatus("error");
        setMessage(errorData.detail || "Failed to scrape website");
      }
    } catch (err) {
      const error = err as Error;
      setUploadStatus("error");
      setMessage(error.message || "Failed to scrape website");
    } finally {
      setScraping(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl pointer-events-none" />

      <div className="mb-6 border-b border-slate-100 pb-5">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800 tracking-tight uppercase font-display">
            Ground New Knowledge Data
          </h3>
          <p className="text-slate-500 text-xs mt-1">Enhance AI intelligence index by uploading documents or scraping target webpages.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Agent target switcher */}
          <div className="flex bg-slate-50 border border-slate-200/80 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => setAgentType("external")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                agentType === "external"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              External Copilot
            </button>
            <button
              onClick={() => setAgentType("internal")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                agentType === "internal"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Internal Copilot
            </button>
          </div>

          {/* Upload Method switcher */}
          <div className="flex bg-slate-50 border border-slate-200/80 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab("file")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "file"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <File className="w-3.5 h-3.5" />
                File Upload
              </div>
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "url"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Web Scraper
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "file" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Source Document</label>

                <div className="relative border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-12 transition-all hover:bg-slate-50 hover:border-slate-300 group flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden min-h-[220px]">
                  <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform pointer-events-none">
                    <Upload className="text-slate-500 w-5 h-5" />
                  </div>
                  
                  {file ? (
                    <div className="space-y-1 relative z-20 pointer-events-none">
                      <h4 className="text-sm font-semibold text-slate-800">{file.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">{formatFileSize(file.size)}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold mt-2 hover:underline pointer-events-auto cursor-pointer"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="relative z-20 pointer-events-none">
                      <h4 className="text-sm font-semibold text-slate-700">Click to select files, or drag & drop</h4>
                      <p className="text-xs text-slate-500 mt-1.5">Support for PDF, DOCX, XLSX, PPTX, and TXT files</p>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                </div>
              </div>

              <button
                onClick={() => handleUpload(false)}
                disabled={!file || uploading}
                className="btn-primary w-full py-2.5 flex items-center justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2.5" />
                    Analyzing Data Stream...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Commit Ingest Operations
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Website URL Ingestion</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="search-input block w-full pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">Provide target documentation root URL. Our AI scrapers crawl and index child paths index-wide in compliance with robots.txt.</p>
              </div>

              <button
                onClick={handleScrape}
                disabled={!url || scraping}
                className="btn-primary w-full py-2.5 flex items-center justify-center disabled:opacity-50"
              >
                {scraping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2.5" />
                    Scraping & Indexing Webpages...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Execute Scraper Crawler
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Message block */}
          {uploadStatus && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 border animate-fade-in ${
                uploadStatus === "success" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : "bg-rose-50 text-rose-800 border-rose-100"
              }`}
            >
              {uploadStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              )}
              <p className="text-xs font-semibold">{message}</p>
            </div>
          )}
        </div>

        {/* Guidelines Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700 mb-4 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                Guidelines
              </h4>
              <ul className="space-y-4">
                {activeTab === 'file' ? (
                  <>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Mask credentials, API keys and secrets.</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Confirm PDFs are searchable text formats.</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Structure files with headings for vector indexing.</p>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Ensure robots.txt allows public crawling.</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Only visible site text is indexed to embeddings.</p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="text-indigo-600 w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-normal">Recursive link crawl maps to the same domain.</p>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate compliance block */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Sanitization Compliant Node</h4>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Vector indexing processes sanitised documents only. Redact all private access credentials, database connection hooks, or personal employee detail blocks not relevant to model training.
          </p>
        </div>
      </div>

      {/* Sensitive Data Warning Modal */}
      <AnimatePresence>
        {showSensitivityWarning && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 border border-slate-200 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-600" />
              
              <div className="flex items-start gap-4 mb-5">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight uppercase">PII Leak Prevention Warn</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Our sanitization scanner flagged sensitive details in this file. Please audit these lines to prevent information exposure:
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 max-h-[180px] overflow-y-auto custom-scrollbar">
                <ul className="space-y-2">
                  {sensitivityWarnings.map((warning, idx) => (
                    <li key={idx} className="text-[10px] text-rose-700 font-mono leading-relaxed bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setFile(null);
                    setSensitivityFile(null);
                    setShowSensitivityWarning(false);
                    setSensitivityWarnings([]);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 font-bold text-xs rounded-lg border border-slate-200 cursor-pointer transition-colors"
                >
                  Discard File
                </button>
                <button
                  onClick={() => handleUpload(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer shadow-sm transition-all"
                >
                  Confirm Force Ingestion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
