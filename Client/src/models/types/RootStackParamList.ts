import { NavigationProp } from '@react-navigation/native';
import { ICategory,IWallet,ISaving,IDebt,ITransactionItem } from '../interface/Entities';

export type RootStackParamList = {
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  SignUpScreen: undefined,
  OTPVerificationScreen: {
    email: string;
    type: "register" | "forgot-password";
  };
  ResetPasswordScreen: {
    email: string;
  }
};

type TabsStackParamList = {
  home: undefined;
  group: undefined;
  history: undefined;
  addTransaction: {
    hanldeType?:"edit",
    payLoad?:IWallet|ISaving|IDebt|ITransactionItem,
  };
  allCategory: {
        typePar?: "Sending" | "Income" | "Debt" | "Saving" | "Convert",
        setIsOpenCatNameInput?: (status: boolean) => void,
        setSelectedCategory?: (category: ICategory) => void,
    };
  budget:undefined,
  notifacation:undefined,
};

export type HomeStackNavProp = NavigationProp<TabsStackParamList>
export type AuthNavigationProp = NavigationProp<RootStackParamList>;