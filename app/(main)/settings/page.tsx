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
  Building2,
  Pencil,
} from "lucide-react";
import { Toast } from "@/components/ui/Toast";
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
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "@/lib/api/settings";
import { useCartStore } from "@/store/cart";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const setStoreTaxRate = useCartStore((state) => state.setTaxRate);

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

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Business Settings State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [businessSettings, setBusinessSettings] = useState({
    businessName: "",
    address: "",
    taxRate: 11,
  });
  // Backup state for cancel
  const [originalSettings, setOriginalSettings] = useState({
    businessName: "",
    address: "",
    taxRate: 11,
  });

  const loadSettings = async () => {
    try {
      const settings = await getBusinessSettings();
      const data = {
        businessName: settings.businessName || "",
        address: settings.address || "",
        taxRate: settings.taxRate,
      };
      setBusinessSettings(data);
      setOriginalSettings(data);
      // Sync store tax rate
      setStoreTaxRate(settings.taxRate);
    } catch (error) {
      console.error("Failed to load business settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updated = await updateBusinessSettings({
        businessName: businessSettings.businessName,
        address: businessSettings.address,
        taxRate: businessSettings.taxRate,
      });
      setStoreTaxRate(updated.taxRate);
      setOriginalSettings(businessSettings);
      setIsEditingBusiness(false);
      showToast("Pengaturan bisnis berhasil disimpan", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Gagal menyimpan pengaturan", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCancelEdit = () => {
    setBusinessSettings(originalSettings);
    setIsEditingBusiness(false);
  };

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

      // Load offline stats & business settings
      getOfflineStats().then(setOfflineStats);
      loadSettings();
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
            <div className="space-y-2"></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Pengaturan Bisnis
            </CardTitle>
            <CardDescription>
              Kelola informasi toko dan tarif pajak
            </CardDescription>
          </div>
          {!isEditingBusiness && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingBusiness(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Ubah
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Toko</label>
              <Input
                value={businessSettings.businessName}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    businessName: e.target.value,
                  })
                }
                disabled={!isEditingBusiness}
                className={!isEditingBusiness ? "bg-muted" : ""}
                placeholder="Contoh: Toko Kopi Senja"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
                value={businessSettings.address}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    address: e.target.value,
                  })
                }
                disabled={!isEditingBusiness}
                placeholder="Alamat lengkap toko"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tarif Pajak (%)
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (0 = Bebas Pajak)
                </span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={businessSettings.taxRate}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    taxRate: Math.max(
                      0,
                      Number.parseFloat(e.target.value) || 0,
                    ),
                  })
                }
                disabled={!isEditingBusiness}
                className={!isEditingBusiness ? "bg-muted" : ""}
              />
            </div>

            {isEditingBusiness && (
              <div className="flex justify-end pt-2 gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isSavingSettings}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            )}
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
