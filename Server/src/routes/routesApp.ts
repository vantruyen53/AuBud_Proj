import express from "express";
import pool from "../config/dbConfig.js";

const routerApp = express.Router();

//=====================AUTH API=====================
import { AuthController } from "../controllers/user/authController.js";
import { AuthServiceImpl } from "../services/AuthServiceImpl.js";
import UserRepositoryImpl from "../data/repositories/auth/UserRepositoryImpl.js";
import OTPRepository from "../data/repositories/auth/OTPRepositoryImpl.js";
import TokenRepositoryImpl from "../data/repositories/auth/TokenRepository.js";
import { TokenService } from "../services/tokenService.js";
import {registerValidation,loginValidation,verifyOTP,authenticateJWT,emailValidation,passwordValidation,} from "../middlewares/authMiddleware.js";
import passport from '../config/passport.js';

const userRepo = new UserRepositoryImpl(pool);
const otpRepo = new OTPRepository();
const tokenRepo = new TokenRepositoryImpl();

const tokenService = new TokenService(tokenRepo);
const authService = new AuthServiceImpl(userRepo, otpRepo, tokenService);
const authController = new AuthController(authService, tokenService, userRepo);

routerApp.get("/aubud/api/v1/auth/public-key", (req, res) => {
  const publicKey = process.env.RSA_PUBLIC_KEY?.replace(/\\n/g, "\n");

  if (!publicKey) {
    return res.status(500).json({ message: "Server chưa cấu hình RSA key" });
  }

  return res.status(200).json({ publicKey });
});
routerApp.post("/aubud/api/v1/auth/register",registerValidation,
  authController.register,
);
routerApp.post("/aubud/api/v1/auth/send-otp", authController.sendOtp);
routerApp.post("/aubud/api/v1/auth/verify-otp",verifyOTP(otpRepo),authController.verifyOtp,
);
routerApp.post("/aubud/api/v1/auth/login", loginValidation, authController.login);
routerApp.post("/aubud/api/v1/auth/logout", authController.logOut);
routerApp.post("/aubud/api/v1/auth/verify-email",emailValidation,authController.verifyEmail,);
routerApp.post("/aubud/api/v1/auth/reset-password",passwordValidation,authController.changePassWord,);
routerApp.post("/aubud/api/v1/auth/refresh-token", authController.refreshToken);
routerApp.get("/aubud/api/v1/auth/google",passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
routerApp.get(
  "/aubud/api/v1/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
);
// route
routerApp.post("/aubud/api/v1/auth/google/keybundle", authenticateJWT, authController.uploadKeyBundle);

//=====================TRANSACTION API=====================
import { TransactionController } from "../controllers/user/transactionController.js";
import { TransactionService } from "../services/applicationService/TransactionService.js";
import { TransactionRepository } from "../data/repositories/TransactionRepository.js";

const transactionRepo = new TransactionRepository(pool);
const transactionService = new TransactionService(transactionRepo, userRepo);
const transactionController = new TransactionController(transactionService);

routerApp.get("/aubud/api/v1/transaction",authenticateJWT,transactionController.getTransactions);
routerApp.get("/aubud/api/v1/summary",authenticateJWT, transactionController.getMonthlySpendingSummary)
routerApp.post("/aubud/api/v1/transaction",authenticateJWT,transactionController.create,);
routerApp.put("/aubud/api/v1/transaction",authenticateJWT,transactionController.update,);
routerApp.delete("/aubud/api/v1/transaction",authenticateJWT,transactionController.delete,);

//=====================WALLET API=====================
import { WalletRepositoryFactory } from "../utils/factories/WalletRepositoryFactory.js";
import { WalletService } from "../services/applicationService/WalletService.js";
import { WalletController } from "../controllers/user/walletController.js";
import { validateActionType, validateHistoryActionType,validateWalletBody,validateTransactionBody,validateConvertBody } from "../middlewares/wallet.middleware.js";

const factory    = new WalletRepositoryFactory(pool);
const service    = new WalletService(factory);
const controller = new WalletController(service); 

routerApp.get("/aubud/api/v1/wallet/all/",authenticateJWT,  controller.getAll)
routerApp.get("/aubud/api/v1/wallet/one/",authenticateJWT,  controller.getById)
routerApp.post('/aubud/api/v1/wallet/convert/',authenticateJWT,  validateConvertBody, controller.convert);

routerApp.post("/aubud/api/v1/wallet/:actionType",authenticateJWT, validateActionType, validateWalletBody, controller.create)
routerApp.put("/aubud/api/v1/wallet/:actionType/:walletId",authenticateJWT, validateActionType, validateWalletBody, controller.update)
routerApp.delete("/aubud/api/v1/wallet/:actionType/:walletId",authenticateJWT, validateActionType, controller.delete)

routerApp.get( '/aubud/api/v1/wallet/:actionType/:walletId/history', authenticateJWT,     validateHistoryActionType, controller.getHistory);
routerApp.post('/aubud/api/v1/wallet/:actionType/transaction',authenticateJWT,  validateHistoryActionType, validateTransactionBody, controller.createTransaction);
routerApp.delete('/aubud/api/v1/wallet/:actionType/transaction/:walletId',authenticateJWT,  validateHistoryActionType, controller.deleteHistoryTransaction);

//=====================CATEGORY API=====================
import { CategoryController } from "../controllers/user/categoryController.js";
import { CategoryService } from "../services/applicationService/CategoryService.js";
import { CategoryRepository } from "../data/repositories/CategoryRepository.js";

const categoryRepo = new CategoryRepository(pool)
const categoryService = new CategoryService(categoryRepo)
const categoryController = new CategoryController(categoryService)

routerApp.get("/aubud/api/v1/category/all/:userId",authenticateJWT, categoryController.getAllCategory)
routerApp.get("/aubud/api/v1/category/suggested/:userId",authenticateJWT, categoryController.getSuggestedCategory)

routerApp.put("/aubud/api/v1/category/",authenticateJWT, categoryController.updateCategory)
routerApp.post("/aubud/api/v1/category/",authenticateJWT, categoryController.createCategory)
routerApp.delete("/aubud/api/v1/category/:categoryId",authenticateJWT, categoryController.deleteCategory)


//=====================BUDGET API=====================
import { BudgetController } from "../controllers/user/BudgetController.js";
import { BudgetService } from "../services/applicationService/BudgetService.js";
import { BudgetRepository } from "../data/repositories/BudgetRepoImpl.js";
const budgetController = new BudgetController(new BudgetService(new BudgetRepository(pool)));

routerApp.get   ('/aubud/api/v1/budget/all', authenticateJWT, budgetController.getBudgets);
routerApp.post  ('/aubud/api/v1/budget/',    authenticateJWT, budgetController.createBudget);
routerApp.put   ('/aubud/api/v1/budget/:id', authenticateJWT, budgetController.updateBudget);
routerApp.delete('/aubud/api/v1/budget/:id', authenticateJWT, budgetController.deleteBudget);

//=====================MARKET API=====================
import { MarketService } from "../services/applicationService/WebDataScrapService.js";
import { MarketController } from "../controllers/user/webDataScrapeController.js";

const marketService    = new MarketService(pool);
const marketController = new MarketController(marketService);

routerApp.get('/aubud/api/v1/market', authenticateJWT, marketController.getMarketData)


//=====================NOTIFACTION API=====================
import { NotificationController } from "../controllers/user/notificationController.js";
const notificationController = new NotificationController();

routerApp.get("/aubud/api/v1/notifications", authenticateJWT, notificationController.getAll.bind(notificationController))
routerApp.patch("/aubud/api/v1/notifications/read-all", authenticateJWT, notificationController.markAllAsRead.bind(notificationController))


//=====================PUSH NOTIFICATION API=====================
import { DeviceController } from "../controllers/user/DeviceController.js";
const deviceController = new DeviceController();
routerApp.post("/aubud/api/v1/device/push-token",authenticateJWT,deviceController.savePushToken.bind(deviceController));


//=====================FEEDBACK API=====================
import { FeedbackController } from "../controllers/user/feedbackController.js";
import { FeedbackService } from "../services/applicationService/FeebackService.js";

const feedbackService = new FeedbackService(pool)
const feedbackController = new FeedbackController(feedbackService)

routerApp.post("/aubud/api/v1/feedback", authenticateJWT, feedbackController.send)


//=====================CHAT API PROXY=====================
import {validateChatBody, sanitizeChatInput } from '../middlewares/chatMiddleware.js';
import { chatController } from "../controllers/user/chatController.js";

routerApp.post("/aubud/api/v1/chat", authenticateJWT, validateChatBody, sanitizeChatInput, chatController)



//=================================API TEST RATE LIMIT========================
routerApp.get('/', (req,res)=>{
  res.send('Welcome to Aubud')
})

export default routerApp;
