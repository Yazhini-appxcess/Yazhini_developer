"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth";
import { Trash2, Plus, Users, KeyRound, Shield, X, Check } from "lucide-react";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  user_type: string;
  permissions: string[];
  created_at: string;
  last_login: string | null;
}

export default function AdminManagementPage() {
  const { settings } = useTheme();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user_type: "admin",
  });
  const [submitting, setSubmitting] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [showPermissionPanel, setShowPermissionPanel] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [updatingPermissions, setUpdatingPermissions] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.is_superuser) {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    loadAdmins();
    loadPermissions();
  }, [router]);

  const loadPermissions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(apiUrl("api/admin/permissions"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailablePermissions(data);
      }
    } catch (err) {
      console.error("Failed to load permissions:", err);
    }
  };

  const loadAdmins = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl("api/admin/list"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
          router.push("/login");
          return;
        }
        throw new Error("Failed to load admins");
      }

      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentAdmins = admins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl("api/admin/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          permission_names: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create admin");
      }

      setFormData({ email: "", password: "", first_name: "", last_name: "", user_type: "admin" });
      setSelectedPermissions([]);
      setShowForm(false);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId || !newPassword) return;

    setResetSubmitting(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl(`api/admin/${selectedAdminId}/reset-password`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to reset password");
      }

      alert("Password reset successfully");
      setShowResetPassword(false);
      setNewPassword("");
      setSelectedAdminId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDelete = async (adminId: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl(`api/admin/${adminId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete admin");
    }
  };

  const handleTogglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const handleUpdateUserPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setUpdatingPermissions(true);
    setError("");

    try {
      const token = getAuthToken();
      const response = await fetch(apiUrl(`api/admin/${editingAdmin.id}/permissions`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permission_names: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update permissions");
      }

      setShowPermissionPanel(false);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permissions");
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#fafafa]">
        <CLSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Reading user mappings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <CLSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <CLHeader />

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
            
            {/* Page Header */}
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase font-display">Admin Management</h1>
                <p className="text-xs text-slate-500 mt-0.5 font-medium font-sans">Manage admin accounts and systems RBAC permissions</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* Create Admin Trigger Button */}
            <div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm) {
                    setSelectedPermissions([]);
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                {!showForm && <Plus className="w-4 h-4" />}
                {showForm ? "Cancel Operation" : "Create New Identity"}
              </button>
            </div>

            {/* Create Admin Form Section */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6"
                >
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-2 font-display">Register New Admin Node</h2>
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                          className="search-input w-full px-4 py-2.5 text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                          className="search-input w-full px-4 py-2.5 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="search-input w-full px-4 py-2.5 text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Security Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="search-input w-full px-4 py-2.5 text-xs font-semibold"
                      />
                    </div>

                    {/* User Type Selection */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Identity Type</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { id: 'admin', label: 'Admin Access', icon: Shield, desc: 'Full core governance' },
                          { id: 'user', label: 'Standard User', icon: Users, desc: 'Staff index viewer access' },
                          { id: 'custom', label: 'Custom Node', icon: KeyRound, desc: 'Custom security definitions' }
                        ].map((type) => (
                          <label
                            key={type.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                              formData.user_type === type.id || (type.id === 'custom' && !['admin', 'user'].includes(formData.user_type))
                                ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                                : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300"
                            }`}
                            onClick={() => {
                              if (type.id === 'admin') {
                                setFormData({ ...formData, user_type: 'admin' });
                                setSelectedPermissions(availablePermissions.map(p => p.name));
                              } else if (type.id === 'user') {
                                setFormData({ ...formData, user_type: 'user' });
                                const userPerms = availablePermissions
                                  .filter(p => p.name.includes('view') || p.name.includes('conversations') || p.name.includes('segments'))
                                  .map(p => p.name);
                                setSelectedPermissions(userPerms);
                              } else {
                                setFormData({ ...formData, user_type: '' });
                                setSelectedPermissions([]);
                              }
                            }}
                          >
                            <div className="flex items-center h-5">
                              <input
                                type="radio"
                                name="user_type_base"
                                checked={formData.user_type === type.id || (type.id === 'custom' && !['admin', 'user'].includes(formData.user_type))}
                                onChange={() => { }}
                                className="w-4 h-4 text-indigo-600 border-slate-300 bg-white focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <type.icon className={`w-4 h-4 ${(formData.user_type === type.id || (type.id === 'custom' && !['admin', 'user'].includes(formData.user_type))) ? "text-indigo-600" : "text-slate-500"}`} />
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                  {type.label}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {type.desc}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {!['admin', 'user'].includes(formData.user_type) && (
                        <div className="animate-fade-in mt-3">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Custom Type Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Guest, Analyst, etc."
                            value={formData.user_type}
                            onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                            required
                            className="search-input w-full max-w-sm px-4 py-2.5 text-xs font-semibold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Permissions Selection */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Access Governance <span className="text-[10px] font-medium text-slate-500 normal-case ml-2">(Customize specific node parameters)</span></h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availablePermissions.map((perm) => (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                              selectedPermissions.includes(perm.name)
                                ? "bg-indigo-50/40 border-indigo-200/80 shadow-sm"
                                : "bg-slate-50/30 border-slate-200/80 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.name)}
                                onChange={() => handleTogglePermission(perm.name)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 bg-white rounded focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {perm.name === "copilot_access"
                                  ? `${settings?.company_name || "Atlas"} Copilot`
                                  : perm.name === "users_access"
                                    ? "Admin Management"
                                    : perm.display_name}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-6"
                    >
                      {submitting ? "Registering Node..." : "Register Admin Identity"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Admins Table List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest font-display">Registered Administrator Nodes</h2>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse premium-table">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Node Operator</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Authority Type</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date Registered</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Last System Sync</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Operation Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-semibold">
                          <Users className="w-12 h-12 mx-auto mb-3 text-slate-400 animate-float" />
                          <p>No Administrator nodes indexed. Create a connection profile above.</p>
                        </td>
                      </tr>
                    ) : (
                      currentAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs font-bold text-slate-800">
                              {admin.first_name} {admin.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                              admin.user_type.toLowerCase() === 'admin'
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                : admin.user_type.toLowerCase() === 'user'
                                  ? "badge-internal"
                                  : "badge-external"
                            }`}>
                              {admin.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                            {formatDate(admin.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                            {formatDate(admin.last_login)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAdminId(admin.id);
                                  setShowResetPassword(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                                Reset Key
                              </button>
                              {!admin.is_superuser && (
                                <button
                                  onClick={() => {
                                    setEditingAdmin(admin);
                                    setSelectedPermissions(admin.permissions || []);
                                    setShowPermissionPanel(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                >
                                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                  RBAC
                                </button>
                              )}
                              {!admin.is_superuser && (
                                <button
                                  onClick={() => handleDelete(admin.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-650 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Node
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer block */}
              {admins.length > ITEMS_PER_PAGE && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Displaying <span className="text-slate-800 font-mono">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 font-mono">{Math.min(indexOfLastItem, admins.length)}</span> of <span className="text-slate-800 font-mono">{admins.length}</span> profiles
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1.5">
                      {(() => {
                        const maxButtons = 5;
                        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                        const end = Math.min(totalPages, start + maxButtons - 1);

                        if (end - start + 1 < maxButtons) {
                          start = Math.max(1, end - maxButtons + 1);
                        }

                        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                      })().map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                              : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset password glass dialogue */}
            <AnimatePresence>
              {showResetPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 w-full max-w-md text-left"
                  >
                    <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">Reset Node Key</h2>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password Key</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="search-input w-full px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(false)}
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={resetSubmitting}
                          className="btn-primary px-4 py-2 text-xs font-bold"
                        >
                          {resetSubmitting ? "Resetting Key..." : "Confirm Key Reset"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Permissions Panel (Sidebar Drawer) */}
            <AnimatePresence>
              {showPermissionPanel && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
                    onClick={() => setShowPermissionPanel(false)}
                  />

                  {/* Glass Panel Drawer */}
                  <motion.div
                    initial={{ opacity: 0, x: 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 200 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    className="relative w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col text-left"
                  >
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold shadow-sm">
                          {editingAdmin?.first_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Governance</h2>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{editingAdmin?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPermissionPanel(false)}
                        className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
                          Grant or revoke granular system permissions and RBAC access properties to this node operator interface.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {availablePermissions.map((perm) => (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.name)}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                              selectedPermissions.includes(perm.name)
                                ? "bg-indigo-50/30 border-indigo-200 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50/50 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-xs font-bold transition-colors ${
                                selectedPermissions.includes(perm.name) ? "text-indigo-700" : "text-slate-800"
                              }`}>
                                {perm.name === "copilot_access"
                                  ? `${settings?.company_name || "Atlas"} Copilot`
                                  : perm.name === "users_access"
                                    ? "Admin Management"
                                    : perm.display_name}
                              </span>
                              <span className="text-[10px] text-slate-500 line-clamp-2 max-w-[240px] leading-normal">
                                {perm.description}
                              </span>
                            </div>
                            <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-all ${
                              selectedPermissions.includes(perm.name)
                                ? "bg-indigo-600 text-white scale-105 shadow-md shadow-indigo-650/20"
                                : "bg-slate-50 text-transparent border border-slate-200 group-hover:bg-slate-100"
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex gap-3">
                      <button
                        onClick={() => setShowPermissionPanel(false)}
                        className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateUserPermissions}
                        disabled={updatingPermissions}
                        className="flex-1 py-2.5 btn-primary text-xs font-bold"
                      >
                        {updatingPermissions ? "Saving..." : "Apply Governance"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
