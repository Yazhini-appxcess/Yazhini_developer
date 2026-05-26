"use client";

import React from "react";
import UsageContent from "@/components/usage/UsageContent";
import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";

export default function UsagePage() {
  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <CLSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <CLHeader />
        <UsageContent />
      </div>
    </div>
  );
}
