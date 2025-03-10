import { Router } from "express";
import { authorizeLawyer, authorizeClient } from "../../di/middlewares";
import createControllers from "../../di/controllers";

const router = Router();
const { videoController } = createControllers;

router.get("/client/day", authorizeClient.exec, videoController.getSectionsInOneDayClient.bind(videoController));
router.get("/client/:sectionId", authorizeClient.exec, videoController.getSectionById.bind(videoController));

router.use(authorizeLawyer.exec);
router.get("/lawyer/day", videoController.getSectionsInOneDayLawyer.bind(videoController));
router.get("/lawyer/:sectionId", videoController.getSectionById.bind(videoController));
router.get("/lawyer", videoController.getAllSectionsLawyer.bind(videoController));

export default router;
