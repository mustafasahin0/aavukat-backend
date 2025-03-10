import Joi from "joi";
import { StatusCode } from "@/types";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import CustomError from "@/domain/entities/CustomError";

export default class JoiService implements IValidatorService {
   private readonly patterns = {
      id: /^[a-fA-F0-9]{24}$/,
      time: /^([01]\d|2[0-3]):([0-5]\d) (AM|PM)$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      otp: /^\d+$/,
   };

   // Schema cache for better performance
   private readonly schemaCache: Map<string, Joi.Schema> = new Map();

   private getOrCreateSchema(key: string, creator: () => Joi.Schema): Joi.Schema {
      if (!this.schemaCache.has(key)) {
         this.schemaCache.set(key, creator());
      }
      return this.schemaCache.get(key)!;
   }

   private createPatternSchema(pattern: RegExp, options: { length?: number } = {}): Joi.StringSchema {
      const key = `pattern:${pattern.source}:${options.length || ""}`;
      return this.getOrCreateSchema(key, () => {
         let schema = Joi.string().pattern(pattern);
         if (options.length) {
            schema = schema.length(options.length);
         }
         return schema;
      }) as Joi.StringSchema;
   }

   private validateSchema<T>(schema: Joi.Schema, value: T, errorMessage: string): boolean {
      const { error } = schema.validate(value, { abortEarly: false });
      if (error) {
         throw new CustomError(errorMessage, StatusCode.BadRequest, undefined, error);
      }
      return true;
   }

   public validateRequiredFields(input: Record<string, unknown>): void {
      const schema = this.getOrCreateSchema(`required:${Object.keys(input).sort().join(",")}`, () =>
         Joi.object().keys(
            Object.keys(input).reduce(
               (acc, key) => {
                  acc[key] = Joi.required();
                  return acc;
               },
               {} as Record<string, Joi.AnySchema>
            )
         )
      );

      this.validateSchema(schema, input, "Missing required fields");
   }

   public validateEmailFormat(email: string): boolean {
      const schema = this.getOrCreateSchema("email", () => Joi.string().email());
      return this.validateSchema(schema, email, "Invalid email format");
   }

   public validateLength(field: string, minLength: number, maxLength: number = Infinity): boolean {
      const key = `length:${minLength}:${maxLength}`;
      const schema = this.getOrCreateSchema(key, () => Joi.string().min(minLength).max(maxLength));
      return this.validateSchema(
         schema,
         field,
         `Invalid length for field, expected between ${minLength} and ${maxLength} characters`
      );
   }

   public validateIdFormat(id: string): boolean {
      return this.validateSchema(this.createPatternSchema(this.patterns.id), id, "Invalid ID format");
   }

   public validateMultipleIds(ids: string[]): boolean {
      const idSchema = this.createPatternSchema(this.patterns.id);
      const schema = this.getOrCreateSchema("multipleIds", () => Joi.array().items(idSchema));
      return this.validateSchema(schema, ids, "Invalid ID format");
   }

   public validatePhoneNumber(phoneNumber: string): boolean {
      const schema = this.getOrCreateSchema("phone", () => Joi.string().min(4).max(15));
      return this.validateSchema(schema, phoneNumber, "Invalid phone number format");
   }

   public validateDateFormat(date: string): boolean {
      const schema = this.getOrCreateSchema("date", () => Joi.date().iso());
      return this.validateSchema(schema, date, "Invalid date format");
   }

   public validateTimeFormat(time: string): boolean {
      return this.validateSchema(
         this.createPatternSchema(this.patterns.time),
         time,
         'Invalid time format, must be in "HH:MM AM/PM" format'
      );
   }

   public validateEnum<T extends string>(field: T, enumValues: readonly T[]): boolean {
      const key = `enum:${[...enumValues].sort().join(",")}`;
      const schema = this.getOrCreateSchema(key, () => Joi.string().valid(...enumValues));
      return this.validateSchema(schema, field, `Invalid value for field, expected one of: ${enumValues.join(", ")}`);
   }

   public validatePassword(password: string): boolean {
      return this.validateSchema(
         this.createPatternSchema(this.patterns.password),
         password,
         "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
      );
   }

   public validateBoolean(value: unknown): boolean {
      const schema = this.getOrCreateSchema("boolean", () => Joi.boolean());
      return this.validateSchema(schema, value, "Invalid boolean value");
   }

   public validateOtpCode(code: string): boolean {
      return this.validateSchema(
         this.createPatternSchema(this.patterns.otp, { length: 6 }),
         code,
         "Invalid OTP format. Must be 6 digits."
      );
   }

   // Clear schema cache if needed (e.g., in tests)
   public clearSchemaCache(): void {
      this.schemaCache.clear();
   }
}
