import { NotificationChannelFactory } from "../factories/NotificationFactory.js";
import type {NotificationChannel,NotificationPayload,NotificationResult,
} from "../../domain/interfaces/auth/INotification.js";
export class NotificationStrategy {
  constructor(private readonly factory: typeof NotificationChannelFactory) {}
  //Gửi qua một channel cụ thể
  async sendTo(
    channel: NotificationChannel,
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    const instance = this.factory.create(channel);

    if (!instance.isAvailable(payload)) {
      return {
        success: false,
        channel,
        message: `Channel ${channel} is not available for this payload`,
        sentAt: new Date(),
      };
    }
    return instance.send(payload);
  }
  //Gửi qua nhiều channel cùng lúc (song song) Một channel thất bại không ảnh hưởng channel khác
  async sendToMany(
  channels: NotificationChannel[],
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const availableInstances = this.factory
    .createMany(channels)
    .filter((i) => i.isAvailable(payload));

  const results = await Promise.allSettled(
    availableInstances.map((i) => i.send(payload))
  );
  return results.map((r, idx) => {
    if (r.status === "fulfilled") return r.value;
    const instance = availableInstances[idx]!;
    return {
      success: false,
      channel: instance.channel, // không còn undefined
      message: r.reason?.message ?? "Unknown error",
      sentAt: new Date(),
    } satisfies NotificationResult;
  });
}
}
