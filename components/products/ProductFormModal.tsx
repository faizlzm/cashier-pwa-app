"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UtensilsCrossed, Coffee, Save } from "lucide-react";
import type { Product, CreateProductRequest, Category } from "@/types/api";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}: ProductFormModalProps) {
  const isEditing = !!product;
  const [formData, setFormData] = React.useState<CreateProductRequest>({
    name: "",
    price: 0,
    category: "FOOD",
    stock: 0,
    minStock: 5,
    imageUrl: null,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form when modal opens/product changes
  React.useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          minStock: product.minStock,
          imageUrl: product.imageUrl || null,
        });
      } else {
        setFormData({
          name: "",
          price: 0,
          category: "FOOD",
          stock: 0,
          minStock: 5,
          imageUrl: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Nama produk minimal 2 karakter";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }
    if (formData.stock !== undefined && formData.stock < 0) {
      newErrors.stock = "Stok tidak boleh negatif";
    }
    if (formData.minStock !== undefined && formData.minStock < 0) {
      newErrors.minStock = "Minimal stok tidak boleh negatif";
    }
    if (formData.imageUrl && formData.imageUrl.trim() !== "") {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = "URL gambar tidak valid";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...formData,
      imageUrl: formData.imageUrl?.trim() || null,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (category: Category) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Produk" : "Tambah Produk Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Nama Produk <span className="text-destructive">*</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama produk"
            error={errors.name}
            disabled={isLoading}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Harga (Rp) <span className="text-destructive">*</span>
          </label>
          <Input
            name="price"
            type="number"
            value={formData.price || ""}
            onChange={handleChange}
            placeholder="0"
            error={errors.price}
            disabled={isLoading}
            min={0}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Kategori <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-3">
            <label
              className={`flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg p-3 transition-colors ${
                formData.category === "FOOD"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="category"
                checked={formData.category === "FOOD"}
                onChange={() => handleCategoryChange("FOOD")}
                className="sr-only"
                disabled={isLoading}
              />
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-sm font-medium">Makanan</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg p-3 transition-colors ${
                formData.category === "DRINK"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="category"
                checked={formData.category === "DRINK"}
                onChange={() => handleCategoryChange("DRINK")}
                className="sr-only"
                disabled={isLoading}
              />
              <Coffee className="h-4 w-4" />
              <span className="text-sm font-medium">Minuman</span>
            </label>
          </div>
        </div>

        {/* Stock and Min Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Stok Awal
            </label>
            <Input
              name="stock"
              type="number"
              value={formData.stock ?? 0}
              onChange={handleChange}
              placeholder="0"
              error={errors.stock}
              disabled={isLoading}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Min. Stok (Alert)
            </label>
            <Input
              name="minStock"
              type="number"
              value={formData.minStock ?? 5}
              onChange={handleChange}
              placeholder="5"
              error={errors.minStock}
              disabled={isLoading}
              min={0}
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            URL Gambar (Opsional)
          </label>
          <Input
            name="imageUrl"
            value={formData.imageUrl || ""}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            error={errors.imageUrl}
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
