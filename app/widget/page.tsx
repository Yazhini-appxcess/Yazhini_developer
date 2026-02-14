"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import {
  Building2,
  HardHat,
  Trees,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  BarChart3,
  Globe,
  Layout,
  MessageSquare,
  Calendar,
  Clock,
  Home,
  Key,
  Tag,
  Award,
  ShieldCheck,
  ChevronRight,
  Users,
  Target,
  Sparkles,
  Plus,
  Star,
  ArrowUpRight,
  ArrowUp,
  X,
  Menu
} from "lucide-react";

export default function WidgetPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [isClient, setIsClient] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isCapabilitiesVisible, setIsCapabilitiesVisible] = useState(false);
  const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
  const [isDevelopmentVisible, setIsDevelopmentVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
      title: "Innovation Center",
      location: "San Diego, CA"
    },
    {
      url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop",
      title: "Luxury Living",
      location: "Palm Springs, CA"
    },
    {
      url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=2070&auto=format&fit=crop",
      title: "Urban Development",
      location: "Los Angeles, CA"
    },
    {
      url: "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?q=80&w=2070&auto=format&fit=crop",
      title: "Modern Communities",
      location: "Orange County, CA"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Enable scrolling
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';

    // Parallax effect for hero
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    // Intersection Observer
    const sections = [
      { id: 'hero-section', setter: setIsHeroVisible },
      { id: 'about-section', setter: setIsAboutVisible },
      { id: 'capabilities-section', setter: setIsCapabilitiesVisible },
      { id: 'portfolio-section', setter: setIsPortfolioVisible },
      { id: 'development-section', setter: setIsDevelopmentVisible },
      { id: 'contact-section', setter: setIsContactVisible },
    ];

    const observers = sections.map(({ id, setter }) => {
      const section = document.getElementById(id);
      if (section) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setter(true);
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        observer.observe(section);
        return observer;
      }
      return null;
    }).filter(Boolean);

    window.addEventListener('scroll', handleScroll);
    setIsHeroVisible(true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((observer) => observer?.disconnect());
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  const stats = [
    { value: "25+", label: "Years Experience", icon: <Award className="w-5 h-5" /> },
    { value: "150+", label: "Projects Completed", icon: <CheckCircle2 className="w-5 h-5" /> },
    { value: "$2.5B", label: "Portfolio Value", icon: <BarChart3 className="w-5 h-5" /> },
    { value: "98%", label: "Client Satisfaction", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <img
                  src="/LWWD_Logo.jpg"
                  alt="Leucadia Logo"
                  className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#01284e]">
                  LEUCADIA
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {['About', 'Capabilities', 'Portfolio', 'Development', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}-section`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#01284e] hover:bg-gray-50 rounded-lg transition-all duration-300 relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#81c341] group-hover:w-3/4 transition-all duration-300"></span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#01284e] transition-colors">
                <Phone className="w-4 h-4" />
                <span>(619) 555-0123</span>
              </button>
              <button
                onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-2.5 bg-gradient-to-r from-[#01284e] to-[#023b70] text-white rounded-lg font-semibold text-sm hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Get in Touch</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#81c341] to-[#5da130] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#01284e]"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-slideDown">
            <div className="p-4 space-y-2">
              {['About', 'Capabilities', 'Portfolio', 'Development', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}-section`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 text-gray-600 hover:text-[#01284e] hover:bg-gray-50 rounded-lg transition-all"
                >
                  <span className="font-medium">{item}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3">
                  <Phone className="w-5 h-5 text-[#81c341]" />
                  <span className="font-medium text-gray-900">(619) 555-0123</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Hero Section */}
      <section id="hero-section" className="pt-24 pb-20 md:pt-32 md:pb-28 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden min-h-[95vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div ref={heroRef} className="absolute inset-0 transition-transform duration-1000 ease-out">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroImage ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  backgroundImage: `url(${img.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.3)'
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#01284e]/20 via-transparent to-[#81c341]/10"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#01284e]/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #01284e 1px, transparent 1px),
                             linear-gradient(to bottom, #01284e 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: 15, top: 20, delay: 0, duration: 4 },
            { left: 85, top: 15, delay: 1, duration: 5 },
            { left: 25, top: 60, delay: 2, duration: 6 },
            { left: 70, top: 45, delay: 0.5, duration: 4.5 },
            { left: 40, top: 80, delay: 1.5, duration: 5.5 },
            { left: 90, top: 70, delay: 2.5, duration: 3.5 },
            { left: 10, top: 90, delay: 3, duration: 6 },
            { left: 55, top: 25, delay: 1, duration: 4 },
            { left: 75, top: 85, delay: 2, duration: 5 },
            { left: 30, top: 35, delay: 0.5, duration: 5.5 },
            { left: 95, top: 50, delay: 1.5, duration: 4.5 },
            { left: 20, top: 75, delay: 2.5, duration: 6 },
            { left: 60, top: 10, delay: 3, duration: 4 },
            { left: 45, top: 95, delay: 0.5, duration: 5 },
            { left: 80, top: 30, delay: 1, duration: 6 },
            { left: 35, top: 55, delay: 2, duration: 4.5 },
            { left: 65, top: 65, delay: 1.5, duration: 5.5 },
            { left: 50, top: 40, delay: 2.5, duration: 3.5 },
            { left: 5, top: 50, delay: 3, duration: 6 },
            { left: 88, top: 88, delay: 0.5, duration: 4 }
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#81c341] rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-20">
          <div className={`max-w-3xl transition-all duration-1000 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-8 border border-white/20 shadow-lg">
              <div className="w-2 h-2 bg-[#81c341] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[#01284e] tracking-wider uppercase">Since 1998</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-white leading-tight">
              <span className="block">Building</span>
              <span className="block">
                <span className="bg-gradient-to-r from-white via-[#81c341] to-white bg-clip-text text-transparent animate-gradient">
                  Dreams
                </span>
                {' '}Into Reality
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl font-light">
              Transforming landscapes into lasting communities through visionary development and uncompromising quality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a
                href="#portfolio-section"
                className="group relative px-8 py-4 bg-white text-[#01284e] rounded-xl font-bold hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Explore Projects
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#81c341] to-[#5da130] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </a>

              <a
                href="#development-section"
                className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group"
              >
                <span className="flex items-center justify-center gap-3">
                  View Developments
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </a>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {stat.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section id="about-section" className="py-20 px-6 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#01284e]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <div className={`inline-block mb-4 transition-all duration-700 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="text-sm font-bold text-[#81c341] tracking-widest uppercase">Our Philosophy</span>
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold mb-6 text-[#01284e] leading-tight transition-all duration-700 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Where Vision Meets
              <span className="relative ml-4">
                <span className="text-[#81c341]">Execution</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none">
                  <path d="M0,5 Q100,0 200,5" stroke="#81c341" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
            <p className={`text-lg text-gray-600 leading-relaxed mb-12 transition-all duration-700 delay-200 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              With over two decades of excellence, we blend innovative design with meticulous craftsmanship to create spaces that inspire and endure.
            </p>
          </div>

          {/* Values Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: "Strategic Vision",
                description: "Identifying opportunities that others overlook and transforming them into thriving communities.",
                features: ["Market Analysis", "Site Selection", "Feasibility Studies"]
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Focus",
                description: "Building not just structures, but neighborhoods where people connect and thrive.",
                features: ["Public Engagement", "Amenity Planning", "Social Integration"]
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Innovative Solutions",
                description: "Pioneering new approaches to sustainable development and smart urban planning.",
                features: ["Green Technology", "Smart Design", "Future-Proofing"]
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#01284e]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Icon */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#01284e] to-[#023b70] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">{item.icon}</div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-[#01284e] mb-4 relative">{item.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <Plus className="w-4 h-4 text-[#81c341]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Process Timeline */}
          <div className={`bg-gradient-to-r from-[#01284e] to-[#023b70] rounded-3xl p-8 md:p-12 transition-all duration-1000 ${isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Our Development Process</h3>
              <p className="text-white/80 max-w-2xl mx-auto">A streamlined approach from concept to completion</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "01", title: "Discovery", desc: "Market Research & Analysis" },
                { number: "02", title: "Design", desc: "Architectural Planning" },
                { number: "03", title: "Development", desc: "Construction & Execution" },
                { number: "04", title: "Delivery", desc: "Quality Assurance & Handover" }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-white/70 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Capabilities Section */}
      <section id="capabilities-section" className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#01284e/5,transparent_50%),radial-gradient(circle_at_70%_80%,#81c341/5,transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
            <div className={`transition-all duration-700 ${isCapabilitiesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-12 h-0.5 bg-[#81c341]"></div>
                <span className="text-[#81c341] font-bold tracking-wider uppercase">Expertise</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-[#01284e] leading-tight">
                Core
                <span className="block">Capabilities</span>
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className={`flex flex-wrap gap-2 transition-all duration-700 delay-300 ${isCapabilitiesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {['All', 'Residential', 'Commercial', 'Mixed-Use', 'Industrial'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.toLowerCase()
                    ? 'bg-[#01284e] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Capabilities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                category: "Residential",
                title: "Master-Planned Communities",
                desc: "Creating sustainable neighborhoods with thoughtful amenities and community spaces.",
                features: ["Single Family Homes", "Multi-Family Units", "Luxury Estates"],
                color: "from-blue-500/10 to-emerald-500/10",
                icon: <Home className="w-6 h-6" />
              },
              {
                category: "Commercial",
                title: "Mixed-Use Developments",
                desc: "Integrating retail, office, and residential spaces for vibrant urban environments.",
                features: ["Retail Centers", "Office Parks", "Hospitality"],
                color: "from-amber-500/10 to-orange-500/10",
                icon: <Building2 className="w-6 h-6" />
              },
              {
                category: "Industrial",
                title: "Logistics & Warehousing",
                desc: "Modern industrial facilities designed for efficiency and scalability.",
                features: ["Distribution Centers", "Manufacturing", "Flex Space"],
                color: "from-purple-500/10 to-pink-500/10",
                icon: <HardHat className="w-6 h-6" />
              },
              {
                category: "Sustainable",
                title: "Green Development",
                desc: "Eco-friendly projects with LEED certification and sustainable infrastructure.",
                features: ["Solar Integration", "Water Management", "Green Spaces"],
                color: "from-emerald-500/10 to-green-500/10",
                icon: <Trees className="w-6 h-6" />
              }
            ].map((cap, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${isCapabilitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:via-[#81c341]/5 group-hover:to-[#01284e]/5 transition-all duration-500"></div>

                <div className="relative p-8">
                  {/* Category Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-6">
                    <div className={`p-1 rounded-full ${cap.category === 'Residential' ? 'bg-blue-100 text-blue-600' :
                      cap.category === 'Commercial' ? 'bg-amber-100 text-amber-600' :
                        cap.category === 'Industrial' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {cap.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{cap.category}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-[#01284e] mb-4 group-hover:text-[#023b70] transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {cap.desc}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {cap.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#81c341]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-[#81c341]" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More Button */}
                  <button className="flex items-center gap-2 text-[#01284e] font-semibold group-hover:text-[#81c341] transition-colors">
                    <span>Explore Projects</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                {/* Hover Image Preview */}
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tl from-[#01284e] to-transparent rounded-tl-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Portfolio Section */}
      <section id="portfolio-section" className="py-24 px-6 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className={`inline-block mb-4 transition-all duration-700 ${isPortfolioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="text-sm font-bold text-[#81c341] tracking-widest uppercase">Showcase</span>
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold mb-6 text-[#01284e] leading-tight transition-all duration-700 ${isPortfolioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Signature
              <span className="relative ml-4">
                <span className="text-[#81c341]">Projects</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none">
                  <path d="M0,5 Q100,10 200,5" stroke="#81c341" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${isPortfolioVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1600607687939-ce8a6c25118c' : '1600585154340-be6161a56a0c'}?q=80&w=2653&auto=format&fit=crop`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Project"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-bold text-[#01284e]">202{i}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-[#81c341] uppercase tracking-wider">Completed</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#01284e] mb-3 group-hover:text-[#023b70] transition-colors">
                    Vista Ridge Phase {i}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    An exclusive community featuring sustainable design, panoramic views, and premium amenities.
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#01284e]">4{i}</div>
                      <div className="text-xs text-gray-500">Units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#01284e]">{i}K+</div>
                      <div className="text-xs text-gray-500">Sq. Ft.</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#01284e]">9{i}%</div>
                      <div className="text-xs text-gray-500">Sold</div>
                    </div>
                  </div>

                  {/* Hover Button */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 bg-[#01284e] text-white rounded-full flex items-center justify-center hover:bg-[#023b70] transition-colors">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className="group relative px-8 py-4 bg-transparent text-[#01284e] border-2 border-[#01284e] rounded-xl font-bold hover:text-white transition-all duration-300 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                View All Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-[#01284e] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Current Development */}
      <section id="development-section" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#81c341]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#01284e]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`transition-all duration-1000 ${isDevelopmentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gradient-to-br from-[#01284e] via-[#023b70] to-[#01284e] rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Floating Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-[#81c341]/10 rounded-full blur-xl"></div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Content */}
                <div className="p-12 lg:p-16 flex flex-col justify-center text-white relative">
                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#81c341] rounded-full animate-pulse"></div>
                      <span className="text-[#81c341] font-bold tracking-widest text-sm uppercase">Now Selling</span>
                    </div>
                    <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                    <span className="text-white/80 text-sm">Phase I Open</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    The Heights at<br />
                    <span className="bg-gradient-to-r from-white via-[#81c341] to-white bg-clip-text text-transparent">
                      Canyon Creek
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-white/90 text-lg mb-8 leading-relaxed">
                    Experience elevated living in our newest master-planned community.
                    Featuring estate-sized lots, custom architecture, and miles of private trails.
                    Phase I is now open for reservations with exclusive pre-construction pricing.
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {[
                      { icon: <MapPin className="w-5 h-5" />, label: "North County, San Diego", detail: "Prime Location" },
                      { icon: <Layout className="w-5 h-5" />, label: "3,500 - 5,200 Sq. Ft.", detail: "Custom Designs" },
                      { icon: <Trees className="w-5 h-5" />, label: "20+ Acres", detail: "Green Space" },
                      { icon: <Award className="w-5 h-5" />, label: "LEED Certified", detail: "Sustainable" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                          <div className="text-[#81c341]">{feature.icon}</div>
                        </div>
                        <div>
                          <div className="font-bold text-white">{feature.label}</div>
                          <div className="text-sm text-white/70">{feature.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-4 bg-[#81c341] text-[#01284e] rounded-xl font-bold hover:bg-white hover:text-[#01284e] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group">
                      Schedule a Private Tour
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button className="px-8 py-4 bg-transparent text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center">
                      Download Brochure
                    </button>
                  </div>
                </div>

                {/* Right Image */}
                <div className="relative h-96 lg:h-auto min-h-[500px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop"
                    alt="Luxury Home Interior"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#01284e] via-transparent to-transparent"></div>

                  {/* Floating Info Card */}
                  <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-xl transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Starting from</div>
                        <div className="text-3xl font-bold text-[#01284e]">$1.2M</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Available</div>
                        <div className="text-xl font-bold text-[#81c341]">12/45 Units</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#81c341] h-2 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Limited availability - Reserve now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact-section" className="py-24 px-6 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Content */}
            <div className={`space-y-8 ${isContactVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-12 h-0.5 bg-[#81c341]"></div>
                  <span className="text-[#81c341] font-bold tracking-widest uppercase">Get in Touch</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#01284e] leading-tight">
                  Schedule Your
                  <span className="block text-[#81c341]">Private Tour</span>
                </h2>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Experience luxury living firsthand. Schedule a private tour with our dedicated sales team and discover your dream home today.
              </p>

              {/* Contact Info Cards */}
              <div className="space-y-4">
                {[
                  { icon: <Phone className="w-5 h-5" />, title: "Call Us", value: "(619) 555-0123", action: "Available 24/7" },
                  { icon: <Mail className="w-5 h-5" />, title: "Email", value: "sales@leucadia.com", action: "Response within 2 hours" },
                  { icon: <MapPin className="w-5 h-5" />, title: "Visit", value: "123 Development Way", action: "San Diego, CA 92101" }
                ].map((info, index) => (
                  <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#01284e]/5 flex items-center justify-center">
                        <div className="text-[#01284e]">{info.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">{info.title}</div>
                        <div className="font-bold text-[#01284e]">{info.value}</div>
                        <div className="text-sm text-[#81c341]">{info.action}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent Card */}
              <div className="p-6 bg-gradient-to-br from-[#01284e] to-[#023b70] rounded-2xl text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#81c341] rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">Emily Rodriguez</div>
                    <div className="text-white/80 mb-2">Senior Sales Director</div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.9/5 (128 Reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className={`w-full ${isContactVisible ? 'animate-fade-in-up' : 'opacity-0'} delay-200`}>
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#01284e] mb-3">Thank You!</h3>
                    <p className="text-gray-600 mb-8">
                      Your tour request has been submitted. Our team will contact you within 24 hours to confirm your appointment.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-6 py-3 bg-[#01284e] text-white rounded-lg font-semibold hover:bg-[#023b70] transition-colors"
                    >
                      Schedule Another Tour
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-[#01284e] mb-2">Schedule a Visit</h3>
                    <p className="text-gray-600 mb-8">Fill out the form below and we'll arrange a private viewing at your convenience.</p>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            required
                            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all placeholder:text-gray-400 text-gray-700"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all text-gray-700"
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                          <div className="relative">
                            <select className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all text-gray-700 appearance-none cursor-pointer">
                              <option>10:00 AM</option>
                              <option>11:00 AM</option>
                              <option>1:00 PM</option>
                              <option>2:00 PM</option>
                              <option>3:00 PM</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 1L6 6L11 1" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#81c341]/20 focus:border-[#81c341] outline-none transition-all placeholder:text-gray-400 text-gray-700 resize-none"
                          placeholder="Any specific requirements or questions?"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-8 py-4 bg-gradient-to-r from-[#01284e] to-[#023b70] text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg relative overflow-hidden group"
                      >
                        <span className="relative z-10">Request Private Tour</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#81c341] to-[#5da130] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-[#012547] to-[#001a33] text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/LWWD_Logo.jpg"
                  alt="Leucadia Logo"
                  className="w-10 h-10"
                />
                <div>
                  <div className="text-2xl font-bold">LEUCADIA</div>
                </div>
              </div>
              <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                For over 25 years, we've been shaping skylines and building communities that stand the test of time through innovation, integrity, and excellence.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: <Globe className="w-5 h-5" />, label: "Website" },
                  { icon: <MessageSquare className="w-5 h-5" />, label: "LinkedIn" },
                  { icon: <Users className="w-5 h-5" />, label: "Instagram" }
                ].map((social, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'News', 'Sustainability', 'Investors'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-[#81c341] transition-colors flex items-center gap-2 group">
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Services</h4>
              <ul className="space-y-4">
                {['Development', 'Construction', 'Property Management', 'Consulting', 'Investment'].map((service) => (
                  <li key={service}>
                    <a href="#" className="text-gray-400 hover:text-[#81c341] transition-colors flex items-center gap-2 group">
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-white">Stay Updated</h4>
              <p className="text-gray-400 mb-4 text-sm">Subscribe to our newsletter for the latest developments.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#81c341]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Leucadia Wastewater District. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-[#81c341] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#81c341] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#81c341] transition-colors">Accessibility</a>
              <a href="#" className="hover:text-[#81c341] transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-8 w-12 h-12 bg-[#01284e] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      <Script
        src={`${apiUrl}/api/bot/widget.js?type=external`}
        strategy="afterInteractive"
      />
    </div>
  );
}