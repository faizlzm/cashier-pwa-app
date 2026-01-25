"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Product } from "@/types/api";

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isLoading?: boolean;
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading = false,
}: DeleteProductDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm">Apakah Anda yakin ingin menghapus produk:</p>
            <p className="font-semibold mt-1">&quot;{product.name}&quot;</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
          terkait produk ini.
        </p>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Produk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
