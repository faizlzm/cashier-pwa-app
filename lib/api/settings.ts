import api from "@/lib/api";
import {
  ApiResponse,
  BusinessSettings,
  UpdateBusinessSettingsRequest,
} from "@/types/api";

export const getBusinessSettings = async (): Promise<BusinessSettings> => {
  const response =
    await api.get<ApiResponse<BusinessSettings>>("/settings/business");
  return response.data.data;
};

export const updateBusinessSettings = async (
  data: UpdateBusinessSettingsRequest,
): Promise<BusinessSettings> => {
  const response = await api.put<ApiResponse<BusinessSettings>>(
    "/settings/business",
    data,
  );
  return response.data.data;
};
