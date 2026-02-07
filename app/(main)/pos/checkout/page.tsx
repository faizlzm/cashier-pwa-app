"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Delete,
  Receipt,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { createTransaction } from "@/lib/api/transactions";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PaymentMethod, CreateTransactionRequest } from "@/types/api";

// Helper for initials (Consistent with POS page)
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, discount, total, clearCart } = useCartStore();
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Redirect if cart is empty (but not if payment just completed)
  useEffect(() => {
    if (items.length === 0 && !isProcessing && !paymentCompleted) {
      router.push("/pos");
    }
  }, [items, router, isProcessing, paymentCompleted]);

  const totalAmount = total();
  const change = Math.max(0, cashReceived - totalAmount);
  // Allow payment if exact match OR more than total
  const isSufficient =
    paymentMethod === "CASH" ? cashReceived >= totalAmount : true; // QRIS is always sufficient (flow-wise)

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const handleNumpad = (value: string) => {
    if (value === "backspace") {
      setCashReceived(Math.floor(cashReceived / 10));
    } else if (value === "clear") {
      setCashReceived(0);
    } else if (value === "000") {
      const currentStr = cashReceived.toString();
      if (currentStr.length < 10) {
        setCashReceived(parseInt(currentStr + "000") || 0);
      }
    } else {
      const currentStr = cashReceived === 0 ? "" : cashReceived.toString();
      if (currentStr.length < 12) {
        setCashReceived(parseInt(currentStr + value) || 0);
      }
    }
  };

  const handlePayment = async () => {
    if (!isSufficient) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Prepare transaction data
      const transactionData: CreateTransactionRequest = {
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
        })),
        subtotal: subtotal(),
        tax: Math.round(tax()),
        discount: discount(),
        total: Math.round(totalAmount),
        paymentMethod: paymentMethod,
      };

      // Create transaction via API
      const transaction = await createTransaction(transactionData);

      // Mark payment as completed to prevent redirect to /pos
      setPaymentCompleted(true);

      // Clear cart and redirect to success
      clearCart();

      // Use replace instead of push for better PWA standalone mode compatibility
      // This avoids navigation issues when running as installed PWA
      router.replace(
        `/pos/success?code=${transaction.transactionCode}&received=${cashReceived}&change=${change}&method=${paymentMethod}`,
      );
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Gagal membuat transaksi. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  // Quick cash suggestions based on total
  const getQuickCashOptions = () => {
    const suggestions = [totalAmount];
    const bases = [10000, 20000, 50000, 100000];

    // Add next rounding up for each base
    bases.forEach((base) => {
      const next = Math.ceil(totalAmount / base) * base;
      if (next > totalAmount && !suggestions.includes(next)) {
        suggestions.push(next);
      }
    });

    // Also add 'Uang Pas' equivalent if not already there (it is first)
    // Add a couple of generic large notes if they aren't covered
    [50000, 100000].forEach((note) => {
      if (note > totalAmount && !suggestions.includes(note)) {
        suggestions.push(note);
      }
    });

    return suggestions.sort((a, b) => a - b).slice(0, 4); // limit to 4 buttons
  };

  return (
    <div className="h-[calc(100vh-5rem)] p-4 max-w-[1400px] mx-auto flex flex-col justify-center">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4 h-full max-h-[800px]">
        {/* LEFT COLUMN: ORDER SUMMARY (Span 7) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3 h-full">
          <div className="flex items-center gap-2 mb-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
              <p className="text-muted-foreground text-xs">
                Periksa detail pesanan sebelum pembayaran
              </p>
            </div>
          </div>

          <Card className="flex-1 flex flex-col shadow-sm border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm">
            <CardHeader className="py-3 px-5 border-b bg-muted/10 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    Ringkasan Pesanan
                  </span>
                </div>
                <Badge variant="outline" className="px-2 py-0.5 text-xs">
                  {items.length} Item
                </Badge>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="divide-y divide-border/40">
                {items.map((item) => {
                  // Generate consistent pastel color (Same logic as POS page)
                  const hue =
                    Math.abs(
                      item.name
                        .split("")
                        .reduce((a, b) => a + b.charCodeAt(0), 0),
                    ) % 360;
                  const bgColor = `hsl(${hue}, 70%, 90%)`;
                  const textColor = `hsl(${hue}, 80%, 30%)`;

                  return (
                    <div
                      key={item.id}
                      className="p-3 flex items-start gap-3 hover:bg-muted/10 transition-colors"
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {getInitials(item.name)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm truncate pr-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{item.quantity}x</span>
                          <span>@ Rp {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="font-bold tabular-nums text-sm text-right self-center">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-muted/10 border-t space-y-3 shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    Rp {subtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Pajak (11%)</span>
                  <span className="tabular-nums">
                    Rp {Math.round(tax()).toLocaleString()}
                  </span>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span className="tabular-nums">
                      - Rp {discount().toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/60 w-full" />

              <div className="flex justify-between items-end">
                <span className="text-base font-bold">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-primary tabular-nums tracking-tight">
                  Rp {Math.round(totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: PAYMENT INTERFACE (Span 5) */}
        <div className="col-span-12 lg:col-span-5 h-full">
          <Card className="h-full flex flex-col shadow-xl border-primary/20 bg-card overflow-hidden">
            {/* Header Payment */}
            <div className="bg-primary/5 p-4 border-b border-primary/10 flex flex-col items-center justify-center gap-1 shrink-0">
              <span className="text-[10px] font-bold tracking-widest text-primary/60 uppercase">
                Total Tagihan
              </span>
              <div className="text-4xl font-black text-primary tabular-nums">
                Rp {Math.round(totalAmount).toLocaleString()}
              </div>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 bg-muted/20 shrink-0">
              <button
                data-testid="checkout-payment-cash"
                onClick={() => setPaymentMethod("CASH")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2",
                  paymentMethod === "CASH"
                    ? "bg-white dark:bg-zinc-800 text-primary border-primary/20 shadow-sm"
                    : "text-muted-foreground border-transparent hover:bg-muted",
                )}
              >
                <Banknote className="w-4 h-4" />
                Tunai
              </button>
              <button
                data-testid="checkout-payment-qris"
                onClick={() => setPaymentMethod("QRIS")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2",
                  paymentMethod === "QRIS"
                    ? "bg-white dark:bg-zinc-800 text-primary border-primary/20 shadow-sm"
                    : "text-muted-foreground border-transparent hover:bg-muted",
                )}
              >
                <CreditCard className="w-4 h-4" />
                QRIS
              </button>
            </div>

            <CardContent className="flex-1 p-4 flex flex-col gap-4 overflow-hidden min-h-0">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg shrink-0">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {paymentMethod === "CASH" ? (
                <>
                  {/* Input Display */}
                  <div className="relative shrink-0">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-lg">
                      Rp
                    </span>
                    <Input
                      data-testid="checkout-cash-input"
                      readOnly
                      value={
                        cashReceived > 0 ? cashReceived.toLocaleString() : ""
                      }
                      placeholder="0"
                      className="h-16 pl-12 pr-14 text-3xl font-bold text-right shadow-inner bg-muted/30 border-muted focus-visible:ring-0 rounded-xl"
                    />
                    {cashReceived > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button
                          onClick={() => handleNumpad("clear")}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestions */}
                  <div className="grid grid-cols-4 gap-2 shrink-0">
                    {getQuickCashOptions().map((amount, index) => (
                      <button
                        key={amount}
                        data-testid={`checkout-quick-cash-${index}`}
                        onClick={() => handleQuickCash(amount)}
                        className="py-1.5 px-1 text-xs font-semibold bg-primary/5 text-primary hover:bg-primary/10 rounded-md border border-primary/10 truncate transition-all active:scale-95"
                      >
                        {amount === totalAmount
                          ? "Uang Pas"
                          : amount.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        data-testid={`checkout-numpad-${num}`}
                        onClick={() => handleNumpad(num.toString())}
                        className="bg-card hover:bg-accent border border-border/60 shadow-sm rounded-xl text-xl font-bold flex items-center justify-center transition-all active:scale-95 active:bg-accent/80"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      data-testid="checkout-numpad-000"
                      onClick={() => handleNumpad("000")}
                      className="bg-card hover:bg-accent border border-border/60 shadow-sm rounded-xl text-lg font-bold flex items-center justify-center transition-all active:scale-95"
                    >
                      000
                    </button>
                    <button
                      data-testid="checkout-numpad-0"
                      onClick={() => handleNumpad("0")}
                      className="bg-card hover:bg-accent border border-border/60 shadow-sm rounded-xl text-xl font-bold flex items-center justify-center transition-all active:scale-95"
                    >
                      0
                    </button>
                    <button
                      data-testid="checkout-numpad-backspace"
                      onClick={() => handleNumpad("backspace")}
                      className="bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    >
                      <Delete className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-40 h-40 bg-white p-3 rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center">
                    {/* Placeholder for QR */}
                    <div className="w-full h-full bg-neutral-900 rounded-lg opacity-80" />
                  </div>
                  <div className="space-y-1 max-w-[200px]">
                    <h3 className="font-bold text-base">Scan QRIS</h3>
                    <p className="text-xs text-muted-foreground">
                      Menunggu konfirmasi pembayaran...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-4 bg-card border-t z-10 shrink-0">
              {paymentMethod === "CASH" && (
                <div className="flex justify-between items-center mb-3 px-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium text-sm">Kembalian</span>
                  </div>
                  <div
                    className={cn(
                      "text-xl font-bold tabular-nums transition-colors",
                      change > 0
                        ? "text-green-600"
                        : "text-muted-foreground/50",
                    )}
                  >
                    Rp {change.toLocaleString()}
                  </div>
                </div>
              )}
              <Button
                data-testid="checkout-pay-button"
                size="lg"
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl"
                disabled={!isSufficient || isProcessing}
                onClick={handlePayment}
                isLoading={isProcessing}
              >
                {isProcessing
                  ? "Memproses..."
                  : paymentMethod === "CASH"
                    ? `Bayar Rp ${Math.round(totalAmount).toLocaleString()}`
                    : "Cek Status Pembayaran"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
