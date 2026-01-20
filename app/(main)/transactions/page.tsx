"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  Archive,
  Banknote,
  CreditCard,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getTransactions } from "@/lib/api/transactions";
import { useResponsive } from "@/hooks/useResponsive";
import { cn, getInitials, getProductColor } from "@/lib/utils";
import type { Transaction } from "@/types/api";

export default function TransactionsPage() {
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await getTransactions({ limit: 50 });
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError("Gagal memuat transaksi. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) =>
    t.transactionCode.toLowerCase().includes(search.toLowerCase()),
  );

  // Mobile Transaction Card Component
  const MobileTransactionCard = ({ trx }: { trx: Transaction }) => {
    const primaryItem = trx.items[0];
    const colors = primaryItem
      ? getProductColor(primaryItem.productName)
      : null;

    return (
      <Card className="p-3 hover:shadow-md transition-shadow">
        <div className="flex gap-3">
          {/* Avatar */}
          {colors && (
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {getInitials(primaryItem.productName)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {trx.items.map((i) => i.productName).join(", ")}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{trx.transactionCode}</span>
                  <span>•</span>
                  <span>
                    {format(new Date(trx.createdAt), "d MMM, HH:mm", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5 shrink-0",
                  trx.status === "PAID"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : trx.status === "CANCELLED"
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
                )}
              >
                {trx.status === "PAID"
                  ? "Lunas"
                  : trx.status === "CANCELLED"
                    ? "Batal"
                    : "Pending"}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {trx.paymentMethod === "CASH" ? (
                  <Banknote className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{trx.paymentMethod}</span>
                <span>•</span>
                <span>{trx.items.length} item</span>
              </div>
              <span className="font-bold text-sm">
                Rp {trx.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Riwayat Transaksi
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
            Pantau semua pemasukan dan detail transaksi toko Anda
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari Kode Transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card h-9 sm:h-10 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            title="Filter Tanggal"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            title="Filter Status"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading / Error / Empty states */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Memuat transaksi...</p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Archive className="h-6 w-6 opacity-50" />
          </div>
          <p className="font-medium">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List */}
          {isMobile ? (
            <div className="space-y-2">
              {filtered.map((trx) => (
                <MobileTransactionCard key={trx.id} trx={trx} />
              ))}
            </div>
          ) : (
            /* Desktop Table */
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b bg-muted/30">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-6 align-middle font-medium text-muted-foreground w-[140px]">
                          Kode
                        </th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[180px]">
                          Waktu
                        </th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                          Detail Pesanan
                        </th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[140px]">
                          Metode
                        </th>
                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[120px]">
                          Status
                        </th>
                        <th className="h-12 px-6 align-middle font-medium text-muted-foreground text-right w-[160px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 bg-card">
                      {filtered.map((trx) => {
                        const primaryItem = trx.items[0];
                        const colors = primaryItem
                          ? getProductColor(primaryItem.productName)
                          : null;

                        return (
                          <tr
                            key={trx.id}
                            className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted group"
                          >
                            <td className="p-4 px-6 align-middle">
                              <span className="font-mono text-xs font-medium bg-muted/50 px-2 py-1 rounded-md text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-colors">
                                {trx.transactionCode}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {format(
                                    new Date(trx.createdAt),
                                    "d MMM yyyy",
                                    {
                                      locale: idLocale,
                                    },
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(trx.createdAt), "HH:mm")}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-3">
                                {colors && (
                                  <div
                                    className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                    style={{
                                      backgroundColor: colors.bg,
                                      color: colors.text,
                                    }}
                                  >
                                    {getInitials(primaryItem.productName)}
                                  </div>
                                )}
                                <div className="flex flex-col max-w-[250px] lg:max-w-md">
                                  <span className="truncate font-medium text-sm">
                                    {trx.items
                                      .map((i) => i.productName)
                                      .join(", ")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {trx.items.length} item •{" "}
                                    {primaryItem?.category === "FOOD"
                                      ? "Makanan"
                                      : "Minuman"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2 text-sm text-foreground/80">
                                {trx.paymentMethod === "CASH" ? (
                                  <Banknote className="w-4 h-4 text-green-600" />
                                ) : (
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                )}
                                <span className="font-medium">
                                  {trx.paymentMethod}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-semibold capitalize",
                                  trx.status === "PAID"
                                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    : trx.status === "CANCELLED"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200",
                                )}
                              >
                                {trx.status === "PAID"
                                  ? "Lunas"
                                  : trx.status === "CANCELLED"
                                    ? "Batal"
                                    : "Pending"}
                              </Badge>
                            </td>
                            <td className="p-4 px-6 align-middle text-right">
                              <span className="font-bold text-[15px]">
                                Rp {trx.total.toLocaleString("id-ID")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <p>Menampilkan {filtered.length} transaksi</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled className="h-8">
                Sebelumnya
              </Button>
              <Button variant="ghost" size="sm" disabled className="h-8">
                Selanjutnya
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
