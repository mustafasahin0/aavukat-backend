import express from "express";
import { authorizeLawyer } from "../../di/middlewares";
import createControllers from "../../di/controllers";

const router = express.Router();
const { slotController } = createControllers;

router.post("/day", authorizeLawyer.exec, slotController.createManyByDay.bind(slotController));
router.delete("/day", authorizeLawyer.exec, slotController.deleteSlots.bind(slotController));
router.post("/all-days", authorizeLawyer.exec, slotController.createForAllDays.bind(slotController));
router.delete("/all-days", authorizeLawyer.exec, slotController.deleteForAllDays.bind(slotController));
router.get("/lawyer", authorizeLawyer.exec, slotController.getAllLawyerSlots.bind(slotController));
router.get("/:lawyerId", slotController.getAllSlotsByLawyerId.bind(slotController));

export default router;
