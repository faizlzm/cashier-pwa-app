"use client";

import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/auth-context";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {/* Dynamic header content based on page title could go here */}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4 border-r pr-4 md:flex">
          <span className="flex items-center gap-1">
            🔔 Shift: <strong>Pagi</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.toLowerCase() || "cashier"}
            </p>
          </div>
          <Button variant="secondary" size="icon" className="rounded-full">
            <UserIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
