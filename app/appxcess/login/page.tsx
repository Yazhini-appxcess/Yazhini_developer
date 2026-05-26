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
      bgClass="min-h-screen flex items-center justify-center bg-[#0c32ed]"
      cardClass="bg-white p-8 rounded-2xl shadow-2xl w-full border border-slate-200"
      emailLabelClass="block text-sm font-medium text-slate-700 mb-1"
      passwordLabelClass="block text-sm font-medium text-slate-700 mb-1"
      emailInputClass="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0c32ed]/20 focus:border-[#0c32ed] outline-none transition-all"
      passwordInputClass="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0c32ed]/20 focus:border-[#0c32ed] outline-none transition-all"
      buttonClass="w-full bg-[#0c32ed] text-white py-2 rounded-lg font-semibold hover:bg-[#0a2bcc] transition-colors disabled:opacity-50"
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
