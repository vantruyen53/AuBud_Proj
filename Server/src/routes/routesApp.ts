import express from "express";
import { AuthController } from '../controllers/authController.js'
import { AuthServiceImpl } from '../services/AuthServiceImpl.js';
import UserRepositoryImpl from '../data/repositories/UserRepositoryImpl.js';
import OTPRepository from '../data/repositories/OTPRepositoryImpl.js';
import TokenRepositoryImpl from '../data/repositories/TokenRepository.js';
import { TokenService } from '../services/tokenService.js';
import { registerValidation, loginValidation, verifyOTP, authenticateJWT, emailValidation, passwordValidation } from '../middlewares/authMiddleware.js';
import pool from '../config/dbConfig.js';

const router = express.Router();

// Khởi tạo các lớp theo đúng quan hệ phụ thuộc (DI)
const userRepo = new UserRepositoryImpl(pool); 
const otpRepo = new OTPRepository();
const tokenRepo = new TokenRepositoryImpl();

const tokenService = new TokenService(tokenRepo);
const authService = new AuthServiceImpl(userRepo, otpRepo, tokenService);
const authController = new AuthController(authService, tokenService);

//=====================AUTH API=====================
router.post('/aubud/api/v1/send-otp', authController.sendOtp); //checking wass successfully
router.post('/aubud/api/v1/verify-otp', verifyOTP(otpRepo), authController.verifyOtp);//checking wass successfully
router.post('/aubud/api/v1/register', registerValidation, authController.register);  //checking wass successfully
router.post('/aubud/api/v1/login', loginValidation, authController.login);  //checking wass successfully
router.post('/aubud/api/v1/refresh-token', authController.refreshToken); 
router.post('/aubud/api/v1/logout', authController.logOut);  //checking wass successfully

router.post('/aubud/api/v1/verify-email', emailValidation, authController.verifyEmail); //checking wass successfully
router.post('/aubud/api/v1/change-password', passwordValidation, authController.changePassWord); //checking wass successfully

router.post('/google',authController.loginWithGG);

export default router
