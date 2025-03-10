import IAppointment, { AppointmentStatus, IExtendedAppointment } from "@/domain/entities/IAppointment";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import { PaginatedResult } from "@/types";
import AppointmentModel from "../model/AppointmentModel";
import { getPaginatedResult } from "./getPaginatedResult";
import IClient from "@/domain/entities/IClient";
import { ObjectId } from "mongodb";

export default class AppointmentRepository implements IAppointmentRepository {
   model = AppointmentModel;

   async create(appointment: IAppointment): Promise<IAppointment> {
      return await this.model.create(appointment);
   }

   async findById(id: string): Promise<IAppointment | null> {
      return await this.model.findById(id);
   }

   async update(id: string, appointment: IAppointment): Promise<IAppointment | null> {
      return await this.model.findByIdAndUpdate(id, appointment, { new: true });
   }

   async findManyByIds(ids: string[]): Promise<IAppointment[] | null> {
      return await this.model.find({ _id: { $in: ids } });
   }

   async findBySlotIds(slotIds: string[]): Promise<IAppointment[]> {
      return await this.model.find({ slotId: { $in: slotIds } });
   }

   async deleteMany(appointmentIds: string[]): Promise<void> {
      await this.model.deleteMany({ _id: { $in: appointmentIds } });
   }

   async findClientsByLawyerId(lawyerId: string, limit: number, offset: number): Promise<PaginatedResult<IClient>> {
      const result = await this.model
         .aggregate([
            {
               $match: { lawyerId: new ObjectId(lawyerId) },
            },
            {
               $group: { _id: "$clientId" },
            },
            {
               $lookup: {
                  from: "clients",
                  localField: "_id",
                  foreignField: "_id",
                  as: "clientInfo",
               },
            },
            {
               $unwind: "$clientInfo",
            },
            {
               $replaceRoot: { newRoot: "$clientInfo" },
            },
            {
               $facet: {
                  paginatedResults: [
                     { $skip: limit * offset },
                     { $limit: limit },
                     {
                        $project: {
                           password: 0,
                           token: 0,
                        },
                     },
                  ],
                  totalCount: [{ $count: "count" }],
               },
            },
         ])
         .exec();

      const clients = result[0].paginatedResults;
      const totalItems = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

      return getPaginatedResult(totalItems, offset, limit, clients);
   }

