import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import AppContextType from "../models/types/appContext";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { SECRET_KEY_STORE, API_URL } from "../constants/securityContants";
import { setSessionExpiredCallback, setTokenRefreshedCallback } from "../services/auth/apiService";
import { WalletScreenData } from "../store/application/WalletApp";
import { WalletApp } from "@/src/store/application/WalletApp";


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
  const [walletScreen, setWalletScreen] = useState<WalletScreenData>({
    rawData: {
        wallets: [],
        savings: [],
        debts: [],
        groupFunds: [],
      },
      summary: {
        totalWalletBalance: 0,
        totalSavingBalance: 0,
        totalGroupFundBalance: 0,
        totalLoanFrom: 0,
        totalLoanTo: 0,
      },
      totalNetWorth: 0,
  })

  useEffect(() => {
    // Chạy một lần khi app khởi động — kiểm tra token còn hợp lệ không
    checkAuthOnAppStart();
    
    // Đăng ký callback một lần khi app khởi động
    setSessionExpiredCallback(() => {
      clearAuth(false);
    });

    setTokenRefreshedCallback((newToken: string) => {
      const decoded = jwtDecode<JwtPayload>(newToken);
      setAccessToken(newToken);
      setId(decoded.id);
      setuserName(decoded.userName);
      setRole(decoded.role);
    });
  }, []);

  const checkAuthOnAppStart = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!storedToken || isTokenExpired(storedToken)) {
        console.log('=====Token đã hết hạn ============')
        // Không có token hoặc đã hết hạn → thử refresh
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (storedRefresh) {
          console.log('===========Bắt đầu refresh lại token===============')
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
        console.log('===============Try refresh token========')
        const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        console.log("[tryRefresh] status:", response.status);

        if (!response.ok) throw new Error("Refresh thất bại");

        const data = await response.json();
        console.log("[tryRefresh] data keys:", Object.keys(data));

        console.log("[tryRefresh] data user:", {...data.user});

        await signIn(data.accessToken, data.refreshToken, data.user.email);
    } catch(e)  {
        console.log("[tryRefresh] error:", e);
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

  const refreshWallet = async (id:string, token:string) => {
    const walletApp = new WalletApp({id, accessToken:token})
    try {
      const result = await walletApp.loadWalletScreenData(false);
      if (result) {
        setWalletScreen(result); // Cập nhật "nguồn sự thật duy nhất"
      }
    } catch (error) {
      console.error("Lỗi khi load lại ví:", error);
    }
  };
  
  return(
    <AppContext.Provider value={{
      isAuthenticated, isLoading, accessToken, refreshToken, id, userName, role, email, isShowData, 
      walletScreen,
      signIn, signOut, toggleShowData,refreshWallet}}>
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