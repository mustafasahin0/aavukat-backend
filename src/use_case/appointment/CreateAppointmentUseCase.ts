import IAppointment, { AppointmentStatus, AppointmentType } from "@/domain/entities/IAppointment";
import IVideoSectionRepository from "@/domain/interface/repositories/IVideoSectionRepository";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import IPaymentRepository from "@/domain/interface/repositories/IPaymentRepository";
import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import IPaymentService from "@/domain/interface/services/IPaymentService";
import { VideoSectionStatus } from "@/domain/entities/IVideoSection";
import IPayment, { PaymentStatus } from "@/domain/entities/IPayment";
import IUUIDService from "@/domain/interface/services/IUUIDService";
import { addMinutes, parse, format } from "@/utils/date-formatter";
import CustomError from "@/domain/entities/CustomError";
import IClient from "@/domain/entities/IClient";
import ILawyer from "@/domain/entities/ILawyer";
import { CLIENT_URL } from "@/config/env";
import { StatusCode } from "@/types";

export default class AppointmentUseCase {
   bookingAmount: number;

   constructor(
      private appointmentRepository: IAppointmentRepository,
      private slotRepository: ISlotRepository,
      private validatorService: IValidatorService,
      private paymentService: IPaymentService,
      private paymentRepository: IPaymentRepository,
      private videoSectionRepository: IVideoSectionRepository,
      private lawyerRepository: ILawyerRepository,
      private clientRepository: IClientRepository,
      private uuIdService: IUUIDService
   ) {
      this.bookingAmount = 300;
   }

   async exec(appointmentData: IAppointment, clientId: string): Promise<{ sessionId: string; checkoutUrl: string }> {
      this.validateAppointmentData(appointmentData, clientId);

      const client = await this.clientRepository.findById(clientId);
      const lawyer = await this.lawyerRepository.findById(appointmentData.lawyerId!);

      if (!client || !lawyer) throw new CustomError("Client or Lawyer Not Found", StatusCode.NotFound);

      const slot = await this.slotRepository.findById(appointmentData.slotId!);
      if (!slot) throw new CustomError("Slot Not Found", StatusCode.NotFound);

      if (!client.address) {
         throw new CustomError("Profile is missing", StatusCode.BadRequest);
      }

      if (slot.status === "booked") {
         const bookedAppointment = await this.appointmentRepository.findByDateAndSlot(
            appointmentData.appointmentDate! as string,
            appointmentData.slotId!
         );
         if (bookedAppointment) throw new CustomError("Slot already booked", StatusCode.Conflict);
      } else {
         slot.status = "booked";
         await this.slotRepository.update(slot._id!, slot);
      }

      const payment = await this.paymentRepository.create({
         orderId: "",
         appointmentId: appointmentData._id!,
         amount: this.bookingAmount,
         currency: "INR",
         status: PaymentStatus.PENDING,
      });

      const checkoutSession = await this.paymentService.createCheckoutSession(
         this.bookingAmount,
         "INR",
         `${CLIENT_URL}/new-appointment/${payment._id}`,
         `${CLIENT_URL}/new-appointment/cancel/${payment._id}`,
         { paymentId: payment._id?.toString() }
      );

      const appointment = await this.appointmentRepository.create({
         ...appointmentData,
         clientId,
         status: AppointmentStatus.PAYMENT_PENDING,
         paymentId: payment._id!,
      });

      await this.paymentRepository.update({
         _id: payment._id,
         orderId: checkoutSession.id,
         appointmentId: appointment._id,
      });

      await this.createVideoSection(appointment, client!, lawyer!, slot.startTime!);

      return { sessionId: checkoutSession.id, checkoutUrl: checkoutSession.url! };
   }

   private async createVideoSection(
      appointment: IAppointment,
      client: IClient,
      lawyer: ILawyer,
      slotStartTime: string
   ): Promise<void> {
      const appointmentDate = appointment.appointmentDate as string;
      const slotStartTimeFormatted = parse(slotStartTime, "hh:mm a", new Date(appointmentDate));

      const appointmentDurationMinutes = 60;
      const slotEndTime = addMinutes(slotStartTimeFormatted, appointmentDurationMinutes);

      const calculatedStartTime = format(slotStartTimeFormatted, "yyyy-MM-dd'T'HH:mm:ssXXX");
      const calculatedEndTime = format(slotEndTime, "yyyy-MM-dd'T'HH:mm:ssXXX");

      const randomId = this.uuIdService.generate();

      await this.videoSectionRepository.create({
         appointmentId: appointment._id!,
         clientName: client.name,
         lawyerName: lawyer.name,
         clientProfile: client.profile,
         lawyerProfile: lawyer.profileImage,
         startTime: calculatedStartTime,
         endTime: calculatedEndTime,
         createdAt: appointment.createdAt?.toString(),
         updatedAt: appointment.updatedAt?.toString(),
         status: VideoSectionStatus.PENDING,
         clientId: client._id!,
         lawyerId: lawyer._id!,
         roomId: randomId,
      });
   }

   async handleStripeWebhook(body: Buffer, signature: string): Promise<void> {
      const result = await this.paymentService.handleWebhookEvent(body, signature);
      const { event, transactionId, type } = result;

      if (!event || !event.data || !event.data.object) {
         return;
      }

      const paymentIntentMetadata = event.data.object.metadata as { paymentId: string };

      if (!paymentIntentMetadata || !paymentIntentMetadata.paymentId) {
         return;
      }

      await this.verifyPaymentIntent(paymentIntentMetadata.paymentId, transactionId, type);
   }

   private async verifyPaymentIntent(
      id: string,
      transactionId: string,
      type: "charge" | "paymentSuccess" | ""
   ): Promise<IPayment | null> {
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
         return null;
      }

      const fields: any = {
         _id: payment._id,
         status: PaymentStatus.COMPLETED,
      };

      if (type === "charge") {
         fields.paymentId = transactionId;
      }

      await this.paymentRepository.update(fields);

      await this.appointmentRepository.updateAppointmentStatusToConfirmed(payment.appointmentId!);

      return payment;
   }

   private validateAppointmentData(
      { appointmentDate, appointmentType, lawyerId, notes, reason, slotId }: IAppointment,
      clientId: string
   ): void {
      this.validatorService.validateRequiredFields({ slotId, appointmentType, lawyerId, reason, appointmentDate })!;
      this.validatorService.validateIdFormat(lawyerId!);
      this.validatorService.validateIdFormat(slotId!);
      this.validatorService.validateIdFormat(clientId!);
      this.validatorService.validateEnum(appointmentType!, Object.values(AppointmentType));
      this.validatorService.validateDateFormat(appointmentDate! as string);
      this.validatorService.validateLength(reason!, 1, 500);

      if (notes) this.validatorService.validateLength(notes, 0, 500);
   }
}
