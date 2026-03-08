import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import AppContextType from "../models/types/appContext";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { SECRET_KEY_STORE, API_URL } from "../constants/securityContants";
import { setSessionExpiredCallback } from "../services/auth/apiService";

const AppContext = createContext<AppContextType>({} as AppContextType);

interface JwtPayload {
  id: string;
  userName: string;
  role: string;
  exp: number;
}

const TOKEN_KEY         = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // exp là Unix timestamp tính bằng giây
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const AppProvider = ({children}:{children: ReactNode})=>{
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState('');
  const [id, setId] = useState<string>('');
  const [role, setRole] = useState('');
  const [userName, setuserName] = useState('');
  const [email, setEmail] = useState('')
  const [isShowData, setIsShowData] = useState(true)

  useEffect(() => {
    // Đăng ký callback một lần khi app khởi động
    setSessionExpiredCallback(() => {
      clearAuth(false);
    });
  }, []);

  // Chạy một lần khi app khởi động — kiểm tra token còn hợp lệ không
  useEffect(() => {
    checkAuthOnAppStart();
  }, []);

  const checkAuthOnAppStart = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!storedToken || isTokenExpired(storedToken)) {
        // Không có token hoặc đã hết hạn → thử refresh
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (storedRefresh) {
          await tryRefreshToken(storedRefresh);
        } else {
          // Không có gì cả → về login
          await clearAuth();
        }
      } else {
        // Token còn hợp lệ → khôi phục state
        const decoded = jwtDecode<JwtPayload>(storedToken);
        setAccessToken(storedToken);
        setId(decoded.id);
        setuserName(decoded.userName);
        setRole(decoded.role);
        setIsAuthenticated(true);
      }
    } catch {
      await clearAuth(false);
    } finally {
      setIsLoading(false);
    }
  };

  const tryRefreshToken = async (storedRefresh: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        if (!response.ok) throw new Error("Refresh thất bại");

        console.log('===============Try refresh token========')
        const data = await response.json();
        console.log('Status: ',data?'succees':'fail')
        console.log('Data:', data)
        await signIn(data.accessToken, data.refreshToken, data.user.email);
    } catch {
        await clearAuth(false); // ← false: giữ lại secretKey
    }
};

  const signIn = async (newAccessToken: string, newRefreshToken: string, email:string) => {
    const decoded = jwtDecode<JwtPayload>(newAccessToken);

    // Lưu vào SecureStore (Keychain iOS / Keystore Android)
    await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setId(decoded.id);
    setuserName(decoded.userName);
    setEmail(email)
    setRole(decoded.role);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    try {
        const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (storedRefreshToken) {
            fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
            }).catch((err) => console.error("Logout API error:", err));
        }
    } finally {
        await clearAuth(true);
    }
  };

  const clearAuth = async (clearSecret: boolean = false) => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    
    if (clearSecret) {
        await SecureStore.deleteItemAsync(SECRET_KEY_STORE);
    }

    setAccessToken("");
    setRefreshToken("");
    setId("");
    setuserName("");
    setEmail("")
    setRole("");
    setIsAuthenticated(false);
  };

  const toggleShowData = () =>{setIsShowData((pre)=> !pre)}
  
  return(
    <AppContext.Provider value={{isAuthenticated, isLoading, accessToken, refreshToken, id, userName, role, email, isShowData, signIn, signOut, toggleShowData}}>
        {children}
    </AppContext.Provider>
  )
}

export function useProvider() {
  const context =  useContext(AppContext); 
  if(!context)
    throw new Error('useProvider must be used within a AppProvider');
  return context;
}