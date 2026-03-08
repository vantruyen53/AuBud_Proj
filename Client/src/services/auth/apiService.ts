import * as SecureStore from "expo-secure-store";

const API_URL       = process.env.EXPO_PUBLIC_API_URL!;
const TOKEN_KEY     = "accessToken";
const REFRESH_KEY   = "refreshToken";
const SECRET_KEY    = "secretKey";

// Callback để notify useProvider khi session hết hạn
// Được set từ bên ngoài một lần duy nhất khi app khởi động
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredCallback(cb: () => void) {
  onSessionExpired = cb;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) return null;

    const res = await fetch(`${API_URL}/aubud/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
    return data.accessToken;

  } catch {
    return null;
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = await SecureStore.getItemAsync(TOKEN_KEY);

  const makeRequest = (token: string) =>
    fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

  let response = await makeRequest(accessToken ?? "");

  // Token hết hạn → thử refresh
  if (response.status === 403) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      // Refresh thất bại → xóa hết, notify useProvider logout
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      await SecureStore.deleteItemAsync(SECRET_KEY);
      onSessionExpired?.(); // ← gọi callback để useProvider clearAuth
      throw new Error("SESSION_EXPIRED");
    }

    response = await makeRequest(newToken);
  }

  return response;
}