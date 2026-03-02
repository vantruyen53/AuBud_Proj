import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GroupScreen from '../app/tabs/detailStack/groupScreen';
import HistoryScreen from '../app/tabs/detailStack/HistoryScreen';
import AddTransactionScreen from '../app/tabs/detailStack/addTransaction';
import LayoutTabs from './_layoutTabs';
import AllCategory from '../app/tabs/detailStack/allCategory';
import NotifacationScreen from '../app/tabs/detailStack/notifationScreen';

const Stack = createNativeStackNavigator()

export default function LayoutDetailtack() {
  return (
    <Stack.Navigator>
        <Stack.Screen options={{headerShown:false}} name='main' component={LayoutTabs}/>
        <Stack.Screen options={{headerShown:false}} name='group' component={GroupScreen}/>
        <Stack.Screen options={{headerShown:false}} name='history' component={HistoryScreen}/>
        <Stack.Screen options={{headerShown:false}} name='addTransaction' component={AddTransactionScreen}/>
        <Stack.Screen options={{headerShown:false}} name='allCategory' component={AllCategory}/>
        <Stack.Screen options={{headerShown:false}} name='notifacation' component={NotifacationScreen}/>
    </Stack.Navigator>
  )
}