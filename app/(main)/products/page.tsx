"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Package,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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

  // Filter Modal Logic
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);
  const [tempCategoryFilter, setTempCategoryFilter] = React.useState<
    Category | ""
  >("");
  const [tempStatusFilter, setTempStatusFilter] = React.useState<
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

  // Filter Logic
  const openFilterModal = () => {
    setTempCategoryFilter(categoryFilter);
    setTempStatusFilter(statusFilter);
    setIsFilterModalOpen(true);
  };

  const applyFilters = () => {
    setCategoryFilter(tempCategoryFilter);
    setStatusFilter(tempStatusFilter);
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("all");
    setIsFilterModalOpen(false); // Close modal on reset? Or keep open? Consisted with Flutter: Just reset state.
  };

  const isFilterActive = categoryFilter !== "" || statusFilter !== "all";

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Manajemen Produk
            </h2>
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="bg-card h-9 sm:h-10 text-sm w-full"
              />
            </div>
            <Button
              variant={isFilterActive ? "default" : "outline"}
              size="icon"
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 relative"
              title="Filter Produk"
              onClick={openFilterModal}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isFilterActive && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 border-2 border-background rounded-full" />
              )}
            </Button>
          </div>

          {/* Active Filter Chips */}
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
              {categoryFilter && (
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 text-xs font-normal"
                >
                  <span>
                    {categoryFilter === "FOOD"
                      ? "Makanan"
                      : categoryFilter === "DRINK"
                        ? "Minuman"
                        : categoryFilter}
                  </span>
                  <button
                    onClick={() => setCategoryFilter("")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 text-xs font-normal"
                >
                  <span>
                    {statusFilter === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={resetFilters}
              >
                Reset Semua
              </Button>
            </div>
          )}
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

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Produk"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center -mt-2 mb-2">
            <span className="text-xs text-muted-foreground">
              Sesuaikan filter produk
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-destructive hover:text-destructive hover:bg-transparent"
              onClick={() => {
                setTempCategoryFilter("");
                setTempStatusFilter("all");
              }}
            >
              Reset
            </Button>
          </div>

          {/* Category Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Semua", value: "" },
                { label: "Makanan", value: "FOOD" },
                { label: "Minuman", value: "DRINK" },
              ].map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    tempCategoryFilter === option.value ? "default" : "outline"
                  }
                  className="cursor-pointer px-3 py-1.5 hover:opacity-80 transition-opacity"
                  onClick={() =>
                    setTempCategoryFilter(option.value as Category | "")
                  }
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Status Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Semua", value: "all" },
                { label: "Aktif", value: "active" },
                { label: "Nonaktif", value: "inactive" },
              ].map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    tempStatusFilter === option.value ? "default" : "outline"
                  }
                  className="cursor-pointer px-3 py-1.5 hover:opacity-80 transition-opacity"
                  onClick={() =>
                    setTempStatusFilter(
                      option.value as "all" | "active" | "inactive",
                    )
                  }
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={applyFilters} className="w-full">
              Terapkan Filter
            </Button>
          </div>
        </div>
      </Modal>

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
