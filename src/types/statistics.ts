import { AppointmentStatus } from "@/domain/entities/IAppointment";

export enum Months {
   January = "January",
   February = "February",
   March = "March",
   April = "April",
   May = "May",
   June = "June",
   July = "July",
   August = "August",
   September = "September",
   October = "October",
   November = "November",
   December = "December",
}

export type ClientGenderStatistics = {
   male: number;
   female: number;
};

export type UserStatistics = {
   month: Months;
   lawyers: number;
   clients: number;
};

export type AppointmentsPerMonthStatistics = {
   month: Months;
   count: number;
};

export type AppointmentsByStatusStatistics = {
   status: AppointmentStatus;
   count: number;
};

export type SlotStatistics = {
   time: string;
   count: number;
};
