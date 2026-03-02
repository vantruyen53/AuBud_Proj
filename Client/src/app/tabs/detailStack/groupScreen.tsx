import React from 'react';
import { View, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/theme';

export default function GroupScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ 
        height: 60, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Colors.light.textMain} />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          marginLeft: 16, 
          color: Colors.light.textMain 
        }}>
          Group Fund
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.light.textSub }}>..</Text>
      </View>
    </SafeAreaView>
  );
}
