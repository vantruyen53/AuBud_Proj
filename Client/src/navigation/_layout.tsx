import CustomSplashScreen from '../app/CustomSplashScreen';
import {preventAutoHideAsync, hideAsync} from 'expo-splash-screen';
import { useEffect } from 'react';
import {NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LayoutAuth from '../navigation/_layoutAuth';
import LayoutDetailtack from '../navigation/_layoutDetailStack';
import { useProvider } from '../hooks/useProvider';

const Stack = createStackNavigator();

export default function RootPrvider() {
  return (
    <NavigationContainer>
        <Stack.Navigator >
            <Stack.Screen options={{ headerShown: false }} name="CustomSplashScreen" component={CustomSplashScreen}/>
            <Stack.Screen options={{ headerShown: false }} name="LayoutAuth" component={LayoutAuth}/>
            <Stack.Screen options={{ headerShown: false }} name="LayoutTabs" component={LayoutDetailtack}/>
        </Stack.Navigator>
    </NavigationContainer>
  )
}