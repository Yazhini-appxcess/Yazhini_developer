"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { API_URL } from "@/lib/api";
import WebsiteHeader from "@/components/layout/WebsiteHeader";
import {
    Shield,
    Zap,
    BarChart3,
    Cpu,
    ChevronRight,
    ArrowRight,
    Monitor,
    Database,
    Search,
    Users,
    Check,
    Plus,
    Minus,
    Star,
    Globe,
    Briefcase,
    HeartPulse,
    Scale
} from "lucide-react";

export default function WebsiteLandingPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const industries = [
        { icon: <Briefcase />, title: "Enterprise Operations", desc: "Automate complex workflows and document processing for large-scale operations.", color: "blue" },
        { icon: <Scale />, title: "Legal & Compliance", desc: "Intelligent contract analysis and regulatory tracking with high-precision AI agents.", color: "indigo" },
        { icon: <HeartPulse />, title: "Healthcare Systems", desc: "Secure data management and patient record intelligence following strict protocols.", color: "emerald" },
        { icon: <Globe />, title: "Global Logistics", desc: "Real-time supply chain analytics and predictive visibility across borders.", color: "amber" }
    ];

    const pricing = [
        { name: "Starter", price: "$49", period: "/mo", features: ["Up to 5 AI Agents", "10,000 Documents/mo", "Basic Analytics", "Email Support"], primary: false },
        { name: "Professional", price: "$199", period: "/mo", features: ["Unlimited AI Agents", "50,000 Documents/mo", "Advanced Analytics", "Priority Support", "Custom Integrations"], primary: true },
        { name: "Enterprise", price: "Custom", period: "", features: ["Full Platform Access", "Unlimited Volume", "Dedicated AI Strategist", "On-Premise Options", "SLA Guarantee"], primary: false }
    ];

    const faqs = [
        { q: "How secure is my data with Leucadia?", a: "We employ enterprise-grade encryption and individual data silos for every client. Your data is used only for your own AI agents and is never used to train global models." },
        { q: "Can I integrate with my existing CRM?", a: "Yes, Leucadia features native adapters for Salesforce, HubSpot, and all major ERP systems. Integration typically takes less than 30 minutes." },
        { q: "What kind of AI models do you use?", a: "We use a multi-agent orchestrated approach, utilizing state-of-the-art LLMs tailored to specific tasks, ensuring both speed and precision." }
    ];

    return (
        <div className="h-screen bg-[#020817] text-slate-100 font-sans selection:bg-blue-500/30 overflow-y-auto overflow-x-hidden">
            {/* Background Particles Decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[5%] w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute top-[40%] left-[15%] w-1 h-1 bg-indigo-500 rounded-full animate-pulse delay-700"></div>
                <div className="absolute top-[70%] left-[8%] w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[10%] w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-[60%] right-[20%] w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-1500"></div>
            </div>

            <WebsiteHeader />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] -mr-64 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -ml-64 -mb-32"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-inner">
                                <Zap size={14} className="fill-blue-400" />
                                <span>The Architecture of Future Operations</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05]">
                                Intelligence that <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 italic">transforms</span> industries.
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                                Leucadia is the specialized AI platform built for complex enterprise ecosystems, delivering high-precision automation where generic models fail.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/home" className="group w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:-translate-y-1">
                                    Get Started
                                    <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                                <button className="w-full sm:w-auto px-10 py-5 bg-slate-800/40 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all border border-slate-700 backdrop-blur-sm">
                                    View Case Studies
                                </button>
                            </div>
                        </div>

                        {/* Hero Mockup */}
                        <div className="mt-24 relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#050b1a] rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl">
                                <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="size-3.5 rounded-full bg-red-500/40"></div>
                                        <div className="size-3.5 rounded-full bg-amber-500/40"></div>
                                        <div className="size-3.5 rounded-full bg-emerald-500/40"></div>
                                    </div>
                                    <div className="bg-slate-900/80 px-10 py-1.5 rounded-lg text-[11px] text-slate-500 font-mono tracking-wider border border-slate-800/50">
                                        platform.leucadia.io/intelligence-hub
                                    </div>
                                    <div className="w-12"></div>
                                </div>
                                <div className="aspect-[16/9] bg-[#020610] flex flex-col p-6 overflow-hidden relative">
                                    {/* Mockup Dashboard Content */}
                                    <div className="absolute inset-0 bg-blue-500/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none"></div>

                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                                <Zap size={16} className="text-blue-400" />
                                            </div>
                                            <div className="h-4 w-32 bg-slate-800/40 rounded-full"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-24 bg-slate-800/40 rounded-lg"></div>
                                            <div className="h-8 w-8 bg-slate-800/40 rounded-lg"></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-4 flex-1">
                                        {/* Left Panels */}
                                        <div className="col-span-3 space-y-4">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 space-y-3">
                                                    <div className="h-2 w-16 bg-slate-800 rounded-full"></div>
                                                    <div className="h-6 w-24 bg-blue-500/10 rounded-lg border border-blue-500/20"></div>
                                                    <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-2/3"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Main Chart Area */}
                                        <div className="col-span-6 relative rounded-2xl border border-slate-800/50 bg-[#030a1c] p-6 group">
                                            <div className="absolute top-4 left-4 h-4 w-24 bg-slate-800/40 rounded-full"></div>
                                            <div className="h-full w-full flex items-end gap-1.5 px-2">
                                                {[40, 60, 45, 75, 55, 90, 65, 80, 50, 70, 85, 60, 75, 95].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-400/40 rounded-t-sm border-t border-x border-blue-500/30 transition-all duration-1000"
                                                        style={{ height: `${h}%` }}
                                                    ></div>
                                                ))}
                                            </div>
                                            {/* Overlay Visualizations */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                                <div className="size-48 rounded-full border border-blue-500/20 animate-[spin_20s_linear_infinite]"></div>
                                                <div className="absolute size-32 rounded-full border border-indigo-500/20 animate-[spin_10s_linear_reverse_infinite]"></div>
                                            </div>
                                        </div>

                                        {/* Right Detail Panel */}
                                        <div className="col-span-3 p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2">
                                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            </div>
                                            <div className="h-2 w-20 bg-slate-800 rounded-full mb-6"></div>
                                            <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="size-8 rounded-lg bg-slate-800/50"></div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <div className="h-1.5 w-full bg-slate-800/30 rounded-full"></div>
                                                            <div className="h-1.5 w-2/3 bg-slate-800/30 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-2">
                                                <div className="size-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                                                <div className="h-2 w-16 bg-slate-800 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Industry Solutions */}
                <section id="solutions" className="py-32 relative">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="mb-20">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Tailored for your <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">vertical</span>.</h2>
                            <p className="text-slate-400 text-xl max-w-2xl font-medium">One platform, infinite applications. We build AI that speaks the language of your specific industry.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {industries.map((ind, i) => (
                                <div key={i} className="group p-8 rounded-[2rem] bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-2">
                                    <div className={`size-14 rounded-2xl bg-${ind.color}-600/10 flex items-center justify-center text-${ind.color}-400 mb-8 border border-${ind.color}-500/20 group-hover:scale-110 group-hover:bg-${ind.color}-600/20 transition-all font-bold`}>
                                        {ind.icon}
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 tracking-tight">{ind.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{ind.desc}</p>
                                    <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#020817] group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-full w-fit">
                                        Learn More <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Reveal */}
                <section id="features" className="py-32 bg-[#050b1a]/50 border-y border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                            <div className="lg:col-span-5 space-y-10">
                                <div>
                                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">Advanced Platform <br /> Core</h2>
                                    <p className="text-slate-400 text-xl leading-relaxed">Everything you need to deploy, manage, and scale AI-powered initiatives across the enterprise.</p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { title: "Specialized Agents", desc: "LLMs optimized for specific workflow roles." },
                                        { title: "Smart Document IQ", desc: "Automated OCR and contextual understanding." },
                                        { title: "Real-time Operations", desc: "Low-latency processing and sync speeds." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 shadow-sm">
                                            <div className="mt-1 size-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                                <Check size={14} className="text-white font-bold" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                                                <p className="text-slate-500 text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-7">
                                <div className="grid grid-cols-2 gap-6 h-[500px]">
                                    <div className="space-y-6 flex flex-col justify-end">
                                        <div className="h-64 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                                <Cpu size={160} />
                                            </div>
                                            <h4 className="text-3xl font-black text-white leading-tight">Neural <br /> Architecture</h4>
                                        </div>
                                        <div className="h-40 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex items-center gap-4 group">
                                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:rotate-12 transition-transform">
                                                <Shield size={24} />
                                            </div>
                                            <span className="text-xl font-bold tracking-tight">SOC-2 Secured</span>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="h-40 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex items-center gap-4 group">
                                            <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:-rotate-12 transition-transform">
                                                <Zap size={24} />
                                            </div>
                                            <span className="text-xl font-bold tracking-tight">Ultra Fast</span>
                                        </div>
                                        <div className="h-96 bg-gradient-to-tr from-blue-600 to-blue-800 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                                            <div className="absolute -top-10 -left-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                                                <Globe size={240} />
                                            </div>
                                            <div>
                                                <p className="text-blue-200 text-xs font-black uppercase tracking-[0.3em] mb-4">Integrations</p>
                                                <h4 className="text-4xl font-black text-white mb-6">Connected <br /> Ecosystem</h4>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4">
                                                <div className="size-10 bg-white rounded-lg flex items-center justify-center font-black text-blue-600 text-xs shadow-xl">API</div>
                                                <span className="text-sm font-bold text-white">Universal Hub</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section */}
                <section id="analytics" className="py-32 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Powered by Precision.</h2>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">Identify leakage, optimize performance, and predict outcomes with surgical accuracy.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            <div className="lg:col-span-8 p-12 rounded-[3.5rem] bg-[#030a1c] border border-slate-800/80 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8">
                                    <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 text-xs font-black tracking-widest uppercase animate-pulse">Live Intelligence</div>
                                </div>

                                <div className="mb-16">
                                    <h3 className="text-3xl font-black mb-3">Sync Performance</h3>
                                    <p className="text-slate-500 font-medium">Processing across 12 distributed clusters</p>
                                </div>

                                <div className="h-64 flex items-end gap-3 px-2 group-hover:gap-4 transition-all">
                                    {[35, 65, 45, 85, 70, 95, 60, 50, 80, 40, 75, 55].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-full bg-gradient-to-t from-blue-600 to-indigo-400 shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-700" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 p-12 rounded-[3.5rem] bg-gradient-to-br from-slate-900 to-[#020610] border border-slate-800/80 flex flex-col justify-between">
                                <div>
                                    <div className="size-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-8 shadow-xl shadow-indigo-500/5">
                                        <BarChart3 size={32} />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4">Calculated <br /> Outcomes</h3>
                                    <p className="text-slate-500 text-base leading-relaxed font-semibold">Our engine processes millions of sync-points daily to ensure 99.98% valid outcomes.</p>
                                </div>

                                <div className="pt-10 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black tracking-widest uppercase text-slate-400">
                                            <span>Accuracy Rate</span>
                                            <span className="text-emerald-400">99.9%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[99.9%] bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black tracking-widest uppercase text-slate-400">
                                            <span>Processing Speed</span>
                                            <span className="text-blue-400">12ms avg</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div className="h-full w-[94%] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-32 relative bg-slate-100/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-24">
                            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Simple, transparent <span className="text-indigo-400 italic">plans</span>.</h2>
                            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Scale your operations with plans that grow exactly at your pace.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {pricing.map((p, i) => (
                                <div key={i} className={`p-10 rounded-[3rem] border transition-all ${p.primary ? 'bg-white text-slate-900 border-white scale-105 shadow-[0_40px_80px_rgba(255,255,255,0.1)] relative z-10' : 'bg-slate-900/50 text-white border-slate-800 hover:border-slate-700'}`}>
                                    <div className="mb-10 text-center">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-4 opacity-70">{p.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-5xl font-black">{p.price}</span>
                                            <span className="text-sm font-bold opacity-60">{p.period}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-12">
                                        {p.features.map((f, j) => (
                                            <div key={j} className="flex items-center gap-3">
                                                <Check size={18} className={p.primary ? 'text-blue-600' : 'text-blue-400'} />
                                                <span className="text-sm font-bold">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className={`w-full py-4 rounded-[1.5rem] font-black transition-all ${p.primary ? 'bg-slate-900 text-white hover:bg-black' : 'bg-white text-slate-900 hover:bg-slate-200 shadow-xl'}`}>
                                        Choose Plan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials / Social Proof */}
                <section className="py-32 overflow-hidden border-t border-slate-800/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Voted #1 Enterprise AI for 2026.</h2>
                                <div className="flex gap-1.5 mb-8">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} className="fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-xl italic text-slate-300 font-medium leading-relaxed">
                                    &quot;Leucadia didn&apos;t just automate our workflow; they transformed our entire operational logic. The precision and ROI were visible within 30 days.&quot;
                                </p>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden">
                                        <div className="w-full h-full bg-blue-600 flex items-center justify-center font-black text-white text-xs">JD</div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">Director of Operations</p>
                                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Fortune 500 Global</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-32 bg-slate-900/50 rounded-3xl border border-slate-800/50 flex items-center justify-center p-8">
                                        <div className="w-full h-4 bg-slate-800 rounded-full animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-32 relative">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Expert <span className="text-blue-500">answers</span>.</h2>
                            <p className="text-slate-400 text-xl font-medium">Clear answers for complex questions about our ecosystem.</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="rounded-3xl bg-slate-900/30 border border-slate-800/50 overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full p-8 flex items-center justify-between text-left group"
                                    >
                                        <span className="text-xl font-bold tracking-tight text-white/90">{faq.q}</span>
                                        <div className={`size-10 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-all ${activeFaq === i ? 'rotate-180' : ''}`}>
                                            {activeFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                                        </div>
                                    </button>
                                    {activeFaq === i && (
                                        <div className="px-8 pb-8 animate-fade-in">
                                            <div className="h-px bg-slate-800/80 mb-6 mx-0" />
                                            <p className="text-slate-400 text-lg leading-relaxed font-medium">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Footer Section */}
                <section className="py-40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/10 -z-10 bg-[url('/grid.svg')] opacity-5"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[4rem] p-16 md:p-24 text-center shadow-[0_50px_100px_rgba(37,99,235,0.2)] border border-white/10 relative group">
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                                <Zap size={300} />
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter text-white leading-tight">Ignite your <br /> vision <span className="underline decoration-white/20 underline-offset-[12px]">today</span>.</h2>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                <Link href="/login" className="px-12 py-6 bg-white text-slate-900 rounded-3xl font-black text-2xl hover:bg-slate-100 transition-all shadow-2xl hover:-translate-y-1">
                                    Launch 1.0
                                </Link>
                                <Link href="/home" className="px-12 py-6 bg-transparent border-2 border-white/20 text-white rounded-3xl font-bold text-2xl hover:bg-white/5 transition-all">
                                    View Docs
                                </Link>
                            </div>
                        </div>

                        <div className="mt-40 border-t border-slate-800/50 pt-20 flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="flex flex-col items-center md:items-start gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-blue-600/10 flex items-center justify-center p-2 border border-blue-500/20">
                                        <Image src="/LWWD.png" alt="Leucadia Logo" width={32} height={32} />
                                    </div>
                                    <span className="font-black text-2xl text-white tracking-tight">Leucadia</span>
                                </div>
                                <p className="text-slate-500 font-bold text-sm tracking-wide max-w-xs text-center md:text-left">Building the future of predictive enterprise intelligence.</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-16">
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Platform</p>
                                    <div className="flex flex-col gap-2.5 text-slate-500 font-bold text-sm">
                                        <a href="#" className="hover:text-white transition-colors">Integrations</a>
                                        <a href="#" className="hover:text-white transition-colors">Security</a>
                                        <a href="#" className="hover:text-white transition-colors">API Keys</a>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Company</p>
                                    <div className="flex flex-col gap-2.5 text-slate-500 font-bold text-sm">
                                        <a href="#" className="hover:text-white transition-colors">About Us</a>
                                        <a href="#" className="hover:text-white transition-colors">Careers</a>
                                        <a href="#" className="hover:text-white transition-colors">Press Hub</a>
                                    </div>
                                </div>
                                <div className="space-y-4 hidden lg:block">
                                    <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Legal</p>
                                    <div className="flex flex-col gap-2.5 text-slate-500 font-bold text-sm">
                                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                                        <a href="#" className="hover:text-white transition-colors">TOS</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-20 text-center text-slate-600 text-[11px] font-black uppercase tracking-[0.4em]">
                            © 2026 Leucadia Platforms. Engineered for Performance.
                        </div>
                    </div>
                </section>
            </main>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        html {
          scroll-behavior: smooth;
        }
        ::placeholder {
          color: #475569;
        }
      `}</style>

            {/* Re-inject Widget Script for the new page structure */}
            <Script
                src={`${API_URL}/api/bot/widget.js?type=external`}
                strategy="afterInteractive"
            />
        </div>
    );
}
