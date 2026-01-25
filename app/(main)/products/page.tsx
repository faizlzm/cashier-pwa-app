"use client";

import * as React from "react";
import { Plus, Search, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
} from "@/types/api";

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<Category | "">("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null,
  );

  // Fetch products
  const fetchProducts = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts({
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        isActive:
          statusFilter === "all"
            ? undefined
            : statusFilter === "active"
              ? true
              : false,
      });
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter]);

  // Initial load and filter changes
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle create/update product
  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        // Update
        await updateProduct(selectedProduct.id, data as UpdateProductRequest);
      } else {
        // Create
        await createProduct(data);
      }
      setIsFormModalOpen(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      await deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
      await fetchProducts();
    } catch (error) {
      console.error("Failed to toggle product status:", error);
    }
  };

  // Open modals
  const openCreateModal = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Manajemen Produk
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
              Kelola daftar produk, harga, dan stok
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 sm:max-w-64">
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-card h-9 sm:h-10 text-sm"
            />
          </div>
          <select
            className="h-9 sm:h-10 px-3 rounded-md border border-input bg-card text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | "")}
          >
            <option value="">Semua Kategori</option>
            <option value="FOOD">Makanan</option>
            <option value="DRINK">Minuman</option>
          </select>
          <select
            className="h-9 sm:h-10 px-3 rounded-md border border-input bg-card text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Memuat produk...</p>
        </div>
      ) : (
        <>
          {/* Product Table */}
          <ProductTable
            products={products}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
            onToggleActive={handleToggleActive}
            isLoading={isLoading}
          />

          {/* Product Count */}
          {products.length > 0 && (
            <p className="text-xs text-muted-foreground px-1">
              Menampilkan {products.length} produk
            </p>
          )}
        </>
      )}

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        product={selectedProduct}
        isLoading={isSubmitting}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        product={selectedProduct}
        isLoading={isSubmitting}
      />
    </div>
  );
}
