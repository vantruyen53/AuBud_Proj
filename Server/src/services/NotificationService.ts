import nodemailer from "nodemailer";
import type {
  INotificationChannel,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "../domain/models/auth/INotification.js";
export class EmailNotificationChannel implements INotificationChannel {
  readonly channel: NotificationChannel = "email";
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true cho port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  isAvailable(payload: NotificationPayload): boolean {
    return !!payload.recipientEmail;
  }
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      await this.transporter.sendMail({
        from: `"Aubud Support" <${process.env.EMAIL_USER}>`,
        to: payload.recipientEmail,
        subject: payload.title,
        text: payload.body,
        // html: `<b>${payload.body}</b>`, // Bạn có thể thêm HTML cho đẹp
      });
      console.log(`[Email] → ${payload.recipientEmail} | ${payload.title}`);
      return {
        success: true,
        channel: this.channel,
        message: `Email sent successfully`,
        sentAt: new Date(),
      };
    } catch (error: any) {
      return {
        success: false,
        channel: this.channel,
        message: error.message,
        sentAt: new Date(),
      };
    }
  }
}
export class PushNotificationChannel implements INotificationChannel {
  readonly channel: NotificationChannel = "push";
  isAvailable(payload: NotificationPayload): boolean {
    // TODO: kiểm tra deviceToken có tồn tại và còn hợp lệ không
    return !!payload.deviceToken;
  }
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // TODO: tích hợp Firebase Admin SDK để gửi push notification
    // - Dùng payload.deviceToken làm target
    // - Dùng payload.title và payload.body làm nội dung notification
    // - Dùng payload.priority để set priority cho FCM message
    console.log(`[Push] → token: ${payload.deviceToken} | ${payload.title}`);
    return {
      success: true,
      channel: this.channel,
      message: `Push notification sent to device ${payload.deviceToken}`,
      sentAt: new Date(),
    };
  }
}
export class InAppNotificationChannel implements INotificationChannel {
  readonly channel: NotificationChannel = "in-app";
  isAvailable(_payload: NotificationPayload): boolean {
    // In-app luôn khả dụng vì chỉ cần lưu vào DB
    return true;
  }
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // TODO: lưu thông báo vào bảng notifications trong DB
    // - recipientId làm foreign key
    // - title, body làm nội dung
    // - đánh dấu isRead = false
    // - lưu timestamp
    console.log(`[In-App] → userId: ${payload.recipientId} | ${payload.title}`);
    return {
      success: true,
      channel: this.channel,
      message: `In-app notification saved for user ${payload.recipientId}`,
      sentAt: new Date(),
    };
  }
}
