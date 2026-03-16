import express from "express";
import pool from "../config/dbConfig.js";

const router = express.Router();

//=====================AUTH API=====================
import { AuthController } from "../controllers/authController.js";
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

router.get("/aubud/api/v1/auth/public-key", (req, res) => {
  const publicKey = process.env.RSA_PUBLIC_KEY?.replace(/\\n/g, "\n");

  if (!publicKey) {
    return res.status(500).json({ message: "Server chưa cấu hình RSA key" });
  }

  return res.status(200).json({ publicKey });
});
router.post("/aubud/api/v1/auth/register",registerValidation,
  authController.register,
);
router.post("/aubud/api/v1/auth/send-otp", authController.sendOtp);
router.post("/aubud/api/v1/auth/verify-otp",verifyOTP(otpRepo),authController.verifyOtp,
);
router.post("/aubud/api/v1/auth/login", loginValidation, authController.login);
router.post("/aubud/api/v1/auth/logout", authController.logOut);
router.post("/aubud/api/v1/auth/verify-email",emailValidation,authController.verifyEmail,);
router.post("/aubud/api/v1/auth/reset-password",passwordValidation,authController.changePassWord,);
router.post("/aubud/api/v1/auth/refresh-token", authController.refreshToken);
router.get("/aubud/api/v1/auth/google",passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/aubud/api/v1/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
);
// route
router.post("/aubud/api/v1/auth/google/keybundle", authenticateJWT, authController.uploadKeyBundle);

//=====================TRANSACTION API=====================
import { TransactionController } from "../controllers/transactionController.js";
import { TransactionService } from "../services/applicationService/TransactionService.js";
import { TransactionRepository } from "../data/repositories/TransactionRepository.js";

const transactionRepo = new TransactionRepository(pool);
const transactionService = new TransactionService(transactionRepo, userRepo);
const transactionController = new TransactionController(transactionService);

router.get("/aubud/api/v1/transaction",authenticateJWT,transactionController.getTransactions);
router.get("/aubud/api/v1/summary",authenticateJWT, transactionController.getMonthlySpendingSummary)
router.post("/aubud/api/v1/transaction",authenticateJWT,transactionController.create,);
router.put("/aubud/api/v1/transaction",authenticateJWT,transactionController.update,);
router.delete("/aubud/api/v1/transaction",authenticateJWT,transactionController.delete,);

//=====================WALLET API=====================
import { WalletRepositoryFactory } from "../utils/factories/WalletRepositoryFactory.js";
import { WalletService } from "../services/applicationService/WalletService.js";
import { WalletController } from "../controllers/walletController.js";
import { validateActionType, validateHistoryActionType,validateWalletBody,validateTransactionBody,validateConvertBody } from "../middlewares/wallet.middleware.js";

const factory    = new WalletRepositoryFactory(pool);
const service    = new WalletService(factory);
const controller = new WalletController(service); 

router.get("/aubud/api/v1/wallet/all/",authenticateJWT,  controller.getAll)
router.get("/aubud/api/v1/wallet/one/",authenticateJWT,  controller.getById)
router.post('/aubud/api/v1/wallet/convert/',authenticateJWT,  validateConvertBody, controller.convert);

router.post("/aubud/api/v1/wallet/:actionType",authenticateJWT, validateActionType, validateWalletBody, controller.create)
router.put("/aubud/api/v1/wallet/:actionType/:walletId",authenticateJWT, validateActionType, validateWalletBody, controller.update)
router.delete("/aubud/api/v1/wallet/:actionType/:walletId",authenticateJWT, validateActionType, controller.delete)

router.get( '/aubud/api/v1/wallet/:actionType/:walletId/history', authenticateJWT,     validateHistoryActionType, controller.getHistory);
router.post('/aubud/api/v1/wallet/:actionType/transaction',authenticateJWT,  validateHistoryActionType, validateTransactionBody, controller.createTransaction);
router.delete('/aubud/api/v1/wallet/:actionType/transaction/:walletId',authenticateJWT,  validateHistoryActionType, controller.deleteHistoryTransaction);

//=====================CATEGORY API=====================
import { CategoryController } from "../controllers/categoryController.js";
import { CategoryService } from "../services/applicationService/CategoryService.js";
import { CategoryRepository } from "../data/repositories/CategoryRepository.js";

const categoryRepo = new CategoryRepository(pool)
const categoryService = new CategoryService(categoryRepo)
const categoryController = new CategoryController(categoryService)

router.get("/aubud/api/v1/category/all/:userId",authenticateJWT, categoryController.getAllCategory)
router.get("/aubud/api/v1/category/suggested/:userId",authenticateJWT, categoryController.getSuggestedCategory)

router.put("/aubud/api/v1/category/",authenticateJWT, categoryController.updateCategory)
router.post("/aubud/api/v1/category/",authenticateJWT, categoryController.createCategory)
router.delete("/aubud/api/v1/category/:categoryId",authenticateJWT, categoryController.deleteCategory)


//=====================BUDGET API=====================
import { BudgetController } from "../controllers/BudgetController.js";
import { BudgetService } from "../services/applicationService/BudgetService.js";
import { BudgetRepository } from "../data/repositories/BudgetRepoImpl.js";
const budgetController = new BudgetController(new BudgetService(new BudgetRepository(pool)));

router.get   ('/aubud/api/v1/budget/all', authenticateJWT, budgetController.getBudgets);
router.post  ('/aubud/api/v1/budget/',    authenticateJWT, budgetController.createBudget);
router.put   ('/aubud/api/v1/budget/:id', authenticateJWT, budgetController.updateBudget);
router.delete('/aubud/api/v1/budget/:id', authenticateJWT, budgetController.deleteBudget);

//=====================MARKET API=====================
import { MarketService } from "../services/applicationService/WebDataScrapService.js";
import { MarketController } from "../controllers/webDataScrapeController.js";

const marketService    = new MarketService(pool);
const marketController = new MarketController(marketService);

router.get('/aubud/api/v1/market', authenticateJWT, marketController.getMarketData)


//=====================NOTIFACTION API=====================
import { NotificationController } from "../controllers/notificationController.js";
const notificationController = new NotificationController();

router.get("/aubud/api/v1/notifications", authenticateJWT, notificationController.getAll.bind(notificationController))
router.patch("/aubud/api/v1/notifications/read-all", authenticateJWT, notificationController.markAllAsRead.bind(notificationController))


//=====================PUSH NOTIFICATION API=====================
import { DeviceController } from "../controllers/DeviceController.js";
const deviceController = new DeviceController();
router.post("/aubud/api/v1/device/push-token",authenticateJWT,deviceController.savePushToken.bind(deviceController));


//=====================FEEDBACK API=====================
import { FeedbackController } from "../controllers/feedbackController.js";
import { FeedbackService } from "../services/applicationService/FeebackService.js";

const feedbackService = new FeedbackService(pool)
const feedbackController = new FeedbackController(feedbackService)

router.post("/aubud/api/v1/feedback", authenticateJWT, feedbackController.send)


//=====================CHAT API PROXY=====================
import {validateChatBody, sanitizeChatInput } from '../middlewares/chatMiddleware.js';
import { chatController } from "../controllers/chatController.js";

router.post("/aubud/api/v1/chat", authenticateJWT, validateChatBody, sanitizeChatInput, chatController)



//=================================API TEST RATE LIMIT========================
router.get('/', (req,res)=>{
  res.send('Welcome to Aubud')
})

export default router;
