type AppContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: String;
    refreshToken: String,
    id: String,
    role: String,
    isShowData: boolean,
    signIn: (accessToken: string, refreshToken: string) => Promise<void>;
    signOut: ()=>Promise<void>
    toggleShowData: () => void
}

export default AppContextType;