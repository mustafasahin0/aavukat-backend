import { Router } from "express";
import createControllers from "../../di/controllers";

const router = Router();
const { authClientController } = createControllers;

router.post("/", authClientController.register.bind(authClientController));
router.post("/signin", authClientController.login.bind(authClientController));
router.post("/oauth", authClientController.oAuthSignin.bind(authClientController));
router.post("/resend-otp", authClientController.resendOtp.bind(authClientController));
router.post("/otp-verification", authClientController.validateOtp.bind(authClientController));
router.get("/refresh", authClientController.refreshToken.bind(authClientController));
router.post("/logout", authClientController.logout.bind(authClientController));

export default router;
