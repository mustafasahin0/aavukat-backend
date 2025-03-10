import { Router } from "express";
import createControllers from "../../di/controllers";

const router = Router();

const { adminController, adminClientController, adminLawyerController } = createControllers;

router.get("/client-gender", adminController.getGenderStatistics.bind(adminController));
router.get("/users-months", adminController.getUsersStatistics.bind(adminController));
router.get("/appointment-status", adminController.getAppointmentsStatisticsByStatus.bind(adminController));
router.get("/appointment-month", adminController.getAppointmentsPerMonthStatistics.bind(adminController));
router.get("/slot-usage", adminController.getSlotUsageStatistics.bind(adminController));

// Client routes
router.get("/client", adminClientController.getClients.bind(adminClientController));
router.put("/client/:clientId/block", adminClientController.updateClient.bind(adminClientController));
router.put("/client/:clientId/unblock", adminClientController.updateClient.bind(adminClientController));

// Lawyer routes
router.get("/lawyer", adminLawyerController.getLawyers.bind(adminLawyerController));
router.put("/lawyer/:lawyerId/verify", adminLawyerController.verifyLawyer.bind(adminLawyerController));
router.put("/lawyer/:lawyerId/block", adminLawyerController.blockLawyer.bind(adminLawyerController));
router.put("/lawyer/:lawyerId/unblock", adminLawyerController.unblockLawyer.bind(adminLawyerController));

export default router;
