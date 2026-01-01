"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  Receipt,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  User,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getTodayTransactions } from "@/lib/api/transactions";
import { getProducts } from "@/lib/api/products";
import { useAuth } from "@/lib/context/auth-context";
import { cn } from "@/lib/utils";
import type { Transaction, Product } from "@/types/api";

// Helper for initials
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

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
      label: "Pelanggan",
      value: "-",
      icon: Users,
      trend: "Segera hadir",
      trendUp: true,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20",
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Ringkasan aktivitas bisnis Anda hari ini
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border px-4 py-2 rounded-full shadow-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div className={cn("p-2 rounded-full", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="flex flex-col mt-3 gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trendUp && (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  )}
                  {stat.trend}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Recent Transactions (Span 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <Card className="h-full border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b bg-muted/5">
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

        {/* Right Column: Quick Action & Shift (Span 5) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
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
