import axios from 'axios';
import type { Dispatch } from "react";
import type { AuthAction } from "../../Context/AuthContext";

const BASE_URL = 'https://overfaint-inferible-lizzie.ngrok-free.dev/aubud/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // ✅ bắt buộc cho HttpOnly Cookie
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // ✅ bỏ warning page của ngrok
  },
});

const tokenRef = { current: null as string | null };
export const updateAccessToken = (token: string | null) => {
  tokenRef.current = token; // ← cập nhật ngay lập tức, không cần recreate interceptor
};

export const setupInterceptors = (dispatch: Dispatch<AuthAction>
) => {
  // ---- Request Interceptor ----
  const reqInterceptor = apiClient.interceptors.request.use((config) => {
    const token = tokenRef.current;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ---- Response Interceptor ----
  const resInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // ✅ Gọi refresh — HttpOnly Cookie tự động gửi kèm nhờ withCredentials
          const res = await apiClient.post("/auth/refresh-token");
          const { accessToken: newAccessToken } = res.data;

           updateAccessToken(newAccessToken);

          // ✅ Update AuthContext để các component khác nhận token mới
          dispatch({
            type: "REFRESH_TOKEN",
            payload: { accessToken: newAccessToken, user: res.data.user },
          });

          // ✅ Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh thất bại → logout
          dispatch({ type: "LOGOUT" });
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  // ✅ Trả về cleanup function — dùng khi component unmount
  return () => {
    apiClient.interceptors.request.eject(reqInterceptor);
    apiClient.interceptors.response.eject(resInterceptor);
  };
};