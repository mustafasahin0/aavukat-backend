import { Router } from "express";
import createControllers from "../../di/controllers";

const router = Router();
const { lawyerController } = createControllers;

router.get("/clients", lawyerController.getClients.bind(lawyerController));

router.get("/case-history/:clientId", lawyerController.getClientLegalHistory.bind(lawyerController));

export default router;
