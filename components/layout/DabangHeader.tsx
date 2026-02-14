"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminUser, removeAuthToken } from "@/lib/auth";

export default function CLHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const user = getAdminUser();
    setAdminUser(user);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const getPageTitle = () => {
    switch (pathname) {
      case "/": return "Dashboard";
      case "/ai": return "Upload Hub";
      case "/bot": return "Leucadia Copilot";
      case "/documents": return "Document Library";
      case "/messages": return "Conversations";
      case "/sage-300": return "Sage Connect";
      case "/procore": return "Procore";
      case "/database/postgresql": return "PostgreSQL";
      case "/database/mysql": return "MySQL";
      case "/database/sqlserver": return "SQL Server";
      case "/database/mongodb": return "MongoDB";
      case "/database/oracle": return "Oracle DB";
      case "/database/supabase": return "Supabase";
      case "/api-docs": return "API Connector";
      case "/database-hub": return "Database Hub";
      case "/database": return "Database Integration";
      case "/erp": return "ERP Hub";
      case "/crm": return "CRM Hub";
      case "/crm/zoho": return "Zoho CRM";
      case "/crm/salesforce": return "Salesforce";
      case "/crm/hubspot": return "HubSpot";
      case "/crm/pipedrive": return "Pipedrive";
      case "/erp/oracle": return "Oracle ERP Cloud";
      case "/erp/sap": return "SAP Business One";
      case "/admin-management": return "Admin Management";
      default: return "Dashboard";
    }
  };

  const getSubTitle = () => {
    switch (pathname) {
      case "/ai": return "Manage your document ingestion";
      case "/bot": return "Interact with your AI assistant";
      case "/documents": return "Archive of processed knowledge";
      case "/sage-300": return "Enterprise ERP Configuration";
      case "/procore": return "Project Management Integration";
      case "/database/postgresql": return "Secure relational indexing";
      case "/database/mysql": return "High-performance record sync";
      case "/database/sqlserver": return "Enterprise SQL connectivity";
      case "/database/mongodb": return "Flexible document grounding";
      case "/database/oracle": return "Legacy enterprise knowledge";
      case "/database/supabase": return "Modern vector-ready Postgres";
      case "/api-docs": return "Manage custom outbound integrations";
      case "/database-hub": return "Connect structured knowledge sources";
      case "/database": return "Connect structured data sources";
      case "/erp": return "Enterprise environment integrations";
      case "/crm": return "Customer relationship management";
      case "/crm/zoho": return "Sync customer relationship data";
      case "/crm/salesforce": return "Enterprise CRM integration";
      case "/crm/hubspot": return "Inbound marketing and sales";
      case "/crm/pipedrive": return "Pipeline and sales management";
      case "/erp/oracle": return "Fusion cloud resource data";
      case "/erp/sap": return "ERP service layer connection";
      case "/admin-management": return "System access and permissions";
      default: return "Platform Overview & Metrics";
    }
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-10 border-b border-slate-100">
      <div className="flex items-center space-x-4">
        {pathname !== "/" && (
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer group"
          >
            <span className="material-icons-round text-xl group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900">{getPageTitle()}</h2>
          <p className="text-xs text-slate-500">{getSubTitle()}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-[#01284e]/20 focus:border-[#01284e] w-64 transition-all outline-none text-slate-600"
            placeholder="Search data..."
            type="text"
          />
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">
              {adminUser?.is_superuser ? "Super Admin" : (adminUser?.first_name || "Admin")}
            </p>
            <p className="text-xs text-slate-500">
              {adminUser?.email || "admin@leucadia.com"}
            </p>
          </div>

          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
              <span className="material-icons-round text-slate-600">person</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <span className="material-icons-round">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
