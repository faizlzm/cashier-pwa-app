import api from "@/lib/api";
import type { ApiResponse, DashboardSummary } from "@/types/api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<ApiResponse<DashboardSummary>>(
    "/reports/summary"
  );
  return response.data.data;
}
