// controller/NotificationController.ts

import type { Request, Response } from "express";
import { NotificationRepository } from "../data/repositories/NotificationRepository.js";

const notificationRepo = new NotificationRepository();

export class NotificationController {
  /**
   * GET /notifications
   * Lấy toàn bộ notifications của user đang đăng nhập.
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id as string;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const notifications = await notificationRepo.findByUserId(userId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      res.status(200).json({
        success: true,
        data: { notifications, unreadCount },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /notifications/read-all
   * Đánh dấu tất cả notifications là đã đọc.
   * Gọi khi user mở NotificationScreen.
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id as string;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const updatedCount = await notificationRepo.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        data: { updatedCount },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}