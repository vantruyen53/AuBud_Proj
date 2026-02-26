import { NavigationProp } from '@react-navigation/native';
import { ICategory } from '../IApp';

export type RootStackParamList = {
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  SignUpScreen: undefined,
  OTPVerificationScreen: undefined;
  ResetPasswordScreen: {
    email: string;
  }
};

type TabsStackParamList = {
  home: undefined;
  group: undefined;
  history: undefined;
  addTransaction: undefined;
  allCategory: {
        typePar?: "Sending" | "Income" | "Debt" | "Saving" | "Convert",
        setIsOpenCatNameInput?: (status: boolean) => void,
        setSelectedCategory: (category: ICategory) => void,
    };
  budget:undefined,
  notifacation:undefined,
};

export type HomeStackNavProp = NavigationProp<TabsStackParamList>
export type AuthNavigationProp = NavigationProp<RootStackParamList>;