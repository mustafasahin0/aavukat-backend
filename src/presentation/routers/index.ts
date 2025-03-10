import { Router } from "express";
import { authorizeAdmin, authorizeLawyer, authorizeClient, errorHandler } from "../di/middlewares";
import clientAuthentication from "./client/AuthenticationRoutes";
import lawyerAuthentication from "./lawyer/AuthenticationRoutes";
import appointmentRoutes from "./appointment/AppointmentRoutes";
import adminAuthentication from "./admin/AuthenticationRoutes";
import lawyerProtectedRoutes from "./lawyer/AuthorizedRoutes";
import videoSectionRoutes from "./video/VideoSectionRoute";
import protectedAdminRoutes from "./admin/AdminRoutes";
import protectedRoutes from "./client/ClientRoutes";
import createControllers from "../di/controllers";
import chatBotRoutes from "./chatbot/chatBotRoutes";
import slotRoutes from "./slots/SlotsRoutes";

const app = Router();
const { unauthenticatedController } = createControllers;

app.get("/lawyers", unauthenticatedController.getLawyers.bind(unauthenticatedController));
app.use("/lawyer/auth", lawyerAuthentication);
app.use("/lawyer", authorizeLawyer.exec, lawyerProtectedRoutes);
app.use("/client/auth", clientAuthentication);
app.use("/client", authorizeClient.exec, protectedRoutes);
app.use("/admin/auth", adminAuthentication);
app.use("/admin", authorizeAdmin.exec, protectedAdminRoutes);
app.use("/slots", slotRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/video", videoSectionRoutes);
app.use("/chatbot", authorizeClient.exec, chatBotRoutes);

app.use(errorHandler.exec.bind(errorHandler));

export default app;
