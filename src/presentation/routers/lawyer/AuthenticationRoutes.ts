import { Router } from "express";
import createControllers from "../../di/controllers";

const router = Router();
const { authLawyerController } = createControllers;

router.post("/", authLawyerController.signup.bind(authLawyerController));
router.post("/login", authLawyerController.signin.bind(authLawyerController));
router.post("/resend-otp", authLawyerController.resendOtp.bind(authLawyerController));
router.post("/validate-otp", authLawyerController.validateOtp.bind(authLawyerController));
router.get("/refresh", authLawyerController.refreshToken.bind(authLawyerController));
router.post("/forgot-password", authLawyerController.sendForgotPasswordMail.bind(authLawyerController));
router.patch("/update-password", authLawyerController.updatePassword.bind(authLawyerController));
router.get("/upload-url", authLawyerController.getUploadUrl.bind(authLawyerController));
router.put("/profile-image", authLawyerController.updateProfileImage.bind(authLawyerController));

export default router;
