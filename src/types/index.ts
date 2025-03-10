import { Request } from "express";

export interface CustomRequest extends Request {
   client?: {
      email: string;
      id: string;
   };
   admin?: {
      email: string;
      id: string;
   };
   lawyer?: {
      email: string;
      id: string;
   };
   user?: {
      email: string;
      id: string;
   };
}

export enum StatusCode {
   OK = 200,
   Created = 201,
   Accepted = 202,
   NoContent = 204,
   BadRequest = 400,
   Unauthorized = 401,
   PaymentError = 402,
   Forbidden = 403,
   NotFound = 404,
   Conflict = 409,
   UnprocessableEntity = 422,
   InternalServerError = 500,
   NotImplemented = 501,
   BadGateway = 502,
   ServiceUnavailable = 503,
}

export enum Cookie {
   Admin = "adminToken",
   Client = "clientToken",
   Lawyer = "lawyerToken",
   AdminToken = "adminToken",
   ClientToken = "clientToken",
   LawyerToken = "lawyerToken",
   AccessToken = "accessToken",
   RefreshToken = "refreshToken",
}

export interface PaginatedResult<T> {
   items: T[];
   totalItems: number;
   currentPage: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
}

// Filters

export enum LawyersFilter {
   BLOCKED = "blocked",
   NOT_VERIFIED = "not-verified",
   VERIFIED = "verified",
}

export type TokenPayload = {
   id: string;
   role: UserRole;
   email: string;
};

export enum UserRole {
   Admin = "admin",
   Lawyer = "lawyer",
   Client = "client",
}

export class CustomError extends Error {
   constructor(
      message: string,
      public statusCode: StatusCode
   ) {
      super(message);
      this.name = "CustomError";
   }
}
