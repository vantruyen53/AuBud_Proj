import { useContext, createContext } from "react";
import {type AuthContextType } from "../Context/AuthContext";
import type{UserSelectedJSON} from '../pages/UserManagementPage';

interface AppContextType{
  totalUser:number, 
  userSelected:UserSelectedJSON[],
  setTotalUser:(total:number) => void
  handleSelected:(users:UserSelectedJSON[])=>void,
  handleSelectMore:(allUsers: UserSelectedJSON[])=>void,
  handleRemoveBatch:(idsToRemove: string[])=>void,
  clearSelected:()=>void
}

export  const AuthContext = createContext<AuthContextType | null >(null)
export const AppContext = createContext<AppContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


export const useAppContext = ()=>{
  const context = useContext(AppContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}