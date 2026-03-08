import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../app/tabs/HomeScreen';
import WalletScreen from '../app/tabs/WalletScreen';
import BudgetScreen from '../app/tabs/BudgetScreen';
import AnalysisScreen from '../app/tabs/AnalysisScreen';
import MoreScreen from '../app/tabs/MoreScreen';
import ChatAI from '../app/tabs/chatAI';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const Tab = createBottomTabNavigator();

export default function LayoutTabs() {
  return (
    <Tab.Navigator 
        screenOptions={{
        tabBarActiveTintColor: "#01b5eb",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 16,
          paddingTop: 8,
        },
      }}>
          <Tab.Screen  name="index" 
            options={{
              title: "Home",
              tabBarIcon: ({ color })=> <MaterialIcons name='home' size={24} color={color}/>
            }}
            component={HomeScreen}/>
          <Tab.Screen 
            name="wallet"
            options={{
              title: "Wallet",
              tabBarIcon: ({ color })=> <MaterialIcons name='account-balance-wallet' size={24} color={color}/>
            }}
            component={WalletScreen}/>
          <Tab.Screen 
            name="analysis" 
            options={{
                title: "Analysis",
                tabBarIcon: ({ color })=> <MaterialIcons name='bar-chart' size={24} color={color}/>  
            }}
            component={AnalysisScreen}/>
          <Tab.Screen 
            name="budget"
            options={{
              title: "Budget",
              tabBarIcon: ({ color })=> <MaterialIcons name='currency-exchange' size={24} color={color}/>
            }}
            component={BudgetScreen}/>
          <Tab.Screen 
            name="chat" 
            options={{
              title: "Chat",
              tabBarIcon: ({ color })=> <MaterialDesignIcons name='creation-outline' size={24} color={color}/>
            }}
            component={ChatAI}/>
          <Tab.Screen 
            name="more" 
            options={{
              title: "More",
              tabBarIcon: ({ color })=> <MaterialIcons name='now-widgets' size={24} color={color}/>
            }}
            component={MoreScreen}/>
    </Tab.Navigator>
  )
}