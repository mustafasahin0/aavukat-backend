import NodeMailerService from "./NodeMailerService";
import path from "path";
import IEmailService, { SendMailProps, OtpMailProps } from "@/domain/interface/services/IEmailService";

export default class EmailService implements IEmailService {
   private nodeMailerService: NodeMailerService;
   private readonly templateDir: string;

   constructor() {
      this.nodeMailerService = new NodeMailerService();
      this.templateDir = path.join(__dirname, "../../../public");
      console.log("Email template directory:", this.templateDir);
   }

   async sendMail({ email, name, pathOfTemplate, link, otp, subject, year }: SendMailProps): Promise<void> {
      const fullPath = pathOfTemplate
         ? path.join(this.templateDir, pathOfTemplate)
         : path.join(this.templateDir, "otpEmailTemplate.html");

      console.log("Full template path:", fullPath);
      console.log("Template exists:", require("fs").existsSync(fullPath));

      await this.nodeMailerService.sendMail({
         email,
         name,
         subject,
         pathOfTemplate: fullPath,
         link,
         otp,
         year,
      });
   }

   async sendOtp(otp: OtpMailProps): Promise<void> {
      // Select the appropriate template based on OTP type
      let templatePath = "otpEmailTemplate.html"; // Default template for registration
      
      // Use different templates based on OTP type
      if (otp.type === "login") {
         templatePath = "login-verification.html";
      } else if (otp.type === "reset") {
         templatePath = "resetPasswordTemplate.html";
      } else if (otp.type === "register") {
         templatePath = "otpEmailTemplate.html"; // Use registration-specific template
      }
      
      // Get the current year for templates that use it
      const currentYear = new Date().getFullYear();
      
      await this.sendMail({
         email: otp.email,
         name: otp.name,
         subject: `No Reply Mail: ${otp.type === "reset" ? "Password Reset" : 
                            otp.type === "register" ? "Email Verification" : "OTP Verification"}`,
         pathOfTemplate: templatePath,
         otp: parseInt(otp.code),
         year: currentYear,
      });
   }
}
