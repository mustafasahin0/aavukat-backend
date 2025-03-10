import { Router } from "express";
import createControllers from "../../di/controllers";
import { authorizeLawyer, authorizeClient } from "../../di/middlewares";

const router = Router();
const { appointmentController } = createControllers;

router.get(
   "/client/details/:appointmentId",
   authorizeClient.exec,
   appointmentController.getAppointmentDetails.bind(appointmentController)
);
router.get(
   "/client/succuss/:paymentId",
   authorizeClient.exec,
   appointmentController.getAppointmentSuccussDetails.bind(appointmentController)
);
router.post("/client/", authorizeClient.exec, appointmentController.create.bind(appointmentController));
router.get("/client/", authorizeClient.exec, appointmentController.getAppointmentsClient.bind(appointmentController));
router.put("/client/", authorizeClient.exec, appointmentController.updateStatusAndNotes.bind(appointmentController));

router.get(
   "/lawyer/details/:appointmentId",
   authorizeLawyer.exec,
   appointmentController.getAppointmentDetails.bind(appointmentController)
);
router.get("/lawyer", authorizeLawyer.exec, appointmentController.getAppointmentsLawyer.bind(appointmentController));
router.put("/lawyer/", authorizeLawyer.exec, appointmentController.updateAppointment.bind(appointmentController));

export default router;

export const webhook = appointmentController.handleStripeWebhook.bind(appointmentController);
