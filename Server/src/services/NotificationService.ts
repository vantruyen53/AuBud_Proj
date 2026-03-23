import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import type {
  INotificationChannel,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "../domain/models/application/interface/INotification.js";
import { NotificationType } from "../domain/enums/appEnum.js";
import { NotificationRepository } from "../data/repositories/NotificationRepository.js";
import { SocketService } from "../config/socket.js";

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
    try {
      const message = {
        to: payload.deviceToken,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.metadata ?? {},
      };

      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(message),
      });

      const result = await res.json();

      if (result?.data?.status === "ok") {
        console.log(`[Push] ✅ → ${payload.deviceToken} | ${payload.title}`);
        return {
          success: true,
          channel: this.channel,
          message: "Push notification sent successfully",
          sentAt: new Date(),
        };
      }

      const errorMsg = result?.data?.message ?? "Unknown push error";
      console.warn(`[Push] ❌ → ${payload.deviceToken} | ${errorMsg}`);
      return {
        success: false,
        channel: this.channel,
        message: errorMsg,
        sentAt: new Date(),
      };
    } catch (error:any) {
       return {
        success: false,
        channel: this.channel,
        message: error.message,
        sentAt: new Date(),
      };
    }
  }
}

export class InAppNotificationChannel implements INotificationChannel {
  readonly channel: NotificationChannel = "in-app";

  private notificationRepo = new NotificationRepository();

  isAvailable(_payload: NotificationPayload): boolean {
    // In-app luôn khả dụng vì chỉ cần lưu vào DB
    return true;
  }
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // 1️⃣ Lưu vào DB trước (dù user online hay offline đều lưu)
      const saved = await this.notificationRepo.create({
        userId: payload.recipientId,
        type: payload.type ?? NotificationType.SYSTEM,
        title: payload.title,
        description: payload.body,
        metadata: payload.metadata ?? null,
      });

      console.log('[IN-APP] Save result: ', saved)

      // 2️⃣ Nếu user đang online → emit socket realtime
      const socketService = SocketService.getInstance();
        const isOnline = socketService.emitToUser(
          payload.recipientId,
          "notification:new",   // tên event phía React Native sẽ lắng nghe
          {
            id: saved.id,
            title: saved.title,
            description: saved.description,
            type: saved.type,
            time: saved.time,
            isRead: false,
            metadata: saved.metadata,
          }
        );

      console.log(
        `[In-App] → userId=${payload.recipientId} | "${payload.title}" | online=${isOnline}`
      );

      return {
        success: true,
        channel: this.channel,
        message: isOnline
          ? "In-app notification saved and delivered in realtime"
          : "In-app notification saved (user offline, will see on next open)",
        sentAt: new Date(),
      };
    } catch (error: any) {
      console.error("[In-App] Error:", error);
      return {
        success: false,
        channel: this.channel,
        message: error.message,
        sentAt: new Date(),
      };
    }
  }
}
