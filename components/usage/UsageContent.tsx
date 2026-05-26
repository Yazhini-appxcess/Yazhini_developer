"use client";

import React, { useState } from "react";
import {
    Server,
    Cpu,
    Database,
    Zap,
    BarChart3,
    CheckCircle2,
    HelpCircle,
    Shield
} from "lucide-react";

export default function UsageContent() {
    const [activeTab, setActiveTab] = useState<"openai" | "aws" | "examples">("openai");

    return (
        <div className="flex-1 bg-slate-50 h-full overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">System Usage & Pricing</h1>
                    <p className="text-slate-500 font-medium">Monitor API consumption and infrastructure costs.</p>
                </div>

                {/* Tabs Config */}
                <div className="bg-white rounded-2xl p-2 md:p-3 border border-slate-200 shadow-sm inline-flex gap-2">
                    <button
                        onClick={() => setActiveTab("openai")}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "openai"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <Zap size={18} />
                        OpenAI Model Pricing (API)
                    </button>
                    <button
                        onClick={() => setActiveTab("aws")}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "aws"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <Server size={18} />
                        AWS EC2 Usage
                    </button>
                    <button
                        onClick={() => setActiveTab("examples")}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === "examples"
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <HelpCircle size={18} />
                        AI Query Examples
                    </button>
                </div>

                {/* OpenAI Content */}
                {activeTab === "openai" && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Pricing Table */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Zap className="text-amber-500" />
                                    Model Pricing
                                </h3>
                                <p className="text-slate-500 text-sm font-medium mt-2">Pricing is per 1,000,000 tokens (≈ 750,000 words)</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-8 py-4">Model</th>
                                            <th className="px-8 py-4">Input Price</th>
                                            <th className="px-8 py-4">Output Price</th>
                                            <th className="px-8 py-4">Total (In + Out)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-100">
                                        {[
                                            { model: "GPT-5.2 Pro", input: "$21.00", output: "$168.00", total: "$189.00" },
                                            { model: "GPT-5.2", input: "$1.75", output: "$14.00", total: "$15.75" },
                                            { model: "GPT-5", input: "$1.25", output: "$10.00", total: "$11.25" },
                                            { model: "GPT-5 mini", input: "$0.25", output: "$2.00", total: "$2.25" },
                                            { model: "GPT-5 nano", input: "$0.05", output: "$0.40", total: "$0.45" },
                                            { model: "GPT-4.1", input: "$2.00", output: "$8.00", total: "$10.00" },
                                            { model: "GPT-4.1 mini", input: "$0.80", output: "$3.20", total: "$4.00" },
                                            { model: "GPT-4.1 nano", input: "$0.20", output: "$0.80", total: "$1.00" },
                                            { model: "GPT-4o", input: "$5.00", output: "$15.00", total: "$20.00" },
                                            { model: "GPT-4o mini", input: "$0.15", output: "$0.60", total: "$0.75" },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-4 text-slate-900 font-extrabold">{row.model}</td>
                                                <td className="px-8 py-4">{row.input}</td>
                                                <td className="px-8 py-4">{row.output}</td>
                                                <td className="px-8 py-4 text-emerald-600">{row.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Examples Content */}
                {activeTab === "examples" && (
                    <div className="space-y-12 animate-fade-in pb-10">
                        {/* Hero Section */}
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                                <Zap size={14} />
                                Unleash the Power of AI
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">How can I help you today?</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Our AI system is trained on your specific business data. Use these examples to get the best out of your assistant.
                            </p>
                        </div>

                        {/* Premium Category Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                {
                                    category: "Operational Hub",
                                    description: "Monitor internal workflows, task progress, and production schedules in real-time.",
                                    icon: <Cpu size={24} />,
                                    questions: [
                                        "Which production batches are currently delayed?",
                                        "Generate a summary of pending maintenance tasks.",
                                        "What is the average task completion time this week?",
                                        "Show me the resource allocation for the next 48 hours."
                                    ],
                                    color: "blue",
                                    bg: "bg-blue-600"
                                },
                                {
                                    category: "Financial Insights",
                                    description: "Deep dive into your ledger, revenue streams, and expense reports with natural language.",
                                    icon: <BarChart3 size={24} />,
                                    questions: [
                                        "What is our projected year-end revenue based on current growth?",
                                        "Extract all high-value invoices that are 30+ days overdue.",
                                        "Compare marketing spend against lead conversion ratios.",
                                        "Analyze the variance in opex for the last three months."
                                    ],
                                    color: "emerald",
                                    bg: "bg-emerald-600"
                                },
                                {
                                    category: "CRM & Sales Intelligence",
                                    icon: <Database size={24} />,
                                    description: "Leverage your Zoho CRM data to identify growth opportunities and deal risks.",
                                    questions: [
                                        "Who are the top 5 customers by high-probability deals?",
                                        "Summarize the latest interactions with the Acme account.",
                                        "Identify deals in the pipeline that lack recent follow-up activity.",
                                        "What is the conversion rate from 'Lead' to 'Quote' this month?"
                                    ],
                                    color: "amber",
                                    bg: "bg-amber-600"
                                },
                                {
                                    category: "Business Strategy",
                                    icon: <Shield size={24} />,
                                    description: "Analyze complex documents, contracts, and legal terms to mitigate business risk.",
                                    questions: [
                                        "Summarize the auto-renewal conditions for vendor contracts.",
                                        "Identify any liability clauses exceeding $1M in current agreements.",
                                        "What are the compliance requirements for the new regional project?",
                                        "Cross-reference payment terms across all active service level agreements."
                                    ],
                                    color: "violet",
                                    bg: "bg-violet-600"
                                }
                            ].map((cat, i) => (
                                <div key={i} className="group relative bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden flex flex-col">
                                    <div className="p-10 flex-1">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`w-14 h-14 rounded-2xl ${cat.bg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                                {cat.icon}
                                            </div>
                                            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 border border-slate-200 uppercase tracking-tighter">
                                                {cat.questions.length} Query Samples
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-slate-900 mb-3">{cat.category}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{cat.description}</p>
                                        
                                        <div className="space-y-4">
                                            {cat.questions.map((q, j) => (
                                                <div key={j} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group/q hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer">
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 group-hover/q:bg-primary transition-colors shrink-0"></div>
                                                    <p className="text-sm text-slate-700 font-bold leading-snug">&quot;{q}&quot;</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`h-2 w-full ${cat.bg} opacity-50`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AWS Content */}
                {activeTab === "aws" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Server size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">AWS EC2 – US East (N. Virginia)</h3>
                                    <p className="text-slate-500 text-sm font-medium">Linux On-Demand – 24/7 (720 hrs/month)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-lg mb-8">
                                <Database size={14} />
                                <span>Storage type: gp3 (~$0.08 per GB/month)</span>
                            </div>

                            <div className="space-y-12">
                                {[
                                    {
                                        title: "8 GB Storage",
                                        rows: [
                                            { type: "t3.small", vcpu: 2, ram: "2 GB", compute: "~$15.00", storage: "~$0.64", total: "~$15.64" },
                                            { type: "t3.medium", vcpu: 2, ram: "4 GB", compute: "~$30.00", storage: "~$0.64", total: "~$30.64" },
                                            { type: "t3.large", vcpu: 2, ram: "8 GB", compute: "~$60.00", storage: "~$0.64", total: "~$60.64" },
                                            { type: "t3.xlarge", vcpu: 4, ram: "16 GB", compute: "~$120.00", storage: "~$0.64", total: "~$120.64" },
                                            { type: "t3.2xlarge", vcpu: 8, ram: "32 GB", compute: "~$240.00", storage: "~$0.64", total: "~$240.64" },
                                        ]
                                    },
                                    {
                                        title: "16 GB Storage",
                                        rows: [
                                            { type: "t3.small", vcpu: 2, ram: "2 GB", compute: "~$15.00", storage: "~$1.28", total: "~$16.28" },
                                            { type: "t3.medium", vcpu: 2, ram: "4 GB", compute: "~$30.00", storage: "~$1.28", total: "~$31.28" },
                                            { type: "t3.large", vcpu: 2, ram: "8 GB", compute: "~$60.00", storage: "~$1.28", total: "~$61.28" },
                                            { type: "t3.xlarge", vcpu: 4, ram: "16 GB", compute: "~$120.00", storage: "~$1.28", total: "~$121.28" },
                                            { type: "t3.2xlarge", vcpu: 8, ram: "32 GB", compute: "~$240.00", storage: "~$1.28", total: "~$241.28" },
                                        ]
                                    },
                                    {
                                        title: "20 GB Storage",
                                        rows: [
                                            { type: "t3.small", vcpu: 2, ram: "2 GB", compute: "~$15.00", storage: "~$1.60", total: "~$16.60" },
                                            { type: "t3.medium", vcpu: 2, ram: "4 GB", compute: "~$30.00", storage: "~$1.60", total: "~$31.60" },
                                            { type: "t3.large", vcpu: 2, ram: "8 GB", compute: "~$60.00", storage: "~$1.60", total: "~$61.60" },
                                            { type: "t3.xlarge", vcpu: 4, ram: "16 GB", compute: "~$120.00", storage: "~$1.60", total: "~$121.60" },
                                            { type: "t3.2xlarge", vcpu: 8, ram: "32 GB", compute: "~$240.00", storage: "~$1.60", total: "~$241.60" },
                                        ]
                                    }
                                ].map((table, tIndex) => (
                                    <div key={tIndex}>
                                        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="text-emerald-500" size={18} />
                                            {table.title}
                                        </h4>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-200">
                                                        <th className="px-6 py-3">Instance</th>
                                                        <th className="px-6 py-3">vCPU</th>
                                                        <th className="px-6 py-3">RAM</th>
                                                        <th className="px-6 py-3">Monthly Compute</th>
                                                        <th className="px-6 py-3">Storage</th>
                                                        <th className="px-6 py-3">Total / Month</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
                                                    {table.rows.map((row, rIndex) => (
                                                        <tr key={rIndex} className="hover:bg-slate-50">
                                                            <td className="px-6 py-3 font-bold text-slate-900">{row.type}</td>
                                                            <td className="px-6 py-3">{row.vcpu}</td>
                                                            <td className="px-6 py-3">{row.ram}</td>
                                                            <td className="px-6 py-3">{row.compute}</td>
                                                            <td className="px-6 py-3">{row.storage}</td>
                                                            <td className="px-6 py-3 font-bold text-slate-900">{row.total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
