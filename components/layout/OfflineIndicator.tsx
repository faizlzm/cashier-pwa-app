"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    // Initial check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top fixed top-0 left-0 right-0 z-50">
      <WifiOff className="h-4 w-4" />
      <span>
        Mode Offline - Transaksi akan disimpan lokal dan sync otomatis saat
        online
      </span>
    </div>
  );
}
