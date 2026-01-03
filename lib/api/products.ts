import api from "@/lib/api";
import type { ApiResponse, Product, ProductFilters } from "@/types/api";
import {
  cacheProducts,
  getCachedProducts,
  isProductsCacheValid,
} from "@/lib/offline/offline-store";

export async function getProducts(
  filters?: ProductFilters
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (filters?.category) {
    params.append("category", filters.category);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.isActive !== undefined) {
    params.append("active", String(filters.isActive));
  }

  // Check if online
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (isOnline) {
    try {
      const response = await api.get<ApiResponse<Product[]>>(
        `/products?${params.toString()}`
      );
      const products = response.data.data;

      // Cache products for offline use (only cache if no filters to get full list)
      if (!filters?.search && !filters?.category) {
        await cacheProducts(products);
      }

      return products;
    } catch (error) {
      // If network error, try cache
      console.warn("Network error, falling back to cache:", error);
      return getCachedProducts(filters);
    }
  } else {
    // Offline - use cached data
    return getCachedProducts(filters);
  }
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
}

/**
 * Check if products need refresh from server
 */
export async function shouldRefreshProducts(): Promise<boolean> {
  const cacheValid = await isProductsCacheValid();
  return !cacheValid;
}
