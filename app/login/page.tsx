"use client";

import { apiUrl } from "@/lib/api";
import { checkAuthStatus } from "@/lib/auth";
import { useTheme } from "@/context/ThemeContext";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { settings } = useTheme();

  return (
    <LoginForm
      logoUrl={settings?.logo_url || "/LWWD_Logo.jpg"}
      logoAlt="LEUCADIA Logo"
      title={settings?.company_name ? `${settings.company_name} Portal` : "Wastewater District Login"}
      subtitle="Enter your credentials to access the system"
      bgClass="min-h-screen flex items-center justify-center bg-white relative z-10"
      cardClass="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm w-full max-w-md relative z-10"
      emailLabelClass="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
      passwordLabelClass="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
      emailInputClass="search-input w-full px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
      passwordInputClass="search-input w-full px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
      buttonClass="w-full btn-primary py-2.5 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm cursor-pointer"
      emailPlaceholder="superadmin@gmail.com"
      passwordPlaceholder="Enter your password"
      loginApiEndpoint={apiUrl("api/admin/login")}
      tokenStorageKey="admin_token"
      userStorageKey="admin_user"
      redirectPath="/"
      authCheckFn={checkAuthStatus}
      buttonText="Login"
      loadingButtonText="Logging in..."
    />
  );
}
