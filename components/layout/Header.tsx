"use client";

import { User as UserIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/auth-context";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-card px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden touch-target"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Shift indicator - hide on very small screens */}
        <div className="hidden xs:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mr-2 sm:mr-4 border-r pr-2 sm:pr-4">
          <span className="flex items-center gap-1">
            🔔 Shift: <strong>Pagi</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* User info - hide on small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.toLowerCase() || "cashier"}
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-9 w-9 sm:h-10 sm:w-10"
          >
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
