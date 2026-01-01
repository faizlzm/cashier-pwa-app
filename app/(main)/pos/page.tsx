"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types/api";

// Helper for initials
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function POSPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    subtotal,
    tax,
    total,
    clearCart,
  } = useCartStore();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProducts({ isActive: true });
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "ALL" || product.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAddItem = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.imageUrl || undefined,
    });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Product List Section (Left) */}
      <div className="flex-1 flex flex-col h-full gap-4">
        {/* Search & Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Cari produk..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={category === "ALL" ? "default" : "outline"}
              onClick={() => setCategory("ALL")}
            >
              Semua
            </Button>
            <Button
              variant={category === "FOOD" ? "default" : "outline"}
              onClick={() => setCategory("FOOD")}
            >
              Makanan
            </Button>
            <Button
              variant={category === "DRINK" ? "default" : "outline"}
              onClick={() => setCategory("DRINK")}
            >
              Minuman
            </Button>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-3">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <p>Tidak ada produk ditemukan</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              // Generate a pastel-like color for background
              const hue =
                Math.abs(
                  product.name
                    .split("")
                    .reduce((a, b) => a + b.charCodeAt(0), 0)
                ) % 360;
              const bgColor = `hsl(${hue}, 70%, 90%)`;
              const textColor = `hsl(${hue}, 80%, 30%)`;

              return (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:border-primary transition-all group overflow-hidden flex items-center p-3 gap-4"
                  onClick={() => handleAddItem(product)}
                >
                  <div
                    className="h-14 w-14 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    {getInitials(product.name)}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-slate-950 dark:text-slate-100">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        Rp {product.price.toLocaleString()}
                      </p>
                      {product.stock <= product.minStock && (
                        <Badge variant="destructive" className="text-xs">
                          Stok: {product.stock}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Cart Section (Right) */}
      <div className="w-[400px] flex flex-col h-full bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-muted/30 rounded-t-lg">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold">Keranjang</h2>
            <Badge variant="secondary" className="ml-1">
              {items.reduce((a, b) => a + b.quantity, 0)}
            </Badge>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCart()}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-start animate-in slide-in-from-right-2 duration-300"
              >
                <div className="h-12 w-12 rounded-md flex items-center justify-center shrink-0 text-sm font-bold bg-muted">
                  {getInitials(item.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    Rp {item.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    Rp {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/50 hover:text-destructive mt-2"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-muted/30 border-t rounded-b-lg space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rp {subtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PPN (11%)</span>
              <span>Rp {tax().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Total</span>
              <span>Rp {total().toLocaleString()}</span>
            </div>
          </div>
          <Button
            className="w-full text-lg h-12"
            size="lg"
            disabled={items.length === 0}
            onClick={() => router.push("/pos/checkout")}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
