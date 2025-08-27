// src/app/layout.tsx - Updated with Sidebar Navigation
"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import UserTypeSidebar from "@/components/layout/UserTypeSidebar";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Hide sidebar on login/register pages
  const hideSidebar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/user-selection" ||
    pathname === "/onboarding";

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>RodgersDigital</title>
        <meta
          name="description"
          content="Intelligent Campaign Creation Platform"
        />
      </head>
      <body className="font-inter antialiased bg-white text-black">
        <AppErrorBoundary>
          {hideSidebar ? (
            // Full-width layout for auth pages
            children
          ) : (
            // Layout with sidebar for dashboard pages
            <div className="flex h-screen bg-gray-100">
              <UserTypeSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />

              <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Mobile header */}
                <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
                  <div className="flex items-center justify-between h-16 px-6">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                    >
                      ☰
                    </button>
                    <span className="text-lg font-semibold">CampaignForge</span>
                  </div>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
          )}
        </AppErrorBoundary>
      </body>
    </html>
  );
}
