import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalLoader from "@/components/layout/GlobalLoader";
import AdminProtectedRoute from "@/components/layout/AdminProtectedRoute";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Official Admin Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className="antialiased h-full font-sans text-slate-800 bg-[#fafafa] overflow-hidden">
        <ThemeProvider>
          <GlobalLoader />
          <AdminProtectedRoute>
            <div className="relative min-h-screen w-full overflow-hidden bg-[#fafafa] dashboard-bg">
              {/* Animated Ambient Background Blur Orbs */}
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none animate-float" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none animate-float" style={{ animationDelay: "-2s" }} />
              <div className="absolute top-[40%] left-[60%] w-[35%] h-[35%] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05)_0%,transparent_70%)] blur-[60px] pointer-events-none animate-pulse-slow" />

              <div className="relative z-10 h-full w-full flex flex-col">
                {children}
              </div>
            </div>
          </AdminProtectedRoute>
        </ThemeProvider>
      </body>
    </html>
  );
}
