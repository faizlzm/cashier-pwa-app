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
  X,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getTransactions } from "@/lib/api/transactions";
import { useResponsive } from "@/hooks/useResponsive";
import { cn, getInitials, getProductColor } from "@/lib/utils";
import type {
  Transaction,
  PaymentStatus,
  PaymentMethod,
  TransactionFilters,
} from "@/types/api";

export default function TransactionsPage() {
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({
    limit: 50,
  });

  // Temporary filter states for modals
  const [tempDateFilter, setTempDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({ startDate: "", endDate: "" });

  const [tempStatusFilter, setTempStatusFilter] = useState<{
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
  }>({});

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: TransactionFilters = { ...activeFilters };
      if (activeFilters.startDate && activeFilters.startDate === activeFilters.endDate) {
        // If same day, maybe handle differently if needed, but API handles range
      }
      
      const { data } = await getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Gagal memuat transaksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeFilters]);

  // Handle Search Client-side (since API doesn't support search by code yet, or as per original implementation)
  // Optimization: Ideally search should be server-side if list is long
  const filtered = transactions.filter((t) =>
    t.transactionCode.toLowerCase().includes(search.toLowerCase())
  );

  const applyDateFilter = () => {
    setActiveFilters((prev) => ({
      ...prev,
      startDate: tempDateFilter.startDate || undefined,
      endDate: tempDateFilter.endDate || undefined,
    }));
    setIsDateFilterOpen(false);
  };

  const resetDateFilter = () => {
    setTempDateFilter({ startDate: "", endDate: "" });
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters.startDate;
      delete newFilters.endDate;
      return newFilters;
    });
    setIsDateFilterOpen(false);
  };

  const applyStatusFilter = () => {
    setActiveFilters((prev) => ({
      ...prev,
      status: tempStatusFilter.status,
      paymentMethod: tempStatusFilter.paymentMethod,
    }));
    setIsStatusFilterOpen(false);
  };

  const resetStatusFilter = () => {
    setTempStatusFilter({});
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters.status;
      delete newFilters.paymentMethod;
      return newFilters;
    });
    setIsStatusFilterOpen(false);
  };

  // Check if filters are active
  const isDateActive = !!activeFilters.startDate || !!activeFilters.endDate;
  const isStatusActive = !!activeFilters.status || !!activeFilters.paymentMethod;

  // Sync temp states when opening modals
  useEffect(() => {
    if (isDateFilterOpen) {
      setTempDateFilter({
        startDate: activeFilters.startDate || "",
        endDate: activeFilters.endDate || "",
      });
    }
  }, [isDateFilterOpen, activeFilters]);

  useEffect(() => {
    if (isStatusFilterOpen) {
      setTempStatusFilter({
        status: activeFilters.status,
        paymentMethod: activeFilters.paymentMethod,
      });
    }
  }, [isStatusFilterOpen, activeFilters]);


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
            variant={isDateActive ? "default" : "outline"}
            size="icon"
            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 relative"
            title="Filter Tanggal"
            onClick={() => setIsDateFilterOpen(true)}
          >
            <Calendar className="h-4 w-4" />
            {isDateActive && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
            )}
          </Button>
          <Button
            variant={isStatusActive ? "default" : "outline"}
            size="icon"
            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 relative"
            title="Filter Status"
            onClick={() => setIsStatusFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            {isStatusActive && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
            )}
          </Button>
        </div>
      </div>

      {/* Date Filter Modal */}
      <Modal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        title="Filter Tanggal"
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Dari Tanggal</label>
              <Input
                type="date"
                value={tempDateFilter.startDate}
                onChange={(e) =>
                  setTempDateFilter({ ...tempDateFilter, startDate: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Sampai Tanggal</label>
              <Input
                type="date"
                value={tempDateFilter.endDate}
                onChange={(e) =>
                  setTempDateFilter({ ...tempDateFilter, endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={resetDateFilter}>
              Reset
            </Button>
            <Button onClick={applyDateFilter}>Terapkan</Button>
          </div>
        </div>
      </Modal>

      {/* Status Filter Modal */}
      <Modal
        isOpen={isStatusFilterOpen}
        onClose={() => setIsStatusFilterOpen(false)}
        title="Filter Status & Penbayaran"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Status Transaksi</label>
            <div className="flex flex-wrap gap-2">
              {["PAID", "PENDING", "CANCELLED"].map((s) => (
                <Badge
                  key={s}
                  variant={tempStatusFilter.status === s ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setTempStatusFilter({
                      ...tempStatusFilter,
                      status:
                        tempStatusFilter.status === s
                          ? undefined
                          : (s as PaymentStatus),
                    })
                  }
                >
                  {s === "PAID"
                    ? "Lunas"
                    : s === "CANCELLED"
                    ? "Batal"
                    : "Pending"}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Metode Pembayaran</label>
            <div className="flex flex-wrap gap-2">
              {["CASH", "QRIS"].map((m) => (
                <Badge
                  key={m}
                  variant={
                    tempStatusFilter.paymentMethod === m ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    setTempStatusFilter({
                      ...tempStatusFilter,
                      paymentMethod:
                        tempStatusFilter.paymentMethod === m
                          ? undefined
                          : (m as PaymentMethod),
                    })
                  }
                >
                  {m}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={resetStatusFilter}>
              Reset
            </Button>
            <Button onClick={applyStatusFilter}>Terapkan</Button>
          </div>
        </div>
      </Modal>

      {/* Loading / Error / Empty states */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Memuat transaksi...</p>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={fetchTransactions}>
            Coba Lagi
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Archive className="h-6 w-6 opacity-50" />
          </div>
          <p className="font-medium">Tidak ada transaksi ditemukan</p>
          {(isDateActive || isStatusActive || search) && (
            <p className="text-sm mt-1">Coba ubah filter pencarian Anda</p>
          )}
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
            <p>Menampilkan {filtered.length} dari total transaksi yang dimuat</p>
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
