import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, ChevronLeft, Trash2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../../constants/theme";
import { SwipeListView } from "react-native-swipe-list-view";
import styles from "../../../assets/styles/notifaicationStyle";

import { useNotificationStore } from "@/src/store/application/NotificationStore";
import { useMarkAllReadOnOpen } from "@/src/hooks/useNotification";
import { useProvider } from "@/src/hooks/useProvider";

export default function NotificationScreen() {
  const navigation = useNavigation();
  const {accessToken } =useProvider();
  // ── Lấy data từ store ────────────────────────────────────
  const storeNotifications = useNotificationStore((s) => s.notifications);

  // Chụp snapshot lúc mới vào — giữ trạng thái isRead gốc để render
  const [snapshot] = useState(() => storeNotifications);

  // ── Đánh dấu đã đọc ngay khi mở screen ───────────────────────────────────
  useMarkAllReadOnOpen(accessToken);

  const notifications = snapshot;

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
          onPress: () => useNotificationStore.getState().clearAll(),
        },
      ],
    );
  };

  const renderItem = ({item,}: {item: (typeof notifications)[0];}) => (
    <View style={styles.rowFrontVisible}>
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        activeOpacity={1}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
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
          <Trash2
            size={20}
            color={
              notifications.length > 0
                ? Colors.light.error
                : Colors.light.textSub
            }
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
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
