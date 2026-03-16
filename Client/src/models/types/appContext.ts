import { WalletScreenData } from "@/src/store/application/WalletApp";

type AppContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string;
    refreshToken: string,
    id: string,
    userName: string,
    email:string
    role: string,
    isShowData: boolean,
    walletScreen:WalletScreenData
    signIn: (accessToken: string, refreshToken: string, email:string) => Promise<void>;
    signOut: ()=>Promise<void>
    toggleShowData: () => void,
    refreshWallet:(id:string, token:string)=> Promise<void>;
}

export default AppContextType;