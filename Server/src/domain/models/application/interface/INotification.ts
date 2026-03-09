// TYPE 
export type NotificationChannel = "email" | "push" | "in-app";
export interface NotificationPayload {
  recipientId: string;       // userId
  recipientEmail?: string;   // dùng cho email
  deviceToken?: string;      // dùng cho push
  title: string;
  body: string;
  priority?: "low" | "normal" | "high";
  metadata?: Record<string, unknown>; // // previousDevice, currentDevice, loginAt, ...
}
export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  message: string;
  sentAt: Date;
}
// INTERFACE CHUNG
export interface INotificationChannel {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
   // Kiểm tra kênh này có khả dụng không (ví dụ: FCM token còn hợp lệ không, email có hợp lệ không)
  isAvailable(payload: NotificationPayload): boolean;
}