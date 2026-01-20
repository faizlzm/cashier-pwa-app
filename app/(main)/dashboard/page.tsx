"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  ArrowRight,
  Clock,
  User,
  Wallet,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getTodayTransactions } from "@/lib/api/transactions";
import { getProducts } from "@/lib/api/products";
import { useAuth } from "@/lib/context/auth-context";
import { cn, getInitials } from "@/lib/utils";
import type { Transaction } from "@/types/api";

interface DashboardData {
  todayRevenue: number;
  todayTransactions: number;
  totalProducts: number;
  recentTransactions: Transaction[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Track online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch today's transactions and products in parallel
        const [todayData, products] = await Promise.all([
          getTodayTransactions(),
          getProducts({ isActive: true }),
        ]);

        setData({
          todayRevenue: todayData.summary.total,
          todayTransactions: todayData.summary.count,
          totalProducts: products.length,
          recentTransactions: todayData.transactions.slice(0, 5),
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Pendapatan Hari Ini",
      value: data ? `Rp ${data.todayRevenue.toLocaleString("id-ID")}` : "-",
      icon: DollarSign,
      trend: "Hari ini",
      trendUp: true,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      label: "Total Transaksi",
      value: data ? data.todayTransactions.toString() : "-",
      icon: Receipt,
      trend: "Hari ini",
      trendUp: true,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      label: "Produk Aktif",
      value: data ? data.totalProducts.toString() : "-",
      icon: Package,
      trend: "Dalam katalog",
      trendUp: true,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      label: "Status Koneksi",
      value: isOnline ? "Online" : "Offline",
      icon: isOnline ? Wifi : WifiOff,
      trend: isOnline ? "Terhubung ke server" : "Mode offline aktif",
      trendUp: isOnline,
      color: isOnline ? "text-green-600" : "text-red-600",
      bg: isOnline
        ? "bg-green-100 dark:bg-green-900/20"
        : "bg-red-100 dark:bg-red-900/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
            Ringkasan aktivitas bisnis Anda hari ini
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm font-medium">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
          </span>
        </div>
      </div>

      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between space-y-0 pb-1 sm:pb-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
                  {stat.label}
                </p>
                <div
                  className={cn("p-1.5 sm:p-2 rounded-full shrink-0", stat.bg)}
                >
                  <stat.icon
                    className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", stat.color)}
                  />
                </div>
              </div>
              <div className="flex flex-col mt-2 sm:mt-3 gap-0.5 sm:gap-1">
                <span className="text-lg sm:text-2xl font-bold tracking-tight truncate">
                  {stat.value}
                </span>
                <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
                  {stat.trendUp && (
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 text-green-500" />
                  )}
                  <span className="truncate">{stat.trend}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Stack on mobile */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Recent Transactions - show second on mobile */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-4 sm:gap-6 order-2 lg:order-1">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-base">Transaksi Terakhir</CardTitle>
              </div>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-xs h-8">
                  Lihat Semua <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {data?.recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Belum ada transaksi hari ini</p>
                  </div>
                ) : (
                  data?.recentTransactions.map((trx) => (
                    <div
                      key={trx.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar/Icon based on first item */}
                        {trx.items.length > 0 && (
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-primary/10 text-primary">
                            {getInitials(trx.items[0].productName)}
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none truncate max-w-[200px] sm:max-w-xs">
                            {trx.items.map((i) => i.productName).join(", ")}
                            {trx.items.length > 2 && "..."}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">
                              {trx.transactionCode}
                            </span>
                            <span>•</span>
                            <span>
                              {format(new Date(trx.createdAt), "HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-sm">
                          Rp {trx.total.toLocaleString("id-ID")}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        >
                          Lunas
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Action & Shift - show first on mobile */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-4 sm:gap-6 order-1 lg:order-2">
          {/* Quick Action Card */}
          <Link href="/pos" className="group">
            <div className="bg-linear-to-br from-primary to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] hover:shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Receipt className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    Mulai Transaksi Baru
                  </h3>
                  <p className="text-white/80 text-sm">
                    Masuk ke halaman Point of Sale
                  </p>
                </div>
              </div>
              {/* Decorative bg circles */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-10 right-10 w-16 h-16 bg-white/5 rounded-full blur-xl" />
            </div>
          </Link>

          {/* Shift Info */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/5">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Shift Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu Mulai</p>
                    <p className="text-sm font-semibold">08:00 WIB</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Kasir Bertugas
                    </p>
                    <p className="text-sm font-semibold">
                      {user?.name || "Kasir"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo Awal</p>
                    <p className="text-sm font-semibold">Rp 200.000</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
