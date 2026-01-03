"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Listen for controller changes (new SW took control)
    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check if there's already a waiting worker
      if (reg.waiting) {
        waitingWorkerRef.current = reg.waiting;
        setShowUpdatePrompt(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              waitingWorkerRef.current = newWorker;
              setShowUpdatePrompt(true);
            }
          });
        }
      });
    });

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const handleUpdate = useCallback(() => {
    const waitingWorker = waitingWorkerRef.current || registration?.waiting;

    if (waitingWorker) {
      // Tell the waiting worker to skip waiting and activate
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      // The controllerchange event will trigger reload
    } else {
      // Fallback: just reload to get the latest version
      console.log("No waiting worker found, forcing reload");
      window.location.reload();
    }
  }, [registration]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismissInstall = useCallback(() => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  }, []);

  return (
    <>
      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Update Tersedia</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Versi baru aplikasi tersedia. Perbarui untuk mendapatkan fitur
                  terbaru.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleUpdate}>
                    Perbarui Sekarang
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowUpdatePrompt(false)}
                  >
                    Nanti
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-linear-to-br from-primary/90 to-primary rounded-xl shadow-2xl p-4 text-primary-foreground">
            <button
              onClick={handleDismissInstall}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Install Kasir Skripsi</h4>
                <p className="text-xs opacity-90 mt-1">
                  Install aplikasi untuk akses lebih cepat dan pengalaman
                  offline.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={handleInstall}
                >
                  Install
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
