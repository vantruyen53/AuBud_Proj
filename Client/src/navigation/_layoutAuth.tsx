import {NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../app/auth/login';
import SignUpScreen from '../app/auth/signUpPage';
import OTPVerificationScreen from '../app/auth/verifyOTPScreen';
import ForgotPasswordScreen from '../app/auth/forgotPassworsScreen';
import ResetPasswordScreen from '../app/auth/resetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function LayoutAuth() {
  return (
    <Stack.Navigator>
        <Stack.Screen options={{headerShown:false}} name="LoginScreen" component={LoginScreen}/>
        <Stack.Screen options={{headerShown:false}} name="SignUpScreen" component={SignUpScreen}/>
        <Stack.Screen options={{headerShown:false}} name="OTPVerificationScreen" component={OTPVerificationScreen}/>
        <Stack.Screen options={{headerShown:false}} name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>
        <Stack.Screen options={{headerShown:false}} name="ResetPasswordScreen" component={ResetPasswordScreen}/>
    </Stack.Navigator>
  )
}