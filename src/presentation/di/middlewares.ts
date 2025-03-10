import ClientAuthMiddleware from "../middlewares/ClientAuthMiddleware";
import LawyerAuthMiddleware from "../middlewares/LawyerAuthMiddleware";
import AdminAuthMiddleware from "../middlewares/AdminAuthMiddleware";
import ErrorHandler from "../middlewares/ErrorHandler";
import { jwtService } from "./services";

export const authorizeClient = new ClientAuthMiddleware(jwtService);
export const authorizeLawyer = new LawyerAuthMiddleware(jwtService);
export const authorizeAdmin = new AdminAuthMiddleware(jwtService);
export const errorHandler = new ErrorHandler();
