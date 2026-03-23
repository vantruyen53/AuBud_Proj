import { NotificationChannelFactory } from "../factories/NotificationFactory.js";
import type {
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "../../domain/models/application/interface/INotification.js";
import { LogService } from '../../services/systemLogService.js'; // adjust path

// Map channel → actionDetail để log rõ ràng
const channelActionMap: Record<NotificationChannel, string> = {
  'email':  'notification.email',
  'push':   'notification.push',
  'in-app': 'notification.inapp',
};

async function logNotificationResult(
  result: NotificationResult,
  actor:'admin'|'system',
  recipientId?: string,
): Promise<void> {
  const actionBase = channelActionMap[result.channel] ?? `notification.${result.channel}`;

  await LogService.write({
    message: result.success
      ? `${result.channel} notification sent successfully`
      : `${result.channel} notification failed: ${result.message}`,
    actor_type: actor,
    type: 'info',
    status: result.success ? 'success' : 'failure',
    actionDetail: result.success ? `${actionBase}.sent` : `${actionBase}.failed`,
    actorId: recipientId as string,
    metaData: {
      channel: result.channel,
      sentAt: result.sentAt,
      ...(result.success ? {} : { reason: result.message }),
    } as any,
  });
}

export class NotificationStrategy {
  constructor(private readonly factory: typeof NotificationChannelFactory) {}

  // ── Gửi qua một channel cụ thể ────────────────────────────────
  async sendTo(
    channel: NotificationChannel,
    payload: NotificationPayload,
    actor:'admin'|'system'='system'
  ): Promise<NotificationResult> {
    const instance = this.factory.create(channel);

    // Channel không available (VD: push nhưng không có deviceToken)
    if (!instance.isAvailable(payload)) {
      const result: NotificationResult = {
        success: false,
        channel,
        message: `Channel ${channel} is not available for this payload`,
        sentAt: new Date(),
      };

      await LogService.write({
        message: `${channel} notification skipped: channel not available`,
        actor_type: 'system',
        type: 'warning',
        status: 'failure',
        actionDetail: `${channelActionMap[channel] ?? `notification.${channel}`}.unavailable`,
        actorId: payload.recipientId,
        metaData: { channel, reason: 'channel_not_available' } as any,
      });

      return result;
    }

    const result = await instance.send(payload);
    await logNotificationResult(result, actor, payload.recipientId);
    return result;
  }

  // ── Gửi qua nhiều channel song song ───────────────────────────
  async sendToMany(
    channels: NotificationChannel[],
    payload: NotificationPayload,
    actor:'admin'|'system'='system'
  ): Promise<NotificationResult[]> {
    const availableInstances = this.factory
      .createMany(channels)
      .filter((i) => i.isAvailable(payload));

    // Log các channel bị skip do không available
    const skippedChannels = this.factory
      .createMany(channels)
      .filter((i) => !i.isAvailable(payload));

    for (const skipped of skippedChannels) {
      await LogService.write({
        message: `${skipped.channel} notification skipped: channel not available`,
        actor_type: 'system',
        type: 'warning',
        status: 'failure',
        actionDetail: `${channelActionMap[skipped.channel] ?? `notification.${skipped.channel}`}.unavailable`,
        actorId: payload.recipientId,
        metaData: { channel: skipped.channel, reason: 'channel_not_available' } as any,
      });
    }

    const settled = await Promise.allSettled(
      availableInstances.map((i) => i.send(payload)),
    );

    const results: NotificationResult[] = settled.map((r, idx) => {
      if (r.status === "fulfilled") return r.value;
      const instance = availableInstances[idx]!;
      return {
        success: false,
        channel: instance.channel,
        message: r.reason?.message ?? "Unknown error",
        sentAt: new Date(),
      } satisfies NotificationResult;
    });

    // Log tất cả kết quả song song
    await Promise.allSettled(
      results.map((result) => logNotificationResult(result, actor, payload.recipientId))
    );

    return results;
  }
}