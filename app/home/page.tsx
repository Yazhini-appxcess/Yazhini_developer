"use client";

import React, { useEffect } from "react";
import Script from "next/script";

const TAILWIND_CONFIG = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "sb-primary": "var(--primary, #01264b)",
                "sb-bg-light": "#f5f7f8",
                "sb-bg-dark": "#0f1923",
                "sb-secondary": "#8198b3",
                "sb-gold": "#B8860B",
                "sb-bronze": "#A07855",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1.5rem", "full": "9999px" },
            animation: {
                'sb-spin-slow': 'sb-spin 20s linear infinite',
                'sb-pulse-ring': 'sb-pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'sb-shimmer': 'sb-shimmer 3s ease-in-out infinite',
                'sb-data-stream': 'sb-data-stream 15s linear infinite',
                'sb-scroll-progress': 'sb-scroll-progress 3s ease-in-out infinite',
            },
            keyframes: {
                'sb-pulse-ring': {
                    '0%': { transform: 'scale(0.8)', opacity: '0.5' },
                    '100%': { transform: 'scale(1.5)', opacity: '0' },
                },
                'sb-shimmer': {
                    '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
                    '50%': { opacity: '0.8', filter: 'brightness(1.5)', transform: 'skewX(-2deg)' },
                },
                'sb-data-stream': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                'sb-scroll-progress': {
                    '0%': { width: '0%', left: '0%' },
                    '50%': { width: '100%', left: '0%' },
                    '100%': { width: '0%', left: '100%' },
                }
            }
        },
    },
};