   async findDetailsById(appointmentId: string): Promise<IExtendedAppointment | null> {
      const objectId = new ObjectId(appointmentId);

      const appointment = await this.model
         .aggregate([
            { $match: { _id: objectId } },
            {
               $lookup: {
                  from: "slots",
                  localField: "slotId",
                  foreignField: "_id",
                  as: "slot",
               },
            },
            { $unwind: { path: "$slot", preserveNullAndEmptyArrays: true } },
            {
               $lookup: {
                  from: "lawyers",
                  localField: "lawyerId",
                  foreignField: "_id",
                  as: "lawyer",
               },
            },
            { $unwind: { path: "$lawyer", preserveNullAndEmptyArrays: true } },
            {
               $lookup: {
                  from: "clients",
                  localField: "clientId",
                  foreignField: "_id",
                  as: "client",
               },
            },
            { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
            {
               $project: {
                  "client.password": 0,
                  "client.token": 0,
                  "lawyer.password": 0,
                  "lawyer.token": 0,
                  "client.createdAt": 0,
                  "client.updatedAt": 0,
                  "lawyer.createdAt": 0,
                  "lawyer.updatedAt": 0,
               },
            },
         ])
         .exec();

      if (!appointment || appointment.length === 0) {
         return null;
      }

      return appointment[0] as IExtendedAppointment;
   }

   async findManyByClientId(
      clientId: string,
      offset: number,
      limit: number,
      status?: AppointmentStatus
   ): Promise<PaginatedResult<IAppointment>> {
      const filter: { clientId: string; status?: any } = { clientId };
      if (status) {
         filter.status = { $nin: [AppointmentStatus.PAYMENT_PENDING], $eq: status };
      } else {
         filter.status = { $nin: [AppointmentStatus.PAYMENT_PENDING] };
      }
      const totalItems = await this.model.countDocuments(filter);
      const items = await this.model
         .find(filter)
         .sort({ createdAt: -1 })
         .skip(limit * offset)
         .limit(limit)
         .exec();
      return getPaginatedResult(totalItems, offset, limit, items);
   }

   async findManyByLawyerId(
      lawyerId: string,
      offset: number,
      limit: number,
      status?: AppointmentStatus
   ): Promise<PaginatedResult<IAppointment>> {
      const filter: { lawyerId: string; status?: any } = { lawyerId };
      if (status) {
         filter.status = { $nin: [AppointmentStatus.PAYMENT_PENDING], $eq: status };
      } else {
         filter.status = { $nin: [AppointmentStatus.PAYMENT_PENDING] };
      }
      const totalItems = await this.model.countDocuments(filter);
      const items = await this.model
         .find(filter)
         .sort({ createdAt: -1 })
         .skip(limit * offset)
         .limit(limit)
         .lean(true)
         .exec();
      return getPaginatedResult(totalItems, offset, limit, items);
   }

   async findManyByDateAndLawyerId(appointmentDate: string, lawyerId: string): Promise<IAppointment[] | null> {
      const dateWithoutTime = appointmentDate.split("T")[0];
      return await this.model.find({
         lawyerId,
         appointmentDate: { $gte: dateWithoutTime },
      });
   }

   async findByDateAndSlot(appointmentDate: string, slotId: string): Promise<IAppointment | null> {
      return await this.model.findOne({ appointmentDate, slotId });
   }

   async updateManyBySlotIdsNotInStatuses(
      slotIds: string[],
      fields: IAppointment,
      notInStatuses: AppointmentStatus[]
   ): Promise<IAppointment[] | null> {
      return await this.model.find({
         slotId: { $in: slotIds },
         status: { $nin: notInStatuses },
      });
   }

   async updateAppointmentStatusToConfirmed(appointmentId: string): Promise<void> {
      await this.model.findByIdAndUpdate(appointmentId, {
         status: AppointmentStatus.CONFIRMED,
      });
   }

   async getCountByRange(startTime: Date, endTime: Date): Promise<number> {
      const count = await this.model.countDocuments({
         createdAt: {
            $gte: startTime,
            $lte: endTime,
         },
      });
      return count;
   }

   async getCountsByStatus(status: AppointmentStatus): Promise<number> {
      const result = await this.model.aggregate([
         {
            $match: {
               status: status,
            },
         },
         {
            $group: {
               _id: null,
               count: { $sum: 1 },
            },
         },
      ]);

      return result.length > 0 ? result[0].count : 0;
   }

   async findManyAsExtendedByClientId(
      clientId: string,
      limit: number,
      offset: number
   ): Promise<PaginatedResult<IExtendedAppointment>> {
      const result = await this.model
         .aggregate([
            { $match: { clientId: new ObjectId(clientId) } },
            {
               $lookup: {
                  from: "slots",
                  localField: "slotId",
                  foreignField: "_id",
                  as: "slot",
               },
            },
            { $unwind: { path: "$slot", preserveNullAndEmptyArrays: true } },
            {
               $lookup: {
                  from: "lawyers",
                  localField: "lawyerId",
                  foreignField: "_id",
                  as: "lawyer",
               },
            },
            { $unwind: { path: "$lawyer", preserveNullAndEmptyArrays: true } },
            {
               $lookup: {
                  from: "clients",
                  localField: "clientId",
                  foreignField: "_id",
                  as: "client",
               },
            },
            { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
            {
               $project: {
                  "client.password": 0,
                  "client.token": 0,
                  "client.createAt": 0,
                  "client.updatedAt": 0,
                  "lawyer.createAt": 0,
                  "lawyer.updatedAt": 0,
                  "lawyer.password": 0,
                  "lawyer.token": 0,
               },
            },
            {
               $facet: {
                  paginatedResults: [{ $skip: limit * offset }, { $limit: limit }],
                  totalCount: [{ $count: "count" }],
               },
            },
         ])
         .exec();

      const appointments = result[0].paginatedResults;
      const totalItems = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

      return getPaginatedResult(totalItems, offset, limit, appointments);
   }
}
