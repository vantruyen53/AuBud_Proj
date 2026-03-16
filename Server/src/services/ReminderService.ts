import UserRepository from "../data/repositories/auth/UserRepositoryImpl.js";
import { NotificationStrategy } from "../utils/strategies/NotificationStratery.js";
import { NotificationChannelFactory } from "../utils/factories/NotificationFactory.js";
import TokenRepositoryImpl from "../data/repositories/auth/TokenRepository.js";
import type{ ITokenRepository } from "../domain/models/auth/ITokenRepository.js";
import { NotificationType } from "../domain/enums/appEnum.js";
import pool from "../config/dbConfig.js";

const BATCH_SIZE = 100;

export class ReminderService{
    private userRepo: UserRepository;
    private tokenRepo: ITokenRepository;
    private notificationStrategy: NotificationStrategy;

    constructor() {
        this.userRepo = new UserRepository(pool);
        this.tokenRepo = new TokenRepositoryImpl();
        this.notificationStrategy = new NotificationStrategy(NotificationChannelFactory);
    }

    /**
     * Gửi reminder cho tất cả user chưa nhập giao dịch hôm nay.
     * Dùng batch processing: mỗi lần chỉ load BATCH_SIZE user vào RAM.
     */
    async sendDailyReminder(): Promise<void>{
        console.log("[Reminder] Bắt đầu gửi nhắc nhở hàng ngày...");
        let offset = 0;
        let totalSent = 0;
        let totalFailed = 0;

        while(true){
            const users = await this.userRepo.getUsersWithNoInputToday(offset, BATCH_SIZE);
            if (users.length === 0) break;

            console.log(`[Reminder] Batch offset=${offset} — ${users.length} users`);

            // 2. Gửi thông báo song song trong batch (Promise.allSettled không throw)
            const results = await Promise.allSettled(
                users.map(async (user) => {
                // Lấy tất cả push token còn hạn của user
                const pushTokens = await this.tokenRepo.getPushTokensByUserId(user.userId);

                const sends: Promise<any>[] = [
                    // In-app: lưu DB + emit socket nếu online
                    this.notificationStrategy.sendTo("in-app", {
                    recipientId: user.userId,
                    type:NotificationType.REMIND,
                    title: "Transaction entry reminder",
                    body: `Hi ${user.userName}! You haven't recorded any transactions today. Please update your records to manage your budget more effectively.`,
                    }),
                    // Push: gửi đến từng thiết bị của user
                    ...pushTokens.map((token) =>
                    this.notificationStrategy.sendTo("push", {
                        recipientId: user.userId,
                        deviceToken: token,
                        type:NotificationType.REMIND,
                        title: "Nhắc nhở nhập giao dịch",
                        body: `Hôm nay bạn chưa ghi nhận giao dịch nào. Hãy cập nhật ngay!`,
                    })
                    ),
                ];

                await Promise.allSettled(sends);
                })
            );

            // 3. Đếm kết quả
            results.forEach((r) => {
                if (r.status === "fulfilled") totalSent++;
                else {
                    totalFailed++;
                    console.error("[Reminder] Gửi thất bại:", r.reason);
                }
            });

            // 4. Nếu batch trả về ít hơn BATCH_SIZE → đã hết data
            if (users.length < BATCH_SIZE) break;
            offset += BATCH_SIZE;
        }

        console.log(
        `[Reminder] Hoàn tất — Thành công: ${totalSent} | Thất bại: ${totalFailed}`
        );
    }
}