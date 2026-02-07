"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useResponsive } from "@/hooks/useResponsive";
import { cn, getInitials, getProductColor } from "@/lib/utils";
import type { Product, Category } from "@/types/api";

export default function POSPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

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

  const itemCount = items.reduce((a, b) => a + b.quantity, 0);

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

  // Shared cart content component
  const CartContent = ({ compact = false }: { compact?: boolean }) => (
    <>
      {/* Cart Header */}
      <div
        className={cn(
          "flex justify-between items-center bg-muted/30",
          compact ? "p-3 border-b" : "p-4 border-b rounded-t-lg",
        )}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold">Keranjang</h2>
          <Badge variant="secondary" className="ml-1">
            {itemCount}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCart()}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div
        className={cn(
          "flex-1 overflow-y-auto space-y-3",
          compact ? "p-3" : "p-4",
        )}
      >
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 py-8">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p className="text-sm">Keranjang kosong</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-start animate-in slide-in-from-right-2 duration-300"
            >
              <div
                className={cn(
                  "rounded-md flex items-center justify-center shrink-0 text-xs font-bold bg-muted",
                  compact ? "h-10 w-10" : "h-12 w-12",
                )}
              >
                {getInitials(item.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn("font-medium truncate", compact && "text-sm")}
                >
                  {item.name}
                </h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Rp {item.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
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
                  className="h-6 w-6 text-destructive/50 hover:text-destructive mt-1"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer */}
      <div
        className={cn(
          "bg-muted/30 border-t space-y-2 safe-bottom",
          compact ? "p-3" : "p-4 rounded-b-lg",
        )}
      >
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rp {subtotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              PPN ({useCartStore((state) => state.taxRate)}%)
            </span>
            <span>Rp {tax().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span>Rp {total().toLocaleString()}</span>
          </div>
        </div>
        <Button
          data-testid="pos-checkout-button"
          className="w-full h-11"
          size="lg"
          disabled={items.length === 0}
          onClick={() => router.push("/pos/checkout")}
        >
          Checkout
        </Button>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-4",
        isMobile
          ? "flex-col h-[calc(100vh-8rem)]"
          : "flex-row h-[calc(100vh-6rem)]",
      )}
    >
      {/* Product List Section */}
      <div className="flex-1 flex flex-col h-full gap-2 sm:gap-4 min-h-0">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1">
            <Input
              data-testid="pos-search-input"
              placeholder="Cari produk..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card"
            />
          </div>
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              data-testid="pos-category-all"
              variant={category === "ALL" ? "default" : "outline"}
              onClick={() => setCategory("ALL")}
              className="shrink-0 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              Semua
            </Button>
            <Button
              data-testid="pos-category-food"
              variant={category === "FOOD" ? "default" : "outline"}
              onClick={() => setCategory("FOOD")}
              className="shrink-0 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              Makanan
            </Button>
            <Button
              data-testid="pos-category-drink"
              variant={category === "DRINK" ? "default" : "outline"}
              onClick={() => setCategory("DRINK")}
              className="shrink-0 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              Minuman
            </Button>
          </div>
        </div>

        {/* Product List */}
        <div
          className={cn(
            "flex-1 overflow-y-auto space-y-2 sm:space-y-3 min-h-0",
            isMobile ? "pb-20" : "pr-2 pb-2",
          )}
        >
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
              const colors = getProductColor(product.name);

              return (
                <Card
                  key={product.id}
                  data-testid={`pos-product-${product.id}`}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-all group overflow-hidden flex items-center gap-3",
                    isMobile ? "p-2.5" : "p-3 gap-4",
                  )}
                  onClick={() => handleAddItem(product)}
                >
                  <div
                    className={cn(
                      "rounded-lg flex items-center justify-center font-bold shrink-0",
                      isMobile ? "h-12 w-12 text-base" : "h-14 w-14 text-lg",
                    )}
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {getInitials(product.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-medium text-slate-950 dark:text-slate-100 truncate",
                        isMobile ? "text-base" : "text-lg",
                      )}
                    >
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
                    className={cn(
                      "rounded-full transition-opacity shrink-0",
                      isMobile
                        ? "h-9 w-9 opacity-100"
                        : "h-10 w-10 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <Plus className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      {!isMobile && (
        <div className="w-[340px] lg:w-[380px] flex flex-col h-full bg-card rounded-lg border shadow-sm">
          <CartContent />
        </div>
      )}

      {/* Mobile Floating Cart Button */}
      {isMobile && (
        <button
          data-testid="pos-cart-button"
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-3 right-3 z-40 bg-primary text-primary-foreground rounded-full py-3 px-5 shadow-lg flex items-center justify-between touch-target"
          style={{ boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Keranjang ({itemCount})</span>
          </div>
          <span className="font-bold">Rp {total().toLocaleString()}</span>
        </button>
      )}

      {/* Mobile Cart Bottom Sheet */}
      {isMobile && showCart && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
            aria-hidden="true"
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            <CartContent compact />
          </div>
        </>
      )}
    </div>
  );
}
