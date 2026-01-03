"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  getPendingTransactionCount,
  getPendingTransactions,
  updateTransactionStatus,
  removeTransaction,
} from "@/lib/offline/offline-store";
import { syncTransactionDirect } from "@/lib/api/transactions";

interface NetworkStatusContextType {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncPendingTransactions: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const NetworkStatusContext = createContext<
  NetworkStatusContextType | undefined
>(undefined);

export function NetworkStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  // Initialize online status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Refresh pending transaction count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingTransactionCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to get pending count:", error);
    }
  }, []);

  // Sync pending transactions
  const syncPendingTransactions = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) {
      console.log("Sync skipped: already in progress or offline");
      return;
    }

    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const pending = await getPendingTransactions();
      // Include pending, failed, AND syncing (in case of interrupted sync)
      const toSync = pending.filter(
        (t) =>
          t.status === "pending" ||
          t.status === "failed" ||
          t.status === "syncing"
      );

      console.log(`Syncing ${toSync.length} transactions...`);

      let syncedCount = 0;
      for (const tx of toSync) {
        try {
          // Mark as syncing
          await updateTransactionStatus(tx.id, "syncing");

          // Attempt to sync using direct API call (bypasses queue logic)
          await syncTransactionDirect(tx.data);

          // Remove from queue on success
          await removeTransaction(tx.id);
          syncedCount++;
          console.log(
            `Transaction ${tx.id} synced successfully (${syncedCount}/${toSync.length})`
          );

          // Update pending count after each successful sync for UI feedback
          await refreshPendingCount();
        } catch (error) {
          console.error(`Failed to sync transaction ${tx.id}:`, error);
          // Mark as failed and increment retry
          await updateTransactionStatus(tx.id, "failed", true);
        }
      }

      console.log(
        `Sync complete: ${syncedCount}/${toSync.length} transactions synced`
      );
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
      await refreshPendingCount();
    }
  }, [refreshPendingCount]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncPendingTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial pending count
    refreshPendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingTransactions, refreshPendingCount]);

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        lastSyncedAt,
        syncPendingTransactions,
        refreshPendingCount,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error(
      "useNetworkStatus must be used within a NetworkStatusProvider"
    );
  }
  return context;
}
