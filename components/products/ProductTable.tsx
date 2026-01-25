"use client";

import * as React from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Package,
  UtensilsCrossed,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, getInitials, getProductColor } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import type { Product } from "@/types/api";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: ProductTableProps) {
  const { isMobile } = useResponsive();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Habis", variant: "destructive" as const };
    }
    if (product.stock <= product.minStock) {
      return { label: "Stok Rendah", variant: "warning" as const };
    }
    return { label: "Tersedia", variant: "success" as const };
  };

  const handleMenuToggle = (productId: string) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  if (isLoading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="animate-pulse">Memuat produk...</div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6 opacity-50" />
          </div>
          <p className="font-medium">Belum ada produk</p>
          <p className="text-sm mt-1">
            Klik &quot;Tambah Produk&quot; untuk menambahkan produk baru
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile Product Card Component
  const MobileProductCard = ({ product }: { product: Product }) => {
    const colors = getProductColor(product.name);
    const stockStatus = getStockStatus(product);

    return (
      <Card
        className={cn(
          "p-3 hover:shadow-md transition-shadow",
          !product.isActive && "opacity-60",
        )}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {getInitials(product.name)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  {product.category === "FOOD" ? (
                    <UtensilsCrossed className="h-3 w-3" />
                  ) : (
                    <Coffee className="h-3 w-3" />
                  )}
                  <span>
                    {product.category === "FOOD" ? "Makanan" : "Minuman"}
                  </span>
                  <span>•</span>
                  <span>Stok: {product.stock}</span>
                </div>
              </div>
              {!product.isActive ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 shrink-0"
                >
                  Nonaktif
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5 shrink-0",
                    stockStatus.variant === "success" &&
                      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                    stockStatus.variant === "warning" &&
                      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                    stockStatus.variant === "destructive" &&
                      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
                  )}
                >
                  {stockStatus.label}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {formatCurrency(product.price)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onToggleActive(product)}
                >
                  {product.isActive ? (
                    <PowerOff className="h-3.5 w-3.5" />
                  ) : (
                    <Power className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(product)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Mobile Card List
  if (isMobile) {
    return (
      <div className="space-y-2">
        {products.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b bg-muted/30">
              <tr className="border-b transition-colors">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12">
                  #
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-16">
                  Gambar
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Nama Produk
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Kategori
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                  Harga
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">
                  Stok
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">
                  Status
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center w-16">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 bg-card">
              {products.map((product, index) => {
                const stockStatus = getStockStatus(product);
                const colors = getProductColor(product.name);
                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/30 group",
                      !product.isActive && "opacity-60",
                    )}
                  >
                    <td className="p-4 align-middle text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="p-4 align-middle">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {getInitials(product.name)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {product.category === "FOOD" ? (
                          <UtensilsCrossed className="h-4 w-4" />
                        ) : (
                          <Coffee className="h-4 w-4" />
                        )}
                        <span>
                          {product.category === "FOOD" ? "Makanan" : "Minuman"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span
                        className={cn(
                          "font-medium",
                          product.stock <= product.minStock &&
                            "text-destructive",
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      {!product.isActive ? (
                        <Badge variant="secondary">Nonaktif</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={cn(
                            stockStatus.variant === "success" &&
                              "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                            stockStatus.variant === "warning" &&
                              "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                            stockStatus.variant === "destructive" &&
                              "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
                          )}
                        >
                          {stockStatus.label}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 align-middle text-center relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(product.id);
                        }}
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {/* Dropdown Menu */}
                      {openMenuId === product.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-40 bg-background border rounded-md shadow-lg z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                            onClick={() => {
                              onEdit(product);
                              setOpenMenuId(null);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                            onClick={() => {
                              onToggleActive(product);
                              setOpenMenuId(null);
                            }}
                          >
                            {product.isActive ? (
                              <>
                                <PowerOff className="h-4 w-4" />
                                Nonaktifkan
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4" />
                                Aktifkan
                              </>
                            )}
                          </button>
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 text-destructive"
                            onClick={() => {
                              onDelete(product);
                              setOpenMenuId(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
