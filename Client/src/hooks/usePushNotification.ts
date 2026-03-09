import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { API_URL } from "../constants/securityContants";
import Constants from 'expo-constants';

// Cấu hình cách hiển thị notification khi app đang mở
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  // Expo Push chỉ hoạt động trên thiết bị thật, không hoạt động trên simulator
  if (!Device.isDevice) {
    console.warn("[Push] Phải dùng thiết bị thật để nhận push notification");
    return null;
  }

  // Xin permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[Push] User từ chối permission push notification");
    return null;
  }

  // Lấy Expo Push Token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId 
      ?? Constants.easConfig?.projectId,
  });
  console.log("[Push] Expo Push Token:", tokenData.data);
  return tokenData.data;
}

/**
 * Hook đăng ký push notification.
 * Gọi trong HomeScreen sau khi login 
 */
export function usePushNotification(accessToken: string | null) {
  useEffect(() => {
    if (!accessToken) return;

    const register = async () => {
      const pushToken = await registerForPushNotifications();
      if (!pushToken) return;

      // Gửi push token lên server để lưu vào DB
      try {
        const res = await fetch(`${API_URL}/device/push-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ pushToken }),
        });
        const json = await res.json();
        console.log("[Push] Token saved to server:", json.success);
      } catch (err) {
        console.warn("[Push] Lưu token thất bại:", err);
      }
    };

    register();
  }, [accessToken]); // Chạy lại nếu accessToken thay đổi (sau refresh)
}