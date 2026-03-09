// config/socket.ts
import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

// ---------------------------------------------------- types --
interface JwtPayload {
  id: string;
  userName: string;
  role: string;
}

// ---------------------------------------------------- class --
export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer;

  // Map userId → Set<socketId>
  // Một user có thể mở app trên nhiều tab/thiết bị cùng lúc
  private userSockets: Map<string, Set<string>> = new Map();

  private constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // TODO: thay bằng domain cụ thể khi production
        methods: ["GET", "POST"],
      },
    });

    this.registerMiddleware();
    this.registerEvents();
    console.log("[Socket.io] Server initialized");
  }

  // ─── Singleton accessor ───────────────────────────────────────────────────
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error(
        "[SocketService] Chưa được khởi tạo. Gọi SocketService.init(httpServer) trong server.ts trước."
      );
    }
    return SocketService.instance;
  }

  static init(httpServer: HttpServer): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(httpServer);
    }
    return SocketService.instance;
  }

  // ─── Middleware: xác thực JWT khi client kết nối ──────────────────────────
  private registerMiddleware(): void {
    this.io.use((socket: Socket, next) => {
      // Client phải gửi accessToken trong handshake auth
      // Phía React Native: socket = io(URL, { auth: { token: accessToken } })
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error("SOCKET_UNAUTHORIZED: Thiếu token"));
      }

      try {
        const secret = process.env.ACCESS_TOKEN_SECRET!;
        const payload = jwt.verify(token, secret) as JwtPayload;

        // Đính userId vào socket để dùng về sau
        (socket as any).userId = payload.id;
        next();
      } catch {
        next(new Error("SOCKET_UNAUTHORIZED: Token không hợp lệ hoặc đã hết hạn"));
      }
    });
  }

  // ─── Events: connect / disconnect ────────────────────────────────────────
  private registerEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      const userId = (socket as any).userId as string;

      // Thêm socketId vào map của userId
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      console.log(`[Socket.io] ✅ User connected | userId=${userId} | socketId=${socket.id}`);

      // ── Client tự đánh dấu đã đọc thông báo ──
      socket.on("notification:read", (notificationId: string) => {
        console.log(`[Socket.io] notification:read | userId=${userId} | id=${notificationId}`);
        // TODO (bước sau): gọi NotificationRepository.markAsRead(notificationId, userId)
      });

      // ── Cleanup khi disconnect ──
      socket.on("disconnect", () => {
        this.userSockets.get(userId)?.delete(socket.id);
        if (this.userSockets.get(userId)?.size === 0) {
          this.userSockets.delete(userId);
        }
        console.log(`[Socket.io] ❌ User disconnected | userId=${userId} | socketId=${socket.id}`);
      });
    });
  }

  // ─── Public: emit thông báo đến một user cụ thể ──────────────────────────
  /**
   * Gửi một notification đến tất cả socket của userId.
   * Nếu user không online → không làm gì (đã lưu DB rồi, user sẽ thấy khi mở app).
   * Trả về true nếu user đang online, false nếu offline.
   */
  emitToUser(userId: string, event: string, data: unknown): boolean {
    const sockets = this.userSockets.get(userId);

    if (!sockets || sockets.size === 0) {
      console.log(`[Socket.io] User ${userId} offline — bỏ qua emit`);
      return false;
    }

    sockets.forEach((socketId) => {
      this.io.to(socketId).emit(event, data);
    });

    console.log(`[Socket.io] Emitted "${event}" → userId=${userId} (${sockets.size} socket)`);
    return true;
  }

  /**
   * Kiểm tra user có đang online không.
   */
  isUserOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }
}