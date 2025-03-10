import { Router } from "express";
import createControllers from "../../di/controllers";

const router = Router();
const { clientController, appointmentController } = createControllers;

router.get("/profile", clientController.getProfile.bind(clientController));
router.put("/profile", clientController.updateProfile.bind(clientController));
router.post("/profile/picture", clientController.uploadProfilePicture.bind(clientController));

// Use appointment controller for appointment-related routes
router.get("/appointments", appointmentController.getAppointmentsClient.bind(appointmentController));
router.get("/appointments/:appointmentId", appointmentController.getAppointmentDetails.bind(appointmentController));

export default router;
