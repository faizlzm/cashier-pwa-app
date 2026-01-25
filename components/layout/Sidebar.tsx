"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  Settings,
  Menu,
  LogOut,
  Moon,
  Sun,
  X,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useResponsive } from "@/hooks/useResponsive";

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: ShoppingBag, label: "POS", href: "/pos" },
  { icon: Package, label: "Produk", href: "/products" },
  { icon: ClipboardList, label: "Riwayat", href: "/transactions" },
  { icon: Settings, label: "Setting", href: "/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isMobile } = useResponsive();
  const [collapsed, setCollapsed] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Hydration check for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleNavigation = () => {
    // Close sidebar on mobile after navigation
    if (isMobile && onClose) {
      onClose();
    }
  };

  // On mobile, sidebar is controlled externally via isOpen prop
  // On desktop, sidebar is always visible with collapsed state
  const showSidebar = isMobile ? isOpen : true;
  const isExpanded = isMobile ? true : !collapsed;

  if (!showSidebar && isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-card border-r transition-all duration-300 ease-in-out flex flex-col",
          // Width based on collapsed state (desktop) or always expanded (mobile)
          isExpanded ? "w-64" : "w-16",
          // Mobile: Slide in/out animation
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0",
        )}
      >
        {/* Header / Toggle */}
        <div className="flex h-16 items-center border-b px-4 justify-between">
          {isExpanded && (
            <span className="font-bold text-lg truncate">KASIR PRO</span>
          )}
          {isMobile ? (
            // Mobile: Close button
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          ) : (
            // Desktop: Collapse toggle
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-2 px-2">
            {menuItems.map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={handleNavigation}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground touch-target",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground",
                    !isExpanded && "justify-center",
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-2 grid gap-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start touch-target",
              !isExpanded && "justify-center px-0",
            )}
            onClick={toggleTheme}
            title={!isExpanded ? "Toggle Theme" : undefined}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {isExpanded && (
              <span className="ml-3">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 touch-target",
              !isExpanded && "justify-center px-0",
            )}
            onClick={logout}
            title={!isExpanded ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {isExpanded && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
