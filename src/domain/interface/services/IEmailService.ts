export type SendMailProps = {
   email: string;
   name: string;
   subject: string;
   pathOfTemplate: string;
   otp?: number;
   link?: string;
   year?: number;
};

export type OtpMailProps = {
   code: string;
   expiry: Date;
   email: string;
   name: string;
   type: string;
};

export default interface IEmailService {
   sendMail({ email, name, pathOfTemplate, link, otp }: SendMailProps): Promise<void>;
   sendOtp(otp: OtpMailProps): Promise<void>;
}
