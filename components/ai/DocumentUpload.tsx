"use client";

import { useState } from "react";
import { Upload, File, X, CheckCircle2, AlertCircle, Globe, Link as LinkIcon } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";


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
    // Don't clear warning if we are forcing, but normally we might
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

      // Append force param if true
      const url = `${API_ENDPOINTS.documents.upload}${force ? '?force=true' : ''}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        setUploadStatus("success");
        setMessage(`Document "${fileToUpload.name}" uploaded and processed successfully!`);
        setFile(null);
        setSensitivityFile(null);
        setShowSensitivityWarning(false);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errorData = await res.json();
        console.log("Upload error response:", errorData); // Debugging

        // Check for sensitive data warning
        let detail = errorData.detail;

        // Try to parse if string (handles potential stringified JSON or Python dict string)
        if (typeof detail === 'string') {
          try {
            // Formatting hack: Python dicts use single quotes, JSON uses double. 
            // This is a best-effort to parse if it looks like a dict string.
            if (detail.includes("'code': 'SENSITIVE_DATA_DETECTED'")) {
              detail = JSON.parse(detail.replace(/'/g, '"'));
            } else {
              detail = JSON.parse(detail);
            }
          } catch (e) {
            // If parsing fails, just keep as string
          }
        }

        const isSensitiveData = detail && (detail.code === "SENSITIVE_DATA_DETECTED" || (typeof detail === 'string' && detail.includes("SENSITIVE_DATA_DETECTED")));

        if (res.status === 400 && isSensitiveData) {
          // Use warnings from detail if available
          const warnings = detail.warnings || [];
          if (warnings.length === 0 && typeof detail === 'string') {
            // Extract warnings from string if parsing failed but we detected the code
            const match = detail.match(/warnings': \[(.*?)\]/);
            if (match && match[1]) {
              // Very rough extraction
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
          // Improve message extraction
          let paramsMsg = "Failed to upload document";
          if (typeof detail === 'string') {
            paramsMsg = detail;
          } else if (detail?.message) {
            paramsMsg = detail.message;
          }
          setMessage(paramsMsg);
        }
      }
    } catch (err: any) {
      setUploadStatus("error");
      setMessage(err.message || "Failed to upload document");
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
    } catch (err: any) {
      setUploadStatus("error");
      setMessage(err.message || "Failed to scrape website");
    } finally {
      setScraping(false);
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const [activeTab, setActiveTab] = useState<"file" | "url">("file");


  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Upload Knowledge for AI Training</h3>
          <p className="text-slate-500 mt-1">Enhance your AI model by feeding it corporate documentation or web content.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAgentType("external")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${agentType === 'external' ? 'bg-[#01284e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              External Assistant
            </button>
            <button
              onClick={() => setAgentType("internal")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${agentType === 'internal' ? 'bg-[#01284e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Copilot
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("file")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'file' ? 'bg-[#01284e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                File Upload
              </div>
            </button>
            <button
              onClick={() => setActiveTab("url")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'url' ? 'bg-[#01284e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Web Scraper
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Zone & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "file" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Upload File</label>

                <div className="relative border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl p-12 transition-all hover:bg-primary/10 group flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden min-h-[220px]">
                  <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform pointer-events-none">
                    <Upload className="text-primary w-8 h-8" />
                  </div>
                  {file ? (
                    <div className="space-y-1 relative z-20 pointer-events-none">
                      <h4 className="text-lg font-semibold text-slate-900">{file.name}</h4>
                      <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="text-xs text-red-500 font-bold mt-2 hover:underline pointer-events-auto"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="relative z-20 pointer-events-none">
                      <h4 className="text-lg font-semibold text-slate-900">Click to upload or drag and drop</h4>
                      <p className="text-sm text-slate-500 mt-2">Support for PDF, DOCX, XLSX, PPTX, and TXT files</p>
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
                className="w-full py-2.5 px-6 bg-[#01284e] text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2" />
                    Uploading and Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/documentation"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500">Provide the base URL of the website. The system will automatically crawl and index relevant internal content.</p>
              </div>

              <button
                onClick={handleScrape}
                disabled={!url || scraping}
                className="w-full py-2.5 px-6 bg-[#01284e] text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scraping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2" />
                    Scraping Website Content...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Start Crawling Website
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Message */}
          {uploadStatus && (
            <div
              className={`p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${uploadStatus === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                }`}
            >
              {uploadStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>

        {/* Right Column: Guidelines */}
        <div className="bg-primary/[0.03] rounded-2xl p-6 border border-primary/5 h-full flex flex-col">
          <h4 className="text-sm font-bold uppercase tracking-wider text-black mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
            {activeTab === 'file' ? 'Upload Guidelines' : 'Crawling Guidelines'}
          </h4>
          <ul className="space-y-4 flex-1">
            {activeTab === 'file' ? (
              <>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Ensure documents are clear of sensitive PII (Personal Identifiable Information).</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">PDFs should be text-searchable (not just scanned images).</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Maintain a consistent naming convention for better indexing.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Use clear headings and structured sections to improve AI comprehension.</p>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Ensure the target website allows crawling (check robots.txt).</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Information will be processed from text content only; images are ignored.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">The crawler will stay within the domain of the provided URL.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">Deep-crawling is enabled to ensure comprehensive knowledge capture from the target domain.</p>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Sensitive Data Warning Modal Overlay */}
      {showSensitivityWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border-t-4 border-red-500 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Critical Information Detected</h3>
                <p className="text-sm text-slate-600 mt-2">
                  The document contains sensitive information (PII/Secrets).
                  <strong> Please remove the detected lines from the document to prevent data leaks.</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-8 max-h-[200px] overflow-y-auto border border-slate-100">
              <ul className="space-y-2">
                {sensitivityWarnings.map((warning, idx) => (
                  <li key={idx} className="text-[11px] text-red-800 font-mono leading-relaxed bg-red-50/50 p-2 rounded">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setFile(null);
                  setSensitivityFile(null);
                  setShowSensitivityWarning(false);
                  setSensitivityWarnings([]);
                }}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Remove Document
              </button>
              <button
                onClick={() => handleUpload(true)}
                className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
