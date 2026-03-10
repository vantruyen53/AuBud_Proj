// hooks/useNotification.ts

import { useEffect, useCallback } from "react";
import { useNotificationStore } from "../store/application/NotificationStore";
import { socketService } from "../services/Socketservice";
import type { INotification } from "../models/interface/Entities";
import { API_URL } from "../constants/securityContants";


/**
 * Hook này làm 2 việc:
 * 1. Fetch notifications từ API khi mount (dùng trong layout chính, chạy 1 lần sau login)
 * 2. Lắng nghe socket "notification:new" để cập nhật realtime
 *
 * Dùng ở layout chính (không phải NotificationScreen) để badge luôn được cập nhật.
 */
export function useNotification(accessToken: string | null) {
  const { setNotifications, addNotification } = useNotificationStore();

  // ── 1. Fetch từ API ────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      
      if (json.success) {
        setNotifications(json.data.notifications as INotification[]);
      }
    } catch (err) {
      console.warn("[useNotification] Fetch error:", err);
    }
  }, [accessToken]);

  // ── 2. Lắng nghe socket realtime ───────────────────────────────────────────
  useEffect(() => {
    // Lắng nghe notification mới từ server
    const unsub = socketService.onNewNotification((noti) => {
      addNotification(noti);
    });

    return unsub; // cleanup khi unmount
  }, []);

  // ── 3. Fetch lần đầu ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { refetch: fetchNotifications };
}

/**
 * Hook dùng riêng trong NotificationScreen.
 * Khi user mở screen → gọi API mark-all-read + cập nhật local store.
 */
export function useMarkAllReadOnOpen(accessToken: string | null) {
  const { markAllAsReadLocal } = useNotificationStore();

  useEffect(() => {
    if (!accessToken) return;

    // Gọi API ngầm, không cần await vì UI cập nhật local ngay lập tức
    fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch((err) => console.warn("[markAllRead] Error:", err));

    // Cập nhật store ngay → badge về 0, dot biến mất
    markAllAsReadLocal();
  }, []); // Chỉ chạy 1 lần khi screen mount
}