// src/app/layout.tsx - Fixed to handle campaigns routes properly
"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import UserTypeSidebar from "@/components/layout/UserTypeSidebar";
import { usePathname } from "next/navigation";
import { RightSidebarProvider, useRightSidebar } from "@/contexts/RightSidebarContext";
import Header from "@/components/dashboards/shared/header";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

function DashboardLayout({ children, sidebarOpen, setSidebarOpen }: {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { content, isVisible } = useRightSidebar();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Fixed width */}
      <UserTypeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - Left aligned with reserved right space */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <Header
              user={{ name: "User", tier: "Professional" }}
              searchPlaceholder="Search campaigns, content..."
              onSearch={() => {}}
              onNotificationClick={() => {}}
              onProfileClick={() => {}}
            />
          </div>

          {/* Mobile header */}
          <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between h-16 px-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                ☰
              </button>
              <span className="text-lg font-semibold">
                CampaignForge
              </span>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        {/* Right Sidebar Space - Shows content when available */}
        <div className={`bg-white border-l border-gray-200 ${
          isVisible && content ? 'hidden xl:block w-80' : 'hidden xl:block w-80'
        }`}>
          {isVisible && content ? (
            <div className="p-6">{content}</div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Right sidebar space reserved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Define which routes should show the sidebar (dashboard-style pages)
  const showSidebar = pathname.startsWith("/dashboard");

  // Hide sidebar completely on auth pages and standalone pages
  const hideSidebar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/user-selection" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/campaigns"); // Hide sidebar for all campaign pages

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
          <RightSidebarProvider>
            {hideSidebar ? (
              // Standalone pages (auth, campaigns) - no sidebar
              <div className="min-h-screen">{children}</div>
            ) : showSidebar ? (
              // Dashboard pages - with sidebar
              <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                {children}
              </DashboardLayout>
            ) : (
              // Other pages - simple layout
              <div className="min-h-screen">{children}</div>
            )}
          </RightSidebarProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
