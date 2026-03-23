import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import passport from 'passport';
import http from "http";
import cookieParser from "cookie-parser";

import pool from "./src/config/dbConfig.js";
import { connectRedis } from "./src/config/redis.js";
import { generateKeyPair } from "./src/utils/helpers/RSA.js";
import routerApp from "./src/routes/routesApp.js";
import routesWeb from "./src/routes/routesWeb.js";
import { initMarketScheduler } from "./src/config/scheduler.js";
import { MarketService } from "./src/services/applicationService/WebDataScrapService.js";
import { SocketService } from "./src/config/socket.js"; //
import { apiLimiter } from "./src/utils/helpers/rateLimit.js";

dotenv.config();

const app = express();
// 'trust proxy' cho phép Express tin tưởng các header mà ngrok gửi tới (như X-Forwarded-For)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

await connectRedis();
const marketService    = new MarketService(pool);

// ── Kiểm tra RSA key ────────────────────────────────────────────────────────
if (!process.env.RSA_PRIVATE_KEY || !process.env.RSA_PUBLIC_KEY){
    const { publicKey, privateKey } = generateKeyPair();
    console.log("=== COPY VÀO .env ===");
    console.log("RSA_PUBLIC_KEY=" + publicKey.replace(/\n/g, "\\n"));
    console.log("RSA_PRIVATE_KEY=" + privateKey.replace(/\n/g, "\\n"));
    console.log("====================");

    process.exit(0);
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",        // web admin dev
    "https://your-admin.vercel.app" // web admin production (sau này)
  ],
  credentials: true
}));
app.use(apiLimiter)
app.use(routerApp);
app.use(routesWeb);
app.use(passport.initialize());


// ── Tạo httpServer từ express app ────────────────────────────────────────────
// ⚠️ Phải dùng http.createServer thay vì app.listen
//    vì Socket.io cần attach vào httpServer, không phải express app
const httpServer = http.createServer(app);

// ── Khởi tạo SocketService (singleton) ──────────────────────────────────────
SocketService.init(httpServer);

// ── Start server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, async () => {
  await initMarketScheduler(marketService);
  console.log(`Server AuBud running on port ${PORT}`);
});