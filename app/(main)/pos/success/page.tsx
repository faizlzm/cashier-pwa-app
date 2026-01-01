"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { useCartStore } from "@/store/cart";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const code =
    searchParams.get("code") || `TRX-${Date.now().toString().slice(-6)}`;
  const received = parseInt(searchParams.get("received") || "0");
  const change = parseInt(searchParams.get("change") || "0");
  const total = received - change;
  const method = searchParams.get("method") || "CASH";

  useEffect(() => {
    // Clear the cart when landing on success page
    clearCart();
  }, [clearCart]);

  return (
    <Card className="w-full max-w-md shadow-2xl border-green-500/20 animate-in zoom-in-95 duration-300">
      <CardContent className="pt-10 pb-6 flex flex-col items-center text-center space-y-6">
        <div className="h-24 w-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
            Pembayaran Berhasil!
          </h2>
          <p className="text-muted-foreground mt-2 font-mono">{code}</p>
        </div>

        <div className="w-full bg-muted/50 p-6 rounded-lg space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Metode Pembayaran</span>
            <span className="font-medium">{method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Tagihan</span>
            <span className="font-medium">Rp {total.toLocaleString()}</span>
          </div>
          {method === "CASH" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tunai Diterima</span>
                <span className="font-medium">
                  Rp {received.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Kembalian</span>
                <span className="text-primary">
                  Rp {change.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pb-8 px-8">
        <Button className="w-full h-12 text-lg" variant="outline">
          <Printer className="mr-2 h-5 w-5" /> Cetak Struk
        </Button>
        <Button
          className="w-full h-12 text-lg"
          onClick={() => router.push("/pos")}
        >
          <ArrowRight className="mr-2 h-5 w-5" /> Transaksi Baru
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
