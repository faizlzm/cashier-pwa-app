"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  Archive,
  Banknote,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { transactions } from "@/data/transactions";
import { cn } from "@/lib/utils";

// Helper for initials
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Riwayat Transaksi
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau semua pemasukan dan detail transaksi toko Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID Transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            title="Filter Tanggal"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            title="Filter Status"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-6 align-middle font-medium text-muted-foreground w-[120px]">
                    ID
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Archive className="h-6 w-6 opacity-50" />
                        </div>
                        <p className="font-medium">
                          Tidak ada transaksi ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((trx) => {
                    // Get formatting for first item
                    const primaryItem = trx.items[0];
                    // Consistent accent colors for avatars based on name
                    const hue =
                      Math.abs(
                        primaryItem.name
                          .split("")
                          .reduce((a, b) => a + b.charCodeAt(0), 0)
                      ) % 360;
                    const bgColor = `hsl(${hue}, 70%, 90%)`;
                    const textColor = `hsl(${hue}, 80%, 30%)`;

                    return (
                      <tr
                        key={trx.id}
                        className="border-b transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted group"
                      >
                        <td className="p-4 px-6 align-middle">
                          <span className="font-mono text-xs font-medium bg-muted/50 px-2 py-1 rounded-md text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-colors">
                            {trx.id}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(trx.date, "d MMM yyyy", {
                                locale: idLocale,
                              })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(trx.date, "HH:mm")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                backgroundColor: bgColor,
                                color: textColor,
                              }}
                            >
                              {getInitials(primaryItem.name)}
                            </div>
                            <div className="flex flex-col max-w-[250px] lg:max-w-md">
                              <span className="truncate font-medium text-sm">
                                {trx.items.map((i) => i.name).join(", ")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {trx.items.length} item •{" "}
                                {trx.items[0].category === "FOOD"
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
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            )}
                          >
                            {trx.status === "PAID" ? "Lunas" : trx.status}
                          </Badge>
                        </td>
                        <td className="p-4 px-6 align-middle text-right">
                          <span className="font-bold text-[15px]">
                            Rp {trx.total.toLocaleString("id-ID")}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <p>Menampilkan {filtered.length} transaksi</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled className="h-8">
            Sebelumnnya
          </Button>
          <Button variant="ghost" size="sm" disabled className="h-8">
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
