import TokenRepository from "../data/repositories/auth/TokenRepository.js";

const tokenRepo = new TokenRepository();

export class DeviceController{
    /**
     * POST /device/push-token
     * App gửi lên sau khi xin permission và lấy được Expo Push Token.
     * Body: { pushToken: string }
     */

    async savePushToken(req: any, res: any): Promise<void>{
        try {
            const userId = req.user?.id as string;

            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const { pushToken } = req.body;
            if (!pushToken || typeof pushToken !== "string") {
                res.status(400).json({ success: false, message: "pushToken is required" });
                return;
            }

            // Lấy device_info từ header
            const deviceInfo = req.headers["user-agent"] || "Unknown Device";

            await tokenRepo.updatePushToken(userId, deviceInfo, pushToken);

            res.status(200).json({ success: true, message: "Push token saved" });
        } catch (error:any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}