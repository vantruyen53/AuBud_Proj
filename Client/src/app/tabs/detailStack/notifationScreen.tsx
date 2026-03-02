import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Bell, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../constants/theme';
import { SwipeListView } from 'react-native-swipe-list-view';
import styles from '../../../assets/styles/notifationStyle';
import { INITIAL_NOTIFICATIONS } from '../../../store/seed/notification';

export default function NotificationScreen() {
  const navigation = useNavigation();
  // Quản lý danh sách thông báo
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Xử lý xóa một thông báo
  const deleteNotification = (id: string | number) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  // Xử lý xóa tất cả thông báo
  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    
    Alert.alert(
      "Confirmation",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: () => setNotifications([]) 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: typeof INITIAL_NOTIFICATIONS[0] }) => (
    <View style={styles.rowFrontVisible}>
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          !item.isRead && styles.unreadItem
        ]}
        activeOpacity={1}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          {item.icon}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderHiddenItem = (data: { item: typeof INITIAL_NOTIFICATIONS[0] }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.backRightBtn}
        onPress={() => deleteNotification(data.item.id)}
      >
        <Trash2 size={24} color="#FFF" />
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={Colors.light.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllNotifications}
        >
          <Trash2 size={20} color={notifications.length > 0 ? Colors.light.error : Colors.light.textSub} />
        </TouchableOpacity>
      </View>

      <SwipeListView
        data={notifications}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-80}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        disableRightSwipe
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={64} color={Colors.light.divider} />
            <Text style={styles.emptyText}>You have no notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}