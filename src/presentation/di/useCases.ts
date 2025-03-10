import CreateAppointmentUseCase from "@/use_case/appointment/CreateAppointmentUseCase";
import UpdateAppointmentUseCase from "@/use_case/appointment/UpdateAppointmentUseCase";
import ClientAuthenticationUseCase from "@/use_case/client/AuthenticationUseCase";
import LawyerAuthenticationUseCase from "@/use_case/lawyer/AuthenticationUseCase";
import GetAppointmentUseCase from "@/use_case/appointment/GetAppointmentUseCase";
import NotificationUseCase from "@/use_case/notification/NotificationUseCase";
import GetVideoSectionUseCase from "@/use_case/video/GetVideoSectionUseCase";
import AuthenticationUseCase from "@/use_case/admin/AuthenticationUseCase";
import UnauthenticatedUseCases from "@/use_case/UnauthenticatedUseCases";
import AdminClientUseCase from "@/use_case/admin/AdminClientUseCase";
import AdminLawyerUseCase from "@/use_case/admin/AdminLawyerUseCase";
import GetClientUseCase from "@/use_case/lawyer/GetClientUseCase";
import CreateSlotUseCase from "@/use_case/slot/CreateSlotUseCase";
import CreateChatUseCase from "@/use_case/chat/CreateChatUseCase";
import DeleteSlotUseCase from "@/use_case/slot/DeleteSlotUseCase";
import UpdateSlotUseCase from "@/use_case/slot/UpdateSlotUseCase";
import DashboardUseCase from "@/use_case/admin/DashboardUseCase";
import ClientUseCases from "@/use_case/client/ClientUseCases";
import ChatBotUseCase from "@/use_case/chatbot/ChatBotUseCase";
import GetChatUseCase from "@/use_case/chat/GetChatUseCase";
import GetSlotUseCase from "@/use_case/slot/GetSlotUseCase";
import S3StorageAdapter from "@/infrastructure/services/S3StorageAdapter";

import {
   appointmentRepository,
   chatBotMessageRepository,
   chatRepository,
   lawyerRepository,
   messageRepository,
   notificationRepository,
   otpRepository,
   clientRepository,
   paymentRepository,
   slotRepository,
   videoSectionRepository,
   legalHistoryRepository,
   adminRepository,
} from "./repositories";

import {
   bcryptService,
   geminiBotService,
   joiService,
   jwtService,
   nodeMailerService,
   s3StorageService,
   stripeService,
   tokenService,
   passwordService,
   emailService,
   uuidService,
} from "./services";

const s3StorageAdapter = new S3StorageAdapter(s3StorageService);

const createUseCases = () => ({
   authAdminUseCase: new AuthenticationUseCase(
      adminRepository,
      passwordService,
      tokenService,
      emailService,
      otpRepository,
      joiService
   ),
   dashboardUseCase: new DashboardUseCase(clientRepository, appointmentRepository, lawyerRepository, slotRepository),
   adminClientUseCase: new AdminClientUseCase(clientRepository, joiService),
   adminLawyerUseCase: new AdminLawyerUseCase(lawyerRepository),
   createAppointmentUseCase: new CreateAppointmentUseCase(
      appointmentRepository,
      slotRepository,
      joiService,
      stripeService,
      paymentRepository,
      videoSectionRepository,
      lawyerRepository,
      clientRepository,
      uuidService
   ),
   updateAppointmentUseCase: new UpdateAppointmentUseCase(
      appointmentRepository,
      joiService,
      notificationRepository,
      videoSectionRepository,
      stripeService,
      paymentRepository
   ),
   getAppointmentUseCase: new GetAppointmentUseCase(appointmentRepository, joiService, paymentRepository),
   createChatUseCase: new CreateChatUseCase(
      messageRepository,
      chatRepository,
      joiService,
      clientRepository,
      lawyerRepository
   ),
   getChatUseCase: new GetChatUseCase(messageRepository, chatRepository, joiService, clientRepository),
   chatBotUseCase: new ChatBotUseCase(chatBotMessageRepository, geminiBotService, joiService),
   authLawyerUseCase: new LawyerAuthenticationUseCase(
      lawyerRepository,
      passwordService,
      tokenService,
      emailService,
      otpRepository,
      s3StorageService,
      joiService
   ),
   getClientUseCase: new GetClientUseCase(appointmentRepository, joiService),
   notificationUseCase: new NotificationUseCase(notificationRepository, joiService),
   authClientUseCase: new ClientAuthenticationUseCase(
      clientRepository,
      passwordService,
      tokenService,
      emailService,
      otpRepository,
      joiService
   ),
   clientUseCases: new ClientUseCases(clientRepository, s3StorageAdapter),
   createSlotUseCase: new CreateSlotUseCase(slotRepository, joiService),
   deleteSlotUseCase: new DeleteSlotUseCase(slotRepository, appointmentRepository, joiService, notificationRepository),
   getSlotUseCase: new GetSlotUseCase(slotRepository, appointmentRepository, joiService),
   updateSlotUseCase: new UpdateSlotUseCase(slotRepository, joiService),
   getVideoSectionUseCase: new GetVideoSectionUseCase(videoSectionRepository, joiService, appointmentRepository),
   unauthenticatedUseCases: new UnauthenticatedUseCases(lawyerRepository),
});

const useCases = createUseCases();
export default useCases;
