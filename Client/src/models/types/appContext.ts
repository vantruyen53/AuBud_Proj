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
    signIn: (accessToken: string, refreshToken: string, email:string) => Promise<void>;
    signOut: ()=>Promise<void>
    toggleShowData: () => void
}

export default AppContextType;