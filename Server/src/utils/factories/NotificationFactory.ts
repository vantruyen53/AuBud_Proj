import type {
  NotificationChannel,
  INotificationChannel,
} from "../../domain/models/auth/INotification.js";
import {
  EmailNotificationChannel,
  PushNotificationChannel,
  InAppNotificationChannel,
} from "../../services/NotificationService.js";
export class NotificationChannelFactory {
  private static readonly registry: Map<
    NotificationChannel,
    INotificationChannel
  > = new Map([
    ["email", new EmailNotificationChannel()],
    ["push", new PushNotificationChannel()],
    ["in-app", new InAppNotificationChannel()],
  ]);

  static create(channel: NotificationChannel): INotificationChannel {
    const instance = this.registry.get(channel);
    if (!instance) {
      throw new Error(`Unknown notification channel: ${channel}`);
    }
    return instance;
  }

  //Tạo nhiều channel cùng lúc
  static createMany(channels: NotificationChannel[]): INotificationChannel[] {
    return channels.map((c) => this.create(c));
  }
}
