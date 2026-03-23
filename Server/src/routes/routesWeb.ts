import express from "express";
import pool from "../config/dbConfig.js";
import {authenticateJWT} from "../middlewares/authMiddleware.js";


const routesWeb = express.Router();

//======================DASHBOARD=================
import { DashBoardController } from "../controllers/admin/dashboardController.js";
import { DashBoardService } from "../services/adminService/dashboardService.js";

const dashboardService = new DashBoardService(pool)
const dashboardController = new DashBoardController(dashboardService)

routesWeb.get("/aubud/api/v1/dashboard/systems-tatus/",authenticateJWT, dashboardController.getSystemStats)
routesWeb.get("/aubud/api/v1/dashboard/daily-active/:period", authenticateJWT, dashboardController.getDailyActive)
routesWeb.get("/aubud/api/v1/dashboard/transaction-input/:period", authenticateJWT, dashboardController.getTransactionInput)
routesWeb.get("/aubud/api/v1/dashboard/ai-usage/:period", authenticateJWT, dashboardController.getAIUsage)

//======================USER MANAGEMENT=================
import { UserManaController } from "../controllers/admin/userManacontroller.js";
import { UserManaService } from "../services/adminService/userManaService.js";

const userManaService = new UserManaService(pool)
const userManaController = new UserManaController(userManaService)

routesWeb.get("/aubud/api/v1/user-management/:role/", authenticateJWT, userManaController.getUser)
routesWeb.post("/aubud/api/v1/user-management/:userId/", authenticateJWT, userManaController.ban)

//======================SYSTEM LOG=================
import { LogController } from "../controllers/admin/systemLogController.js";

const systemLogController = new LogController();

routesWeb.get("/aubud/api/v1/system-log/stats", authenticateJWT, systemLogController.getLogStats)
routesWeb.get("/aubud/api/v1/system-log/:type/", authenticateJWT, systemLogController.getLog)

//======================FEEDBACK=================
import { FeedbackController } from "../controllers/user/feedbackController.js";
import { FeedbackService } from "../services/applicationService/FeebackService.js";

const feedbackController = new FeedbackController(new FeedbackService(pool))

routesWeb.get("/aubud/api/v1/feedback/stats", authenticateJWT, feedbackController.getStats)
routesWeb.get("/aubud/api/v1/feedback/:type", authenticateJWT, feedbackController.get)
routesWeb.post("/aubud/api/v1/feedback/:id/:isMark", authenticateJWT, feedbackController.mark)


//======================NOTIFICATION=================
import { AdminNotificationController } from "../controllers/admin/notificationController.js";
import { AdminNotificationService } from "../services/adminService/notificationService.js";
import { AdminNotificationRepo } from "../data/repositories/admin/AdminNotificationRepo.js";
import UserRepositoris from "../data/repositories/auth/UserRepositoryImpl.js";

const adminNotifiService = new AdminNotificationService(new AdminNotificationRepo(pool),  new UserRepositoris(pool));
const adminNotifiController = new AdminNotificationController(adminNotifiService);

routesWeb.get("/aubud/api/v1/admin-notifications", authenticateJWT, adminNotifiController.get)
routesWeb.post("/aubud/api/v1/admin-notifications/send",authenticateJWT, adminNotifiController.sent )

export default routesWeb;
