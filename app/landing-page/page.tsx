/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import axios from "axios";
import { API_URL } from "@/lib/api";
import WebsiteHeader from "@/components/layout/WebsiteHeader";
import {
    Shield,
    Zap,
    BarChart3,
    Cpu,
    ChevronRight,
    ArrowRight,
    Search,
    Users,
    Check,
    Plus,
    Minus,
    Star,
    Globe,
    Briefcase,
    HeartPulse,
    Scale,
    Droplets,
    Activity,
    Info,
    Layout,
    Layers,
    Mail,
    Phone
} from "lucide-react";



const IconMap: any = {
    Shield: <Shield />,
    Zap: <Zap />,
    BarChart3: <BarChart3 />,
    Cpu: <Cpu />,
    Search: <Search />,
    Users: <Users />,
    Globe: <Globe />,
    Briefcase: <Briefcase />,
    HeartPulse: <HeartPulse />,
    Scale: <Scale />,
    Droplets: <Droplets />,
    Activity: <Activity />,
    Info: <Info />,
    Layout: <Layout />,
    Layers: <Layers />,
    Mail: <Mail />,
    Phone: <Phone />,
    Home: <Briefcase />
};

export default function DynamicLandingPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/website/config`);
            setConfig(response.data);
        } catch (error) {
            console.error("Error fetching website config:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !config) {
        return (
            <div className="h-screen bg-[#020817] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-inner">
                            <Zap size={14} className="fill-blue-400" />
                            <span>{config.hero_subtitle}</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1] text-white">
                            {config.hero_title}
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
                            {config.hero_description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href={config.hero_cta_link} className="group w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:-translate-y-1">
                                {config.hero_cta_text}
                                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            <Link href={config.hero_secondary_cta_link} className="w-full sm:w-auto px-10 py-5 bg-slate-800/40 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all border border-slate-700 backdrop-blur-sm">
                                {config.hero_secondary_cta_text}
                            </Link>
                        </div>

                        {/* Hero Image Mockup */}
                        <div className="mt-24 relative group mx-auto max-w-5xl">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#050b1a] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                                <img
                                    src={config.hero_image_url}
                                    className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                    alt="Hero Mockup"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-32 relative border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">{config.about_title}</h2>
                                <p className="text-blue-400 text-xl font-bold tracking-tight uppercase">{config.about_subtitle}</p>
                            </div>
                            <p className="text-slate-400 text-xl leading-relaxed font-medium">
                                {config.about_description}
                            </p>
                            <p className="text-slate-500 text-lg italic bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                                &quot;{config.about_mission}&quot;
                            </p>
                            <Link href={config.about_cta_link} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                {config.about_cta_text} <ChevronRight size={18} />
                            </Link>
                        </div>
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
                            <img src={config.about_image_url} className="relative z-10 w-full rounded-[3rem] border border-white/10 shadow-2xl" alt="About" />
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" className="py-32 bg-[#050b1a]/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-20 text-center">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{config.services_title}</h2>
                            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">{config.services_description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {config.services_list.map((service: any, i: number) => (
                                <div key={i} className="group p-10 rounded-[2.5rem] bg-[#020817] border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2">
                                    <div className="size-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-600/30 transition-all">
                                        {IconMap[service.icon] || <Layers />}
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 tracking-tight text-white">{service.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features / Community Section */}
                <section id="community" className="py-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">{config.features_title}</h2>
                                <p className="text-slate-400 text-xl font-medium leading-relaxed">{config.features_description}</p>
                            </div>
                            <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                                {config.features_cta_text}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {config.features_list.map((feature: any, i: number) => (
                                <div key={i} className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 backdrop-blur-sm group hover:border-white/20 transition-all">
                                    <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform">
                                        {IconMap[feature.icon] || <Activity />}
                                    </div>
                                    <h4 className="text-2xl font-black mb-3 tracking-tight text-white">{feature.title}</h4>
                                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase opacity-70 mb-4">{feature.description}</p>
                                    <div className="h-1 w-12 bg-blue-600 rounded-full group-hover:w-full transition-all duration-700"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            {config.stats_list.map((stat: any, i: number) => (
                                <div key={i} className="text-center group">
                                    <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter group-hover:scale-110 transition-transform">{stat.label}</div>
                                    <div className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-1">{stat.value}</div>
                                    <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{stat.sublabel}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[4rem] p-16 md:p-24 text-center shadow-[0_50px_100px_rgba(37,99,235,0.2)] border border-white/10 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                                <Zap size={300} />
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter text-white leading-tight">
                                {config.cta_title}
                            </h2>
                            <p className="text-blue-100/70 text-xl md:text-2xl font-medium mb-16 max-w-3xl mx-auto leading-relaxed">
                                {config.cta_description}
                            </p>
                            <Link href={config.cta_button_link} className="inline-block px-12 py-6 bg-white text-slate-900 rounded-3xl font-black text-2xl hover:bg-slate-100 transition-all shadow-2xl hover:-translate-y-1">
                                {config.cta_button_text}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="pt-20 pb-10 bg-[#010614] border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-20 mb-20">
                            <div className="max-w-sm space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-blue-600/10 flex items-center justify-center p-2 border border-blue-500/20">
                                        <img src={config.logo_url} alt="Logo" className="size-full object-contain" />
                                    </div>
                                    <span className="font-black text-3xl text-white tracking-tight">{config.company_name}</span>
                                </div>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed">{config.footer_about}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 flex-1">
                                {config.footer_columns.map((col: any, i: number) => (
                                    <div key={i} className="space-y-6">
                                        <p className="text-xs font-black text-white uppercase tracking-[0.3em] opacity-50">{col.title}</p>
                                        <div className="flex flex-col gap-4 text-slate-400 font-bold text-sm">
                                            {col.links.map((link: any, j: number) => (
                                                <a key={j} href={link.href} className="hover:text-blue-400 transition-colors w-fit">{link.name}</a>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="space-y-6">
                                    <p className="text-xs font-black text-white uppercase tracking-[0.3em] opacity-50">Legal</p>
                                    <div className="flex flex-col gap-4 text-slate-400 font-bold text-sm">
                                        <Link href={config.footer_privacy_link} className="hover:text-blue-400 transition-colors w-fit">Privacy Policy</Link>
                                        <Link href={config.footer_terms_link} className="hover:text-blue-400 transition-colors w-fit">Terms of Service</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                                {config.footer_copyright}
                            </div>
                            <div className="flex gap-8">
                                {config.footer_social_links.map((link: any, i: number) => (
                                    <a key={i} href={link.url} className="text-slate-500 hover:text-white transition-colors capitalize text-xs font-black tracking-widest">{link.platform}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>

            <Script
                src={`${API_URL}/api/bot/widget.js?type=external`}
                strategy="afterInteractive"
            />
        </div>
    );
}
