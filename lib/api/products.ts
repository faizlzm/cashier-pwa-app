import api from "@/lib/api";
import type { ApiResponse, Product, ProductFilters } from "@/types/api";

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

  const response = await api.get<ApiResponse<Product[]>>(
    `/products?${params.toString()}`
  );
  return response.data.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
}
