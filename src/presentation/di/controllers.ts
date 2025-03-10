import AppointmentController from "../controllers/appointment/AppointmentControllers";
import AuthClientController from "../controllers/client/AuthenticationController";
import UnauthenticatedControllers from "../controllers/UnauthenticatedControllers";
import AuthLawyerController from "../controllers/lawyer/AuthenticationController";
import AdminClientController from "../controllers/admin/AdminClientController";
import AuthAdminController from "../controllers/admin/AuthenticationController";
import AdminLawyerController from "../controllers/admin/AdminLawyerController";
import ClientController from "../controllers/client/ClientController";
import ChatBotController from "../controllers/chatbot/ChatBotController";
import LawyerController from "../controllers/lawyer/LawyerController";
import AdminController from "../controllers/admin/AdminController";
import VideoController from "../controllers/video/VideoController";
import SlotController from "../controllers/slot/SlotController";

import createUseCase from "./useCases";

const {
   adminLawyerUseCase,
   adminClientUseCase,
   authAdminUseCase,
   authLawyerUseCase,
   authClientUseCase,
   chatBotUseCase,
   createAppointmentUseCase,
   createSlotUseCase,
   dashboardUseCase,
   deleteSlotUseCase,
   getAppointmentUseCase,
   getClientUseCase,
   getSlotUseCase,
   getVideoSectionUseCase,
   clientUseCases,
   unauthenticatedUseCases,
   updateAppointmentUseCase,
   updateSlotUseCase,
} = createUseCase;

const createControllers = () => ({
   adminController: new AdminController(dashboardUseCase),
   adminLawyerController: new AdminLawyerController(adminLawyerUseCase),
   adminClientController: new AdminClientController(adminClientUseCase),
   appointmentController: new AppointmentController(
      createAppointmentUseCase,
      getAppointmentUseCase,
      updateAppointmentUseCase
   ),
   chatBotController: new ChatBotController(chatBotUseCase),
   lawyerController: new LawyerController(getClientUseCase),
   clientController: new ClientController(clientUseCases),
   authLawyerController: new AuthLawyerController(authLawyerUseCase),
   authClientController: new AuthClientController(authClientUseCase),
   slotController: new SlotController(createSlotUseCase, updateSlotUseCase, getSlotUseCase, deleteSlotUseCase),
   videoController: new VideoController(getVideoSectionUseCase),
   unauthenticatedController: new UnauthenticatedControllers(unauthenticatedUseCases),
   authAdminController: new AuthAdminController(authAdminUseCase),
});

export default createControllers();
