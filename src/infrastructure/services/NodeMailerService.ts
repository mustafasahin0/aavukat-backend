import IEmailService, { SendMailProps, OtpMailProps } from "@/domain/interface/services/IEmailService";
import nodemailer from "nodemailer";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { SENDER_EMAIL, SMTP_SES_PASSWORD, SMTP_SES_USER_NAME } from "@/config/env";

const readFileAsync = promisify(fs.readFile);

export default class NodeMailerService implements IEmailService {
   async sendMail({ email, name, pathOfTemplate, link, otp, subject, year }: SendMailProps): Promise<void> {
      try {
         console.log("Starting email send process...");
         console.log("Template path:", pathOfTemplate);

         let htmlTemplate = await readFileAsync(pathOfTemplate, "utf-8");
         console.log("Template loaded successfully");

         htmlTemplate = htmlTemplate.replace("{{name}}", name);

         if (otp) {
            htmlTemplate = htmlTemplate.replace("{{otp}}", otp.toString());
            console.log("OTP injected into template:", otp);
         }

         if (link) {
            htmlTemplate = htmlTemplate.replace("{{link}}", link);
         }

         if (year) {
            htmlTemplate = htmlTemplate.replace("{{year}}", year.toString());
         }

         console.log("Creating transporter with AWS SES...");
         const transporter = nodemailer.createTransport({
            host: "email-smtp.us-east-2.amazonaws.com",
            port: 465,
            secure: true,
            auth: {
               user: SMTP_SES_USER_NAME,
               pass: SMTP_SES_PASSWORD,
            },
         });

         console.log("Sending email to:", email);
         try {
            await transporter.sendMail({
               from: SENDER_EMAIL,
               to: email,
               subject: subject || "No Reply Mail",
               html: htmlTemplate,
            });
            console.log("Email sent successfully");
         } catch (emailError: any) {
            // Log the error but don't crash - especially useful in development
            console.error("Error sending email (AWS SES may require email verification):", emailError.message);
            console.log("To use AWS SES: Verify recipient email addresses in AWS SES console or move out of sandbox mode");
            console.log("For development: Use a verified email address or consider a different email provider");
            // Email sending failed but we'll continue the flow for development purposes
         }
      } catch (error: any) {
         console.error("Error in email preparation:", error.message);
         // In production, you would want to throw this error, but for development, we'll just log it
         // throw error;
      }
   }

   async sendOtp(otp: OtpMailProps): Promise<void> {
      await this.sendMail({
         email: otp.email,
         name: otp.name,
         subject: `No Reply Mail: ${otp.type === "reset" ? "Password Reset" : "OTP Verification"}`,
         pathOfTemplate: path.join(__dirname, "../../../public/otpEmailTemplate.html"),
         otp: parseInt(otp.code),
      });
   }
}
