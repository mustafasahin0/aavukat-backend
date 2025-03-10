import {
   Months,
   ClientGenderStatistics,
   UserStatistics,
   AppointmentsByStatusStatistics,
   SlotStatistics,
   AppointmentsPerMonthStatistics,
} from "@/types/statistics";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import { AppointmentStatus } from "@/domain/entities/IAppointment";
import { endOfMonth, startOfMonth } from "@/utils/date-formatter";

export default class DashboardUseCase {
   constructor(
      private clientRepository: IClientRepository,
      private appointmentRepository: IAppointmentRepository,
      private lawyerRepository: ILawyerRepository,
      private slotRepository: ISlotRepository
   ) {}

   async getClientGenderStatistics(): Promise<ClientGenderStatistics> {
      const genderStats = await this.clientRepository.findClientGenders();

      const result: ClientGenderStatistics = {
         male: 0,
         female: 0,
      };

      genderStats.forEach((stat) => {
         if (stat.gender === "male") {
            result.male = stat.count;
         } else if (stat.gender === "female") {
            result.female = stat.count;
         }
      });

      return result;
   }

   async getUsersStatistics(): Promise<UserStatistics[]> {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2;
      const endYear = currentYear + 5;
      const statisticsMap: Map<string, UserStatistics> = new Map();

      for (let year = startYear; year <= endYear; year++) {
         for (const month of Object.values(Months)) {
            const startTime = startOfMonth(new Date(year, Object.keys(Months).indexOf(month), 1));
            const endTime = endOfMonth(startTime);

            const clients = await this.clientRepository.getCountInTimeRange(startTime, endTime);
            const lawyers = await this.lawyerRepository.getCountInTimeRange(startTime, endTime);

            if (!statisticsMap.has(month)) {
               statisticsMap.set(month, { month, lawyers: 0, clients: 0 });
            }

            const currentStats = statisticsMap.get(month)!;
            currentStats.lawyers += lawyers;
            currentStats.clients += clients;
         }
      }

      return Array.from(statisticsMap.values());
   }

   async getAppointmentsPerMonthStatistics(): Promise<AppointmentsPerMonthStatistics[]> {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2;
      const endYear = currentYear + 5;
      const statisticsMap: Map<string, AppointmentsPerMonthStatistics> = new Map();

      for (let year = startYear; year <= endYear; year++) {
         for (const month of Object.values(Months)) {
            const startTime = startOfMonth(new Date(year, Object.keys(Months).indexOf(month), 1));
            const endTime = endOfMonth(startTime);

            const count = await this.appointmentRepository.getCountByRange(startTime, endTime);

            if (!statisticsMap.has(month)) {
               statisticsMap.set(month, { month, count: 0 });
            }

            const currentStats = statisticsMap.get(month)!;
            currentStats.count += count;
         }
      }

      return Array.from(statisticsMap.values());
   }

   async getSlotsStatistics(): Promise<SlotStatistics[]> {
      return await this.slotRepository.getSlotUsageCount();
   }

   async getAppointmentsStatisticsByStatus(): Promise<AppointmentsByStatusStatistics[]> {
      const statistics: AppointmentsByStatusStatistics[] = [];
      for (let status of Object.values(AppointmentStatus)) {
         const count = await this.appointmentRepository.getCountsByStatus(status);
         statistics.push({
            status,
            count,
         });
      }
      return statistics;
   }
}
