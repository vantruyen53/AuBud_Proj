import { useReducer, type ReactNode, useEffect } from "react";
import { AuthContext } from "../hooks/useContext";
import { apiClient, setupInterceptors,updateAccessToken } from "../utils/configs/axios.config";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: string;
  userName: string;
  role: string;
  exp: number;
  email?:string
}

interface AdminUser {
  id: string;
  name: string;
  email?: string;
  role: "admin" | "superadmin";
}

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: AdminUser | null;
};

export type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: AdminUser; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "REFRESH_TOKEN";
      payload: { accessToken: string; user: AdminUser };
    };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        isAuthenticated: true,
        isLoading: false,
        accessToken: action.payload.accessToken,
        user: action.payload.user,
      };

    case "LOGOUT":
      return {
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        user: null,
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "REFRESH_TOKEN":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };

    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // true vì app cần check session trước
  accessToken: null,
  user: null,
};

export interface AuthContextType extends AuthState {
  signIn: (accessToken: string, email: string) => void;
  signOut: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const TOKEN_KEY = "accessToken";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreSession = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      // ✅ Bước 1: Kiểm tra accessToken trong sessionStorage trước
      const savedToken = sessionStorage.getItem(TOKEN_KEY);
      console.log('Token: ', savedToken)

      if (savedToken) {
        try {
          const decode = jwtDecode<JwtPayload>(savedToken);
          const isExpired = decode.exp * 1000 < Date.now();
          console.log('Token is expired: ', isExpired)
          if (!isExpired) {
            updateAccessToken(savedToken);
            // Token còn hạn → dùng luôn, không cần gọi server
            const user: AdminUser = {
              id: decode.id,
              name: decode.userName,
              role: decode.role as "admin" | "superadmin",
              email: decode.email ?? "",
            };
            dispatch({
              type: "REFRESH_TOKEN",
              payload: { accessToken: savedToken, user },
            });
            return; // ← dừng, không gọi /auth/refresh-token
          }
        } catch {
          // Token lỗi → xóa đi, gọi refresh bên dưới
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }

      console.log('Start refresh token')
      // ✅ Bước 2: Không có token hoặc token hết hạn → gọi refresh
      try {
        const res = await apiClient.post("/auth/refresh-token");
        const { accessToken, user } = res.data;

        console.log('New token:', accessToken)
        sessionStorage.setItem(TOKEN_KEY, accessToken); // ← lưu lại
        updateAccessToken(accessToken);
        dispatch({
          type: "REFRESH_TOKEN",
          payload: { accessToken, user },
        });
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        dispatch({ type: "LOGOUT" });
      }
    };

    restoreSession();
  }, []);

    useEffect(() => {
      const cleanup = setupInterceptors(dispatch);
      return cleanup;
    }, []);

  const signIn = (accessToken: string, email: string) => {
    const decode = jwtDecode<JwtPayload>(accessToken);
    const user: AdminUser = {
      id: decode.id,
      name: decode.userName,
      role: decode.role as 'admin' | 'superadmin',
      email,
    };
    sessionStorage.setItem('accessToken', accessToken);
    updateAccessToken(accessToken); 
    dispatch({ type: 'LOGIN_SUCCESS', payload: { accessToken, user } });
  };

  const signOut = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      updateAccessToken(null);
      dispatch({ type: "LOGOUT" });
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await apiClient.post("/auth/change-password", { oldPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
