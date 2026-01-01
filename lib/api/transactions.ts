import api from "@/lib/api";
import type {
  ApiResponse,
  Transaction,
  TransactionFilters,
  CreateTransactionRequest,
  TodayTransactionsResponse,
  PaginatedResponse,
} from "@/types/api";

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<Transaction> {
  const response = await api.post<ApiResponse<Transaction>>(
    "/transactions",
    data
  );
  return response.data.data;
}

export async function getTransactions(
  filters?: TransactionFilters
): Promise<{
  data: Transaction[];
  pagination?: PaginatedResponse<Transaction>["pagination"];
}> {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.append("page", String(filters.page));
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.paymentMethod) {
    params.append("paymentMethod", filters.paymentMethod);
  }
  if (filters?.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    params.append("endDate", filters.endDate);
  }

  const response = await api.get<PaginatedResponse<Transaction>>(
    `/transactions?${params.toString()}`
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function getTodayTransactions(): Promise<TodayTransactionsResponse> {
  const response = await api.get<ApiResponse<TodayTransactionsResponse>>(
    "/transactions/today"
  );
  return response.data.data;
}

export async function getTransactionById(id: string): Promise<Transaction> {
  const response = await api.get<ApiResponse<Transaction>>(
    `/transactions/${id}`
  );
  return response.data.data;
}
