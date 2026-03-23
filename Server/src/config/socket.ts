import { Server as SocketIOServer, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { LogService } from '../services/systemLogService.js'; // adjust path

interface JwtPayload {
  id: string;
  userName: string;
  role: string;
}

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map();

  private constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.registerMiddleware();
    this.registerEvents();
    console.log("[Socket.io] Server initialized");
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error(
        "[SocketService] Chưa được khởi tạo. Gọi SocketService.init(httpServer) trước."
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

  // ─── Middleware: xác thực JWT ────────────────────────────────
  private registerMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      const ipAddress = socket.handshake.address;

      // ── Không có token ──────────────────────────────────────
      if (!token) {
        await LogService.write({
          message: 'Socket connection attempt without token',
          actor_type: 'system',
          type: 'auth',
          status: 'failure',
          actionDetail: 'socket.auth.missing_token',
          ipAddress,
          metaData: { transport: socket.conn.transport.name } as any,
        });
        return next(new Error("SOCKET_UNAUTHORIZED: Thiếu token"));
      }

      // ── Verify token ────────────────────────────────────────
      try {
        const secret = process.env.ACCESS_TOKEN_SECRET!;
        const payload = jwt.verify(token, secret) as JwtPayload;
        (socket as any).userId = payload.id;
        next();
      } catch (error: any) {
        // Token invalid hoặc expired
        await LogService.write({
          message: `Socket auth failed: ${error.message}`,
          actor_type: 'system',
          type: 'auth',
          status: 'failure',
          actionDetail: 'socket.auth.invalid_token',
          ipAddress,
          metaData: {
            error: error.message,
            // Không log raw token — chỉ log lý do
            reason: error.name === 'TokenExpiredError' ? 'token_expired' : 'token_invalid',
          } as any,
        });
        next(new Error("SOCKET_UNAUTHORIZED: Token không hợp lệ hoặc đã hết hạn"));
      }
    });
  }

  // ─── Events ──────────────────────────────────────────────────
  private registerEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      const userId = (socket as any).userId as string;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      console.log(`[Socket.io] ✅ User connected | userId=${userId} | socketId=${socket.id}`);
      // Không log mỗi lần connect vào DB — quá nhiều noise, chỉ log lỗi auth là đủ

      socket.on("notification:read", (notificationId: string) => {
        console.log(`[Socket.io] notification:read | userId=${userId} | id=${notificationId}`);
        // TODO: gọi NotificationRepository.markAsRead(notificationId, userId)
      });

      socket.on("disconnect", () => {
        this.userSockets.get(userId)?.delete(socket.id);
        if (this.userSockets.get(userId)?.size === 0) {
          this.userSockets.delete(userId);
        }
        console.log(`[Socket.io] ❌ User disconnected | userId=${userId} | socketId=${socket.id}`);
        // Không log disconnect vào DB — quá nhiều noise
      });
    });
  }

  // ─── Public API ───────────────────────────────────────────────
  emitToUser(userId: string, event: string, data: unknown): boolean {
    const sockets = this.userSockets.get(userId);

    if (!sockets || sockets.size === 0) {
      console.log(`[Socket.io] User ${userId} offline — skip emit`);
      return false;
    }

    sockets.forEach((socketId) => {
      this.io.to(socketId).emit(event, data);
    });

    console.log(`[Socket.io] Emitted "${event}" → userId=${userId} (${sockets.size} socket)`);
    return true;
  }

  isUserOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }
}