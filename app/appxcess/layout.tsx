import { Inter } from "next/font/google";
import React from "react";
import ClientAppXcessLayout from "./ClientAppXcessLayout";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Super Admin Portal",
  description: "AppXcess Control Plane",
  icons: {
    icon: [
      {
        url: "/super_admin_favicon.png",
        href: "/super_admin_favicon.png",
      }
    ]
  }
};

export default function AppXcessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientAppXcessLayout interClassName={inter.className}>
            {children}
        </ClientAppXcessLayout>
    );
}