export default function HomePage() {
    useEffect(() => {
        // Apply Tailwind config if script is already loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window as any;
        if (globalWindow.tailwind) {
            globalWindow.tailwind.config = TAILWIND_CONFIG;
        }

        // Reveal on scroll observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("sb-reveal-visible");
                }
            });
        }, observerOptions);

        document
            .querySelectorAll(".sb-reveal-on-scroll")
            .forEach((el) => observer.observe(el));

        // Mouse parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            const heroText = document.getElementById("hero-text-container");
            const hero3D = document.getElementById("hero-3d-container");
            if (heroText)
                heroText.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5
                    }px)`;
            if (hero3D)
                hero3D.style.transform = `translate(${moveX * -1.5}px, ${moveY * -1.5
                    }px)`;
        };

        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <div className="fixed inset-0 h-screen w-full overflow-y-auto overflow-x-hidden bg-sb-bg-light dark:bg-sb-bg-dark text-sb-primary dark:text-slate-50 font-display scroll-smooth">
                {/* External Resources */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />

                {/* Tailwind CDN and Config */}
                <Script
                    src="https://cdn.tailwindcss.com?plugins=forms,container-queries"
                    strategy="beforeInteractive"
                    onLoad={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const globalWindow = window as any;
                        if (globalWindow.tailwind) {
                            globalWindow.tailwind.config = TAILWIND_CONFIG;
                        }
                    }}
                />

                {/* Custom Styles */}
                <style
                    type="text/tailwindcss"
                    dangerouslySetInnerHTML={{
                        __html: `
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .sb-architectural-grid {
                background-image: 
                    linear-gradient(to right, rgba(129, 152, 179, 0.08) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(129, 152, 179, 0.08) 1px, transparent 1px);
                background-size: 80px 80px;
            }
            .sb-glass-card {
                @apply bg-white/10 backdrop-blur-xl border border-white/20;
            }
            .sb-glass-card-gold {
                @apply bg-white/5 backdrop-blur-md border border-sb-gold/30 hover:border-sb-gold transition-all duration-500;
            }
            .sb-text-glow {
                text-shadow: 0 0 15px rgba(184, 134, 11, 0.4);
            }
            .sb-nav-link::after {
                content: '';
                @apply absolute bottom-0 left-0 w-full h-0.5 bg-sb-gold transform scale-x-0 transition-transform duration-300 origin-right;
            }
            .sb-nav-link:hover::after {
                @apply scale-x-100 origin-left;
            }
            .sb-reveal-on-scroll {
                @apply opacity-0 translate-y-8 transition-all duration-1000;
            }
            .sb-reveal-visible {
                @apply opacity-100 translate-y-0;
            }
            .sb-video-overlay {
                background: linear-gradient(to bottom, rgba(1, 38, 75, 0.8), rgba(1, 38, 75, 0.6));
            }
            .sb-data-column {
                writing-mode: vertical-rl;
                text-orientation: mixed;
            }
            .sb-shimmer-text {
                animation: sb-shimmer 3s infinite;
                display: inline-block;
            }
            .sb-parallax {
                transition: transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
            }
          `,
                    }}
                />

                {/* HTML Content Converted to JSX */}
                <div className="fixed inset-0 sb-architectural-grid pointer-events-none z-0"></div>

                <header className="sticky top-0 z-50 w-full bg-sb-primary/95 backdrop-blur-xl text-white border-b border-white/5 px-4 md:px-20 lg:px-40 py-4 transition-all">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-9 bg-sb-gold flex items-center justify-center rounded-sm rotate-45">
                                <span className="material-symbols-outlined text-white text-2xl -rotate-45">
                                    architecture
                                </span>
                            </div>
                            <h2 className="text-2xl font-800 tracking-tighter uppercase font-display">
                                StrucBuild
                            </h2>
                        </div>
                        <nav className="hidden lg:flex items-center gap-12">
                            <a
                                className="sb-nav-link relative text-xs font-bold hover:text-sb-gold transition-colors uppercase tracking-[0.2em] py-1"
                                href="#"
                            >
                                Expertise
                            </a>
                            <a
                                className="sb-nav-link relative text-xs font-bold hover:text-sb-gold transition-colors uppercase tracking-[0.2em] py-1"
                                href="#"
                            >
                                Projects
                            </a>
                            <a
                                className="sb-nav-link relative text-xs font-bold hover:text-sb-gold transition-colors uppercase tracking-[0.2em] py-1"
                                href="#"
                            >
                                About Us
                            </a>
                            <a
                                className="sb-nav-link relative text-xs font-bold hover:text-sb-gold transition-colors uppercase tracking-[0.2em] py-1"
                                href="#"
                            >
                                Insights
                            </a>
                        </nav>
                        <button className="border border-sb-gold text-sb-gold px-8 py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-sb-gold hover:text-white transition-all">
                            Request Consultation
                        </button>
                    </div>
                </header>

                <main className="flex-1 relative z-10">
                    <section
                        className="relative w-full min-h-[95vh] flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#010a14] via-[#01264b] to-[#011a33]"
                        id="hero"
                    >
                        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                            <div
                                className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-sb-data-stream"
                                style={{ animationDelay: "1s" }}
                            ></div>
                            <div
                                className="absolute top-0 left-2/4 h-full w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-sb-data-stream"
                                style={{ animationDelay: "3s" }}
                            ></div>
                            <div
                                className="absolute top-0 left-3/4 h-full w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-sb-data-stream"
                                style={{ animationDelay: "5s" }}
                            ></div>
                            <div
                                className="absolute top-0 left-[15%] h-full w-px bg-gradient-to-b from-transparent via-sb-gold/40 to-transparent animate-sb-data-stream"
                                style={{ animationDelay: "0s", animationDuration: "12s" }}
                            ></div>
                            <div
                                className="absolute top-0 left-[85%] h-full w-px bg-gradient-to-b from-transparent via-sb-gold/40 to-transparent animate-sb-data-stream"
                                style={{ animationDelay: "2s", animationDuration: "18s" }}
                            ></div>
                            <div className="absolute top-10 left-[10%] text-[8px] text-blue-400/30 font-mono sb-data-column select-none">
                                40.7128° N, 74.0060° W // STRUCTURAL_LATENCY: 0.002ms //
                                GRID_STABILITY: 99.9%
                            </div>
                            <div className="absolute bottom-10 right-[10%] text-[8px] text-blue-400/30 font-mono sb-data-column select-none">
                                INFRA_LOAD: 84% // SYNC_ACTIVE // PROTOCOL_01264B
                            </div>
                        </div>
                        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-20 lg:px-40 pb-32 relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                                <div
                                    className="lg:col-span-7 sb-parallax"
                                    id="hero-text-container"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px w-12 bg-sb-gold"></div>
                                        <span className="text-sb-gold font-bold uppercase tracking-[0.4em] text-[10px]">
                                            Tier 1 Global Infrastructure
                                        </span>
                                    </div>
                                    <h1 className="text-white text-5xl md:text-8xl font-800 leading-[1] tracking-tight font-display mb-8">
                                        Engineering <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sb-gold to-white sb-shimmer-text">
                                            Tomorrow.
                                        </span>
                                    </h1>
                                    <p className="text-white/70 text-lg md:text-2xl font-light leading-relaxed mb-12 max-w-xl">
                                        We architect the backbone of modern civilization through
                                        precision-led development and sustainable heavy
                                        construction.
                                    </p>
                                    <div className="flex flex-wrap gap-8 items-center">
                                        <button className="bg-sb-gold text-white px-10 py-5 font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-sb-primary transition-all flex items-center gap-3 group relative overflow-hidden">
                                            View Our Portfolio
                                            <span className="material-symbols-outlined text-white group-hover:text-sb-primary transition-colors">
                                                arrow_forward
                                            </span>
                                        </button>
                                        <button className="group relative flex items-center gap-4 text-white font-bold text-sm uppercase tracking-widest">
                                            <span className="relative size-12 rounded-full border border-white/30 flex items-center justify-center group-hover:border-sb-gold transition-colors">
                                                <span className="absolute inset-0 rounded-full border border-sb-gold/50 animate-sb-pulse-ring"></span>
                                                <span className="material-symbols-outlined text-sb-gold">
                                                    play_arrow
                                                </span>
                                            </span>
                                            Our Capabilities
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="lg:col-span-5 relative hidden lg:block sb-parallax"
                                    id="hero-3d-container"
                                >
                                    <div className="relative w-full aspect-square flex items-center justify-center">
                                        <div
                                            className="relative w-64 h-96 animate-sb-spin-slow"
                                            style={{ transformStyle: "preserve-3d" }}
                                        >
                                            <svg
                                                className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                viewBox="0 0 200 400"
                                            >
                                                <path
                                                    className="opacity-80"
                                                    d="M40 380 L160 380 L180 340 L180 100 L100 20 L20 100 L20 340 Z"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="0.5"
                                                ></path>
                                                <path
                                                    className="opacity-40"
                                                    d="M20 100 L180 100 M20 140 L180 140 M20 180 L180 180 M20 220 L180 220 M20 260 L180 260 M20 300 L180 300 M20 340 L180 340"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="0.25"
                                                ></path>
                                                <path
                                                    className="opacity-40"
                                                    d="M60 100 L60 380 M100 20 L100 380 M140 100 L140 380"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="0.25"
                                                ></path>
                                                <circle cx="100" cy="20" fill="#3b82f6" r="2"></circle>
                                                <circle cx="60" cy="100" fill="#3b82f6" r="1.5"></circle>
                                                <circle
                                                    cx="140"
                                                    cy="100"
                                                    fill="#3b82f6"
                                                    r="1.5"
                                                ></circle>
                                                <circle
                                                    className="animate-pulse"
                                                    cx="100"
                                                    cy="220"
                                                    fill="#B8860B"
                                                    r="1.5"
                                                ></circle>
                                            </svg>
                                            <div className="absolute inset-0 border border-blue-500/20 rounded-full scale-125 -rotate-45 animate-pulse"></div>
                                            <div className="absolute inset-0 border border-sb-gold/20 rounded-full scale-150 rotate-12"></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                            <div className="w-80 h-96 sb-glass-card-gold rounded-xl -rotate-6 translate-x-8 blur-sm"></div>
                                            <div className="absolute w-80 h-96 sb-glass-card-gold rounded-xl rotate-3 -translate-x-8 blur-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-40 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-transparent via-sb-gold to-transparent animate-sb-scroll-progress w-1/3 absolute"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] max-w-[1200px] z-30">
                            <div className="sb-glass-card rounded-2xl p-10 shadow-2xl overflow-hidden border border-white/10 backdrop-blur-2xl bg-white/5">
                                <div className="flex items-center gap-6 mb-8 justify-center">
                                    <div className="h-px w-8 bg-sb-gold/40"></div>
                                    <span className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px]">
                                        Strategic Partners
                                    </span>
                                    <div className="h-px w-8 bg-sb-gold/40"></div>
                                </div>
                                <div className="flex flex-wrap justify-between items-center gap-12 opacity-70">
                                    <div className="flex items-center gap-2 hover:opacity-100 hover:text-sb-gold transition-all cursor-default">
                                        <span className="material-symbols-outlined text-2xl text-sb-gold">
                                            domain
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            METRO-CORP
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:opacity-100 hover:text-sb-gold transition-all cursor-default">
                                        <span className="material-symbols-outlined text-2xl text-sb-gold">
                                            foundation
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            BASE-TECH
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:opacity-100 hover:text-sb-gold transition-all cursor-default">
                                        <span className="material-symbols-outlined text-2xl text-sb-gold">
                                            apartment
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            URBAN-SYNERGY
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:opacity-100 hover:text-sb-gold transition-all cursor-default">
                                        <span className="material-symbols-outlined text-2xl text-sb-gold">
                                            precision_manufacturing
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            INDUS-GROUP
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:opacity-100 hover:text-sb-gold transition-all cursor-default">
                                        <span className="material-symbols-outlined text-2xl text-sb-gold">
                                            location_city
                                        </span>
                                        <span className="font-bold text-lg text-white">
                                            CITY-LINK
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="relative py-48 bg-sb-bg-light">
                        <div className="max-w-[1400px] mx-auto px-4 md:px-20 lg:px-40">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                                <div className="max-w-2xl">
                                    <span className="text-sb-gold font-bold uppercase tracking-[0.3em] text-xs">
                                        Our Areas of Impact
                                    </span>
                                    <h2 className="text-sb-primary text-5xl font-800 mt-4 font-display leading-tight">
                                        Sector-Leading <br />
                                        Technical Expertise
                                    </h2>
                                </div>
                                <div className="flex gap-12 items-center">
                                    <div className="text-center">
                                        <div className="text-6xl font-800 text-sb-primary sb-text-glow leading-none drop-shadow-md">
                                            2.4M
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-sb-secondary tracking-[0.2em] mt-3">
                                            Sq. Ft Developed
                                        </div>
                                    </div>
                                    <div className="w-px h-16 bg-sb-gold/20"></div>
                                    <div className="text-center">
                                        <div className="text-6xl font-800 text-sb-primary sb-text-glow leading-none drop-shadow-md">
                                            $4.8B
                                        </div>
                                        <div className="text-[10px] uppercase font-bold text-sb-secondary tracking-[0.2em] mt-3">
                                            Portfolio Value
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="group relative h-[500px] overflow-hidden rounded-2xl border border-sb-gold/20 hover:border-sb-gold transition-all duration-700 bg-white/40 backdrop-blur-md">
                                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <img
                                            alt="Industrial"
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRHE_v9iUfMXcx1_OuOOT9Z7YMo-LBjiGvCqICwjSJ6yfBVtFezLTRwESRzykQP_CrYadsI3SNBdf7Vb2ab78sY_n-yAXws0MBQ8ZdGD77OELmj_MrCBucyJqsu0P5YQ9U1flpb6JRSXQVz69wyl-evQIONqfioQbojrD5WEsrqQoHktHJI8pLfJx7hs6hmwurbHD9cKAXMO0Hu0WOYIZ25SsCE4mIsvcTerwurKwx6Eg4JIWGQI2ZhZq4n7eLnlhZXv4biZua-WA"
                                        />
                                    </div>
                                    <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent group-hover:from-sb-primary/80 group-hover:to-sb-primary/20 transition-all duration-500">
                                        <div className="size-16 bg-sb-gold/10 border border-sb-gold/20 rounded-xl flex items-center justify-center text-sb-gold mb-8 group-hover:bg-sb-gold group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-4xl">
                                                factory
                                            </span>
                                        </div>
                                        <h3 className="text-sb-primary group-hover:text-white text-3xl font-bold font-display tracking-tight mb-4 transition-colors">
                                            Industrial
                                        </h3>
                                        <p className="text-slate-500 group-hover:text-white/80 text-sm leading-relaxed mb-6 transition-colors">
                                            High-capacity logistics hubs and automated manufacturing
                                            plants designed for global scalability.
                                        </p>
                                        <a
                                            className="text-sb-gold group-hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                                            href="#"
                                        >
                                            Explore{" "}
                                            <span className="material-symbols-outlined text-sm">
                                                trending_flat
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div className="group relative h-[500px] overflow-hidden rounded-2xl border border-sb-gold/20 hover:border-sb-gold transition-all duration-700 bg-white/40 backdrop-blur-md">
                                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <img
                                            alt="Residential"
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD36xWRWpTKL8qHWb-u409YK72-lfzr_fIoeprLu8DiKxgO1RLnaqTFVYDmPD0s5h32EYp0TbpxhDm5hvrXKQePSyCX6ONQcG4LT6tR46A7lpET9OpUt4WzS015NSvn1Gch_G-eoonvgXi_3gFeo_beHyLX4jYiznSVVT0qiEQuaDfEXZP4zeQEyt2fDPHMDv70a5gUv2pYTTKueLURLFPS0iijEpCeNAmy3YPF6hH5RUpzzNfECObg07bW4igz_kDFWE5igNfnNrU"
                                        />
                                    </div>
                                    <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent group-hover:from-sb-primary/80 group-hover:to-sb-primary/20 transition-all duration-500">
                                        <div className="size-16 bg-sb-gold/10 border border-sb-gold/20 rounded-xl flex items-center justify-center text-sb-gold mb-8 group-hover:bg-sb-gold group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-4xl">
                                                apartment
                                            </span>
                                        </div>
                                        <h3 className="text-sb-primary group-hover:text-white text-3xl font-bold font-display tracking-tight mb-4 transition-colors">
                                            Residential
                                        </h3>
                                        <p className="text-slate-500 group-hover:text-white/80 text-sm leading-relaxed mb-6 transition-colors">
                                            Luxury master-planned developments and urban living
                                            solutions focused on integrity and community.
                                        </p>
                                        <a
                                            className="text-sb-gold group-hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                                            href="#"
                                        >
                                            Explore{" "}
                                            <span className="material-symbols-outlined text-sm">
                                                trending_flat
                                            </span>
                                        </a>
                                    </div>
                                </div>
                                <div className="group relative h-[500px] overflow-hidden rounded-2xl border border-sb-gold/20 hover:border-sb-gold transition-all duration-700 bg-white/40 backdrop-blur-md">
                                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <img
                                            alt="Infrastructure"
                                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdvrWzYs3fvndaEn8MwUjXcEIkBA6PvbB5s6y3JuGjksSJeHh4wzW4TWRzwuUDAH8dJIiH2r88P6ZHjBWmqJXuF3eVNdc3aKWcRQGS8G6fAbrqXIZYFrFAih4QQlJMmZ0TWJW3Wpjs6zlQ7j2Cn2bmi4VNpKBhzlmdhk-AlxzrOm8y__sFDaPQP_OJXLR2Up9u1qowYE11C_-m8IlpE0ip7tPOaLgqoAphncv6a_d7VaXyh-M1hqRD7wsVqFrb42aQBZpFjnn1nhc"
                                        />
                                    </div>
                                    <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end bg-gradient-to-t from-white/90 via-white/40 to-transparent group-hover:from-sb-primary/80 group-hover:to-sb-primary/20 transition-all duration-500">
                                        <div className="size-16 bg-sb-gold/10 border border-sb-gold/20 rounded-xl flex items-center justify-center text-sb-gold mb-8 group-hover:bg-sb-gold group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-4xl">
                                                engineering
                                            </span>
                                        </div>
                                        <h3 className="text-sb-primary group-hover:text-white text-3xl font-bold font-display tracking-tight mb-4 transition-colors">
                                            Infrastructure
                                        </h3>
                                        <p className="text-slate-500 group-hover:text-white/80 text-sm leading-relaxed mb-6 transition-colors">
                                            Strategic civil engineering for bridges, transit systems,
                                            and critical public networks.
                                        </p>
                                        <a
                                            className="text-sb-gold group-hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
                                            href="#"
                                        >
                                            Explore{" "}
                                            <span className="material-symbols-outlined text-sm">
                                                trending_flat
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="relative w-full h-[700px] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                alt="Drone background"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdvrWzYs3fvndaEn8MwUjXcEIkBA6PvbB5s6y3JuGjksSJeHh4wzW4TWRzwuUDAH8dJIiH2r88P6ZHjBWmqJXuF3eVNdc3aKWcRQGS8G6fAbrqXIZYFrFAih4QQlJMmZ0TWJW3Wpjs6zlQ7j2Cn2bmi4VNpKBhzlmdhk-AlxzrOm8y__sFDaPQP_OJXLR2Up9u1qowYE11C_-m8IlpE0ip7tPOaLgqoAphncv6a_d7VaXyh-M1hqRD7wsVqFrb42aQBZpFjnn1nhc"
                            />
                            <div className="absolute inset-0 sb-video-overlay z-10"></div>
                        </div>
                        <div className="relative z-20 text-center px-4 max-w-5xl sb-reveal-on-scroll">
                            <span className="text-sb-gold font-bold uppercase tracking-[0.5em] text-sm mb-6 block">
                                Industry Milestone
                            </span>
                            <h2 className="text-white text-6xl md:text-8xl font-800 font-display leading-tight mb-12 drop-shadow-2xl">
                                Building 25% of London&apos;s New Sustainable Transit Arteries
                            </h2>
                            <div className="flex justify-center">
                                <button className="bg-white text-sb-primary px-12 py-6 font-bold uppercase tracking-widest hover:bg-sb-gold hover:text-white transition-all shadow-xl">
                                    Download 2024 Impact Report
                                </button>
                            </div>
                        </div>
                    </section>
                    <section className="max-w-[1400px] mx-auto px-4 md:px-20 lg:px-40 py-48">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
                            <div>
                                <span className="text-sb-gold font-bold uppercase tracking-[0.3em] text-xs">
                                    Architectural Portfolio
                                </span>
                                <h2 className="text-sb-primary text-5xl font-800 mt-4 font-display">
                                    Landmark Achievements
                                </h2>
                            </div>
                            <a
                                className="text-sb-primary font-bold flex items-center gap-3 hover:gap-6 transition-all group border-b-2 border-sb-gold pb-2"
                                href="#"
                            >
                                Full Portfolio{" "}
                                <span className="material-symbols-outlined text-sb-gold group-hover:translate-x-2 transition-transform">
                                    trending_flat
                                </span>
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-8 relative group h-[700px] overflow-hidden sb-reveal-on-scroll">
                                <img
                                    alt="Zenith Bridge"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWqBjadsy_dSxNcOtRD_JzbcajVgHrifcG7riYkw7UtJBTt9BZJqbQjMlcFcM5gViVFNhzAYJGo9Dyf_rCJaTTqHujmHOyKJtwjJbYIaXpLX4DvePWma6w6QRhGjYKorfza7icS4Pfo-jNR7CwosHSkCdTrjWqqhjSTMkHJKI9ABRwK2RSWanpkWgs0Xe-9YN0WZVLPpvSLRVT8u16Uj87NBP1h_3LG-iOKpMgrNg7V_iIvvohOMMhz5Fh-WBK_84NiPB75IOTNI"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-sb-primary/90 via-transparent to-transparent opacity-80"></div>
                                <div className="absolute top-10 right-10 flex gap-2">
                                    <span className="bg-sb-gold text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        Sustainability
                                    </span>
                                    <span className="bg-sb-primary/80 backdrop-blur text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        Infrastructure
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 p-12 w-full">
                                    <h3 className="text-white text-4xl font-800 font-display mb-4">
                                        The Zenith Bridge Expansion
                                    </h3>
                                    <p className="text-white/60 max-w-md text-sm mb-6">
                                        A monumental engineering feat across the Thames, utilizing
                                        carbon-neutral concrete and advanced structural monitoring.
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <span className="text-sb-gold text-xs font-bold uppercase tracking-widest">
                                            London, UK
                                        </span>
                                        <div className="h-px w-12 bg-white/20"></div>
                                        <span className="text-white/40 text-xs uppercase tracking-widest font-bold">
                                            Completed 2024
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-4 flex flex-col gap-8">
                                <div
                                    className="relative group h-[334px] overflow-hidden sb-reveal-on-scroll"
                                    style={{ transitionDelay: "100ms" }}
                                >
                                    <img
                                        alt="Apex Logistics"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn-Syf_IFlBME-ctkPFBFbo4Up4HcPzOLmOQQWc4iXnrlFSityObI7VsW_6MR5Kp8lR1zB784rX2cJ2NtvDSbd_vjYiTni4SuDJ_XMF5hRPz_tQyZ2LOoOwXz4oOsFIz6IXXwVUi2eOYbPK9LLWaqQFQRfyLKIGVsXNBYkOvdIRAR7Tx8vuIB0ArGyCLgJFtcDwg678mCxx9LfRnOAglqD5w7g3aVbixcOsY2RT69Zcb2AmAOEBuXxWkqsrwTM7Fv5mH81OLPReWg"
                                    />
                                    <div className="absolute inset-0 bg-sb-primary/40 group-hover:bg-sb-primary/20 transition-all"></div>
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className="bg-sb-bronze text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest">
                                            Logistics
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <h3 className="text-white text-xl font-bold font-display">
                                            Apex Global Logistics Hub
                                        </h3>
                                    </div>
                                </div>
                                <div
                                    className="relative group h-[334px] overflow-hidden sb-reveal-on-scroll"
                                    style={{ transitionDelay: "200ms" }}
                                >
                                    <img
                                        alt="Urban Living"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD36xWRWpTKL8qHWb-u409YK72-lfzr_fIoeprLu8DiKxgO1RLnaqTFVYDmPD0s5h32EYp0TbpxhDm5hvrXKQePSyCX6ONQcG4LT6tR46A7lpET9OpUt4WzS015NSvn1Gch_G-eoonvgXi_3gFeo_beHyLX4jYiznSVVT0qiEQuaDfEXZP4zeQEyt2fDPHMDv70a5gUv2pYTTKueLURLFPS0iijEpCeNAmy3YPF6hH5RUpzzNfECObg07bW4igz_kDFWE5igNfnNrU"
                                    />
                                    <div className="absolute inset-0 bg-sb-primary/40 group-hover:bg-sb-primary/20 transition-all"></div>
                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <span className="bg-sb-bronze text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest">
                                            Residential
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <h3 className="text-white text-xl font-bold font-display">
                                            Oasis Multi-Family Complex
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="bg-sb-primary py-32 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-sb-gold"></div>
                        <div className="max-w-[1400px] mx-auto px-4 md:px-20 lg:px-40 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="sb-reveal-on-scroll">
                                <h2 className="text-white text-5xl font-800 font-display mb-8">
                                    Secure Your Future Infrastructure
                                </h2>
                                <p className="text-slate-400 text-lg mb-10 max-w-lg">
                                    From structural consultancy to full-scale turnkey development,
                                    our experts are ready to deliver excellence.
                                </p>
                                <div className="flex gap-4">
                                    <button className="bg-sb-gold text-white px-10 py-5 font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-sb-primary transition-all">
                                        Start Project
                                    </button>
                                    <button className="border border-white/20 text-white px-10 py-5 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Technical Specs
                                    </button>
                                </div>
                            </div>
                            <div
                                className="sb-glass-card p-12 rounded-2xl sb-reveal-on-scroll"
                                style={{ transitionDelay: "200ms" }}
                            >
                                <h3 className="text-white text-xl font-bold mb-4">
                                    Engineering Insights Monthly
                                </h3>
                                <p className="text-slate-400 text-sm mb-8">
                                    Join 50,000+ industry leaders receiving our deep-dives into
                                    urban development and sustainable heavy construction.
                                </p>
                                <form className="flex flex-col gap-4">
                                    <input
                                        className="bg-white/5 border border-white/10 text-white px-6 py-4 focus:border-sb-gold outline-none transition-all"
                                        placeholder="Professional Email Address"
                                        type="email"
                                    />
                                    <button className="bg-white text-sb-primary font-bold uppercase tracking-widest py-4 hover:bg-sb-gold hover:text-white transition-all">
                                        Subscribe Now
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="bg-[#011428] text-white py-24 px-4 md:px-20 lg:px-40 relative border-t-[8px] border-sb-gold">
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 relative z-10">
                        <div className="md:col-span-4">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="size-9 bg-white flex items-center justify-center rounded-sm rotate-45">
                                    <span className="material-symbols-outlined text-sb-primary text-2xl -rotate-45">
                                        architecture
                                    </span>
                                </div>
                                <h2 className="text-2xl font-800 tracking-tighter uppercase font-display">
                                    StrucBuild
                                </h2>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm">
                                A global leader in civil engineering and high-scale
                                infrastructure development, delivering structural integrity
                                since 1998.
                            </p>
                            <div className="flex gap-6">
                                <a
                                    className="text-slate-500 hover:text-sb-gold transition-colors"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined">public</span>
                                </a>
                                <a
                                    className="text-slate-500 hover:text-sb-gold transition-colors"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined">share</span>
                                </a>
                                <a
                                    className="text-slate-500 hover:text-sb-gold transition-colors"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined">mail</span>
                                </a>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] mb-8 text-sb-gold">
                                Company
                            </h4>
                            <ul className="space-y-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Expertise
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Portfolio
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Leadership
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="md:col-span-2">
                            <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] mb-8 text-sb-gold">
                                Expertise
                            </h4>
                            <ul className="space-y-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Industrial
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Residential
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors" href="#">
                                        Infrastructure
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="md:col-span-4">
                            <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] mb-8 text-sb-gold">
                                Global Headquarters
                            </h4>
                            <div className="text-slate-400 text-xs leading-loose">
                                <p>128 Innovation Way, Floor 45</p>
                                <p>London, UK EC2A 4NE</p>
                                <p className="mt-4">+44 (0) 20 7123 4567</p>
                                <p>hello@strucbuild.global</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
