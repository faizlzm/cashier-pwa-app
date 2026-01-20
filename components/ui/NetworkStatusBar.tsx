"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CloudOff, Loader2 } from "lucide-react";
import { useNetworkStatus } from "@/lib/context/network-status";
import { cn } from "@/lib/utils";

export function NetworkStatusBar() {
  const { isOnline, pendingCount, isSyncing, syncPendingTransactions } =
    useNetworkStatus();
  const [showBar, setShowBar] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBar(true);
      setWasOffline(true);
    } else if (wasOffline && pendingCount === 0) {
      // Show "back online" briefly
      const timer = setTimeout(() => {
        setShowBar(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (pendingCount > 0) {
      setShowBar(true);
    } else {
      setShowBar(false);
    }
  }, [isOnline, pendingCount, wasOffline]);

  if (!showBar) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-center gap-3 text-sm font-medium transition-all duration-300 animate-in slide-in-from-top",
        !isOnline
          ? "bg-amber-500 text-amber-950"
          : pendingCount > 0
            ? "bg-blue-500 text-white"
            : "bg-green-500 text-white",
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            Mode Offline
            {pendingCount > 0 &&
              ` • ${pendingCount} transaksi menunggu sinkronisasi`}
          </span>
        </>
      ) : pendingCount > 0 ? (
        <>
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyinkronkan {pendingCount} transaksi...</span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4" />
              <span>{pendingCount} transaksi menunggu sinkronisasi</span>
              <button
                onClick={syncPendingTransactions}
                className="ml-2 flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Sync
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <span>✓ Kembali online</span>
        </>
      )}
    </div>
  );
}
