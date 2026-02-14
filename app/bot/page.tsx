"use client";

import CLSidebar from "@/components/layout/DabangSidebar";
import CLHeader from "@/components/layout/DabangHeader";
import AIChatInterface from "@/components/ai/AIChatInterface";

export default function BotPage() {
    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden">
            {/* Left Sidebar */}
            <CLSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <CLHeader />

                {/* Chat Interface Container - Full Screen */}
                <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
                    <AIChatInterface
                        className="w-full h-full border-none shadow-none rounded-none"
                        style={{ height: '100%', width: '100%' }}
                        initialView="chat"
                    />
                </div>
            </div>
        </div>
    );
}
