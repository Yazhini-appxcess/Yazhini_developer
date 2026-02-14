"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CLSidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const [isErpOpen, setIsErpOpen] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = () => {
      const adminUser = localStorage.getItem("admin_user");
      if (adminUser) {
        try {
          const user = JSON.parse(adminUser);
          if (user.is_superuser) {
            setIsSuperAdmin(true);
          }
        } catch (e) {
          console.error("Error parsing admin user:", e);
        }
      }
    };

    checkSuperAdmin();
    window.addEventListener("storage", checkSuperAdmin);
    return () => window.removeEventListener("storage", checkSuperAdmin);
  }, []);

  const mainMenuItems = [
    { name: "Dashboard", href: "/", icon: "grid_view" },
    { name: "Leucadia Copilot", href: "/bot", icon: "smart_toy" },
    { name: "Upload Hub", href: "/ai", icon: "cloud_upload" },
    { name: "Document Library", href: "/documents", icon: "description" },
    { name: "Conversations", href: "/messages", icon: "forum" },
    ...(isSuperAdmin ? [{ name: "Admin Management", href: "/admin-management", icon: "manage_accounts" }] : []),
  ];

  const erpItems = [
    { name: "Sage Connect", href: "/sage-300", logo: "https://www.google.com/s2/favicons?domain=sage.com&sz=128" },
    { name: "Procore", href: "/procore", logo: "https://www.google.com/s2/favicons?domain=procore.com&sz=128" },
    { name: "Oracle ERP", href: "/erp/oracle", logo: "https://www.vectorlogo.zone/logos/oracle/oracle-icon.svg" },
    { name: "SAP Business One", href: "/erp/sap", logo: "https://www.vectorlogo.zone/logos/sap/sap-icon.svg" },
  ];

  const systemItems = [
    { name: "Database Hub", href: "/database-hub", icon: "storage" },
    { name: "API", href: "/api-docs", icon: "api" },
  ];

  const crmItems = [
    { name: "Zoho CRM", href: "/crm/zoho", logo: "https://www.vectorlogo.zone/logos/zoho/zoho-icon.svg" },
    { name: "Salesforce", href: "/crm/salesforce", logo: "https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg" },
    { name: "HubSpot", href: "/crm/hubspot", logo: "https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg" },
    { name: "Pipedrive", href: "/crm/pipedrive", logo: "https://www.google.com/s2/favicons?domain=pipedrive.com&sz=128" },
  ];



  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <aside className="w-64 bg-[#01284e] text-white flex-shrink-0 flex flex-col hidden lg:flex">
      <div className="p-4 flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
          <Image
            src="/LWWD_Logo.jpg"
            alt="CL Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight tracking-tight">LEUCADIA</h1>
          <p className="text-[10px] uppercase tracking-widest text-blue-200/70 font-semibold">Wastewater District</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto no-scrollbar pb-10">
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all mb-1 ${isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="material-icons-round text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <div className="pt-6 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/40">Integration</p>
            </div>

            {/* Integration Hubs */}
            <Link
              href="/erp"
              className={`flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all mb-1 ${pathname.startsWith('/erp') || pathname === '/sage-300' || pathname === '/procore'
                ? "bg-white/10 text-white shadow-sm"
                : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="material-icons-round text-xl">business_center</span>
              <span>ERP Hub</span>
            </Link>

            <Link
              href="/crm"
              className={`flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all mb-1 ${pathname.startsWith('/crm')
                ? "bg-white/10 text-white shadow-sm"
                : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="material-icons-round text-xl">account_tree</span>
              <span>CRM Hub</span>
            </Link>

            {/* Separate System Items */}
            {systemItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <span className="material-icons-round text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>


    </aside >
  );
}
