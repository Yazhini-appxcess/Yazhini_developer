"use client";

import { API_URL } from "@/lib/api";
import { checkAppXcessAuthStatus } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export default function AppXcessLoginPage() {
  return (
    <LoginForm
      logoUrl="/appxcess_logo.png"
      logoAlt="AppXcess Logo"
      title="AppXcess Access"
      subtitle="System Owner Login"
      bgClass="min-h-screen flex items-center justify-center bg-white relative z-10"
      cardClass="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm w-full max-w-md relative z-10"
      emailLabelClass="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
      passwordLabelClass="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
      emailInputClass="search-input w-full px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#0c32ed]/20"
      passwordInputClass="search-input w-full px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#0c32ed]/20"
      buttonClass="w-full bg-[#0c32ed] text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-[#0a2bcc] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
      emailPlaceholder="superadmin@appxcess.com"
      passwordPlaceholder="••••••••"
      loginApiEndpoint={`${API_URL}/api/appxcess/login`}
      tokenStorageKey="appxcess_token"
      userStorageKey={null}
      redirectPath="/appxcess/dashboard"
      authCheckFn={checkAppXcessAuthStatus}
      buttonText="Access Dashboard"
      loadingButtonText="Verifying..."
    />
  );
}
