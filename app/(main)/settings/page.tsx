"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Lock,
  Moon,
  Sun,
  LogOut,
  RefreshCw,
  Smartphone,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/context/auth-context";
import {
  clearAllOfflineData,
  getOfflineStats,
} from "@/lib/offline/offline-store";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [offlineStats, setOfflineStats] = useState<{
    productCount: number;
    pendingTransactionCount: number;
  } | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));

      // Get service worker registration
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          setRegistration(reg);
          // Check if update is already waiting
          if (reg.waiting) {
            setUpdateAvailable(true);
          }
        });
      }

      // Load offline stats
      getOfflineStats().then(setOfflineStats);
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

  const checkForUpdates = useCallback(async () => {
    if (!registration) return;

    setIsCheckingUpdate(true);
    try {
      await registration.update();
      // Wait a bit for the update check to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (registration.waiting) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, [registration]);

  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) {
      // No waiting worker, just reload
      window.location.reload();
      return;
    }

    setIsUpdating(true);

    // Listen for controller change
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Tell waiting worker to take over
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearAllOfflineData();
      setOfflineStats({ productCount: 0, pendingTransactionCount: 0 });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profil Pengguna
          </CardTitle>
          <CardDescription>Informasi akun anda saat ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input value={user?.name || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={user?.role || ""} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Aplikasi
          </CardTitle>
          <CardDescription>
            Kelola pembaruan dan data offline aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Update Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium flex items-center gap-2">
                Pembaruan Aplikasi
                {updateAvailable && (
                  <Badge className="bg-green-500">Update Tersedia</Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Versi: 0.1.0 • Periksa pembaruan terbaru
              </p>
            </div>
            <div className="flex gap-2">
              {updateAvailable ? (
                <Button onClick={applyUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Terapkan Update
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={checkForUpdates}
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memeriksa...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Cek Update
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            {/* Cache Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Data Offline</h3>
                <p className="text-sm text-muted-foreground">
                  {offlineStats
                    ? `${offlineStats.productCount} produk • ${offlineStats.pendingTransactionCount} transaksi pending`
                    : "Memuat..."}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleClearCache}
                disabled={isClearingCache}
              >
                {isClearingCache ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Cache
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" /> Tampilan Aplikasi
          </CardTitle>
          <CardDescription>
            Sesuaikan tampilan aplikasi dengan preferensi anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Mode Gelap</h3>
              <p className="text-sm text-muted-foreground">
                Aktifkan mode gelap untuk kenyamanan mata
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="w-[100px]"
            >
              {isDark ? (
                <>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Ubah Password</Button>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button
          variant="destructive"
          className="w-full md:w-auto"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Keluar Aplikasi
        </Button>
      </div>
    </div>
  );
}
