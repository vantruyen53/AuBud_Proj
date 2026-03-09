
import { create } from "zustand";
import type { INotification } from "../../models/interface/Entities"; // adjust path nếu cần

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;

  // Gọi khi fetch từ API về (lần đầu mở app / pull to refresh)
  setNotifications: (notifications: INotification[]) => void;

  // Gọi khi nhận notification mới qua socket realtime
  addNotification: (notification: INotification) => void;

  // Gọi khi user mở NotificationScreen → tất cả thành đã đọc ở local
  markAllAsReadLocal: () => void;

  // Reset khi logout
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      // Notification mới từ socket luôn là chưa đọc
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },

  markAllAsReadLocal: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));