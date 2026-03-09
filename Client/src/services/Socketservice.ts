import { io, type Socket } from "socket.io-client";
import type { INotification } from "../models/interface/Entities";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  

  /**
   * Kết nối socket với accessToken của user.
   * Gọi hàm này ngay sau khi login thành công.
   */
  connect(accessToken: string): void {
    if (this.socket?.connected) return;
    const SERVER_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

    this.socket = io(SERVER_URL, {
      auth: { token: accessToken }, // Server middleware sẽ verify token này
      transports: ["websocket"],    // Bỏ qua polling cho mobile
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }

  /**
   * Lắng nghe event "notification:new" từ server.
   * Gọi hàm này trong màn hình/component cần nhận notification.
   *
   * @example
   * useEffect(() => {
   *   const unsub = socketService.onNewNotification((noti) => {
   *     setNotifications(prev => [noti, ...prev]);
   *   });
   *   return unsub; // cleanup khi unmount
   * }, []);
   */
  onNewNotification(callback: (notification: INotification) => void): () => void {
    this.socket?.on("notification:new", callback);

    // Trả về hàm cleanup để dùng trong useEffect
    return () => {
      this.socket?.off("notification:new", callback);
    };
  }

  /**
   * Báo server rằng user đã đọc một notification.
   */
  markAsRead(notificationId: string): void {
    this.socket?.emit("notification:read", notificationId);
  }

  /**
   * Ngắt kết nối socket.
   * Gọi khi user logout.
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    console.log("[Socket] Manually disconnected");
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = SocketService.getInstance();