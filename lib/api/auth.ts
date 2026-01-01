import api, { setTokens, clearTokens } from "@/lib/api";
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/api";

// Response type matching actual API response
interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function login(data: LoginRequest): Promise<LoginResult> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    data
  );
  const { user, accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return { user, accessToken, refreshToken };
}

export async function register(data: RegisterRequest): Promise<LoginResult> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    data
  );
  const { user, accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return { user, accessToken, refreshToken };
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}

export async function refreshToken(
  token: string
): Promise<{ accessToken: string }> {
  const response = await api.post<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh",
    { refreshToken: token }
  );
  const { accessToken } = response.data.data;
  // Note: refresh endpoint only returns new accessToken, not refreshToken
  const currentRefreshToken =
    localStorage.getItem("cashier_refresh_token") || "";
  setTokens(accessToken, currentRefreshToken);
  return { accessToken };
}

export function logout(): void {
  clearTokens();
}
