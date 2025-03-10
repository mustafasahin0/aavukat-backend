import IAppointment, { AppointmentStatus, IExtendedAppointment } from "../../entities/IAppointment";
import { PaginatedResult } from "@/types";
import IClient from "../../entities/IClient";
import IRepository from "./IRepository";

export default interface IAppointmentRepository extends IRepository<IAppointment> {
   updateManyBySlotIdsNotInStatuses(
      slotIds: string[],
      fields: IAppointment,
      notInStatuses: AppointmentStatus[]
   ): Promise<IAppointment[] | null>;
   findByDateAndSlot(appointmentDate: string, slotId: string): Promise<IAppointment | null>;
   findManyByDateAndLawyerId(appointmentDate: string, lawyerId: string): Promise<IAppointment[] | null>;
   updateAppointmentStatusToConfirmed(appointmentId: string): Promise<void>;
   findDetailsById(appointmentId: string): Promise<IExtendedAppointment | null>;
   findManyByLawyerId(
      lawyerId: string,
      offset: number,
      limit: number,
      status?: AppointmentStatus
   ): Promise<PaginatedResult<IAppointment>>;
   findManyByClientId(
      clientId: string,
      offset: number,
      limit: number,
      status?: AppointmentStatus
   ): Promise<PaginatedResult<IAppointment>>;
   findManyByIds(ids: string[]): Promise<IAppointment[] | null>;
   findClientsByLawyerId(lawyerId: string, limit: number, offset: number): Promise<PaginatedResult<IClient>>;
   findManyAsExtendedByClientId(
      clientId: string,
      limit: number,
      offset: number
   ): Promise<PaginatedResult<IExtendedAppointment>>;
   getCountByRange(startTime: Date, endTime: Date): Promise<number>;
   getCountsByStatus(status: AppointmentStatus): Promise<number>;
   findBySlotIds(slotIds: string[]): Promise<IAppointment[]>;
   deleteMany(appointmentIds: string[]): Promise<void>;
}
