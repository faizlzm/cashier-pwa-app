"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { NetworkStatusBar } from "@/components/ui/NetworkStatusBar";
import { PWAUpdatePrompt } from "@/components/ui/PWAUpdatePrompt";
import { NetworkStatusProvider } from "@/lib/context/network-status";
import { useAuth } from "@/lib/context/auth-context";
import { useResponsive } from "@/hooks/useResponsive";
import { Loader2 } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render main layout if not authenticated (redirect will happen in AuthContext)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <NetworkStatusProvider>
      <div className="min-h-screen bg-background">
        <NetworkStatusBar />
        <PWAUpdatePrompt />

        {/* Sidebar - controlled on mobile, self-managed on desktop */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 
          Main content wrapper 
          - No left padding on mobile (sidebar is overlay)
          - Left padding on tablet+ to account for sidebar
        */}
        <div className="md:pl-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary/10 p-3 sm:p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </NetworkStatusProvider>
  );
}
