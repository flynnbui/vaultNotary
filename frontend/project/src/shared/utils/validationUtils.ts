import { z } from 'zod';

export class ValidationUtils {
  /**
   * Vietnamese phone number validation
   */
  static readonly phoneRegex = /^[0-9]{10}$/;
  
  /**
   * Vietnamese ID card validation (CMND/CCCD)
   */
  static readonly cmndRegex = /^[0-9]{9}$|^[0-9]{12}$/;
  
  /**
   * Passport validation
   */
  static readonly passportRegex = /^[A-Z0-9]{8,9}$/;
  
  /**
   * Business registration number validation
   */
  static readonly businessRegex = /^[0-9]{10,13}$/;

  /**
   * Create phone number schema
   */
  static createPhoneSchema(required: boolean = false) {
    const baseSchema = z.string().regex(
      this.phoneRegex, 
      'Số điện thoại phải có 10 chữ số'
    );
    
    return required 
      ? baseSchema.min(1, 'Số điện thoại là bắt buộc')
      : baseSchema.optional().or(z.literal(''));
  }

  /**
   * Create email schema
   */
  static createEmailSchema(required: boolean = false) {
    const baseSchema = z.string().email('Email không hợp lệ');
    
    return required 
      ? baseSchema.min(1, 'Email là bắt buộc')
      : baseSchema.optional().or(z.literal(''));
  }

  /**
   * Create ID/Passport validation schema
   */
  static createIdValidationSchema() {
    return z.object({
      cmndNumber: z.string().trim().optional(),
      passportNumber: z.string().trim().optional(),
    }).refine(data => {
      if (data.cmndNumber && data.cmndNumber.length > 0) {
        return this.cmndRegex.test(data.cmndNumber);
      }
      if (data.passportNumber && data.passportNumber.length > 0) {
        return this.passportRegex.test(data.passportNumber);
      }
      return data.cmndNumber || data.passportNumber;
    }, {
      message: 'Phải nhập CMND/CCCD hoặc Passport hợp lệ',
    });
  }

  /**
   * Create business registration schema
   */
  static createBusinessRegistrationSchema() {
    return z.string().regex(
      this.businessRegex,
      'Số đăng ký kinh doanh phải có từ 10-13 chữ số'
    );
  }

  /**
   * Create date schema with validation
   */
  static createDateSchema(required: boolean = true, message?: string) {
    const baseSchema = z.date();
    
    if (required) {
      return baseSchema.refine(
        (date) => date <= new Date(),
        { message: message || 'Ngày không thể là tương lai' }
      );
    }
    
    return baseSchema.optional();
  }

  /**
   * Create required string schema
   */
  static createRequiredStringSchema(message: string) {
    return z.string().min(1, message);
  }

  /**
   * Create optional string schema
   */
  static createOptionalStringSchema() {
    return z.string().optional();
  }

  /**
   * Create transaction code schema
   */
  static createTransactionCodeSchema() {
    return z.string().min(3, 'Mã giao dịch phải có ít nhất 3 ký tự');
  }

  /**
   * Create name validation schema
   */
  static createNameSchema(fieldName: string = 'Tên') {
    return z.string()
      .min(2, `${fieldName} phải có ít nhất 2 ký tự`)
      .max(100, `${fieldName} không được vượt quá 100 ký tự`)
      .regex(/^[a-zA-ZÀ-ỹ\s]+$/, `${fieldName} chỉ được chứa chữ cái và khoảng trắng`);
  }

  /**
   * Create address validation schema
   */
  static createAddressSchema(fieldName: string = 'Địa chỉ') {
    return z.string()
      .min(5, `${fieldName} phải có ít nhất 5 ký tự`)
      .max(255, `${fieldName} không được vượt quá 255 ký tự`);
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Validate file type
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Create file validation schema
   */
  static createFileValidationSchema(
    maxSizeInMB: number = 10,
    allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/png']
  ) {
    return z.instanceof(File)
      .refine(
        (file) => this.validateFileSize(file, maxSizeInMB),
        `File không được vượt quá ${maxSizeInMB}MB`
      )
      .refine(
        (file) => this.validateFileType(file, allowedTypes),
        'Định dạng file không được hỗ trợ'
      );
  }

  /**
   * Create array validation schema
   */
  static createArraySchema<T>(
    itemSchema: z.ZodSchema<T>,
    minItems: number = 0,
    maxItems?: number,
    message?: string
  ) {
    let schema = z.array(itemSchema);
    
    if (minItems > 0) {
      schema = schema.min(minItems, message || `Phải có ít nhất ${minItems} phần tử`);
    }
    
    if (maxItems) {
      schema = schema.max(maxItems, `Không được vượt quá ${maxItems} phần tử`);
    }
    
    return schema;
  }

  /**
   * Create conditional validation schema
   */
  static createConditionalSchema<T>(
    condition: (data: T) => boolean,
    thenSchema: z.ZodSchema,
    elseSchema: z.ZodSchema
  ) {
    return z.any().refine(
      (data: T) => {
        if (condition(data)) {
          return thenSchema.safeParse(data).success;
        }
        return elseSchema.safeParse(data).success;
      }
    );
  }

  /**
   * Validate Vietnamese citizen ID
   */
  static isValidVietnameseCitizenId(id: string): boolean {
    return this.cmndRegex.test(id);
  }

  /**
   * Validate Vietnamese phone number
   */
  static isValidVietnamesePhone(phone: string): boolean {
    return this.phoneRegex.test(phone);
  }

  /**
   * Validate passport number
   */
  static isValidPassport(passport: string): boolean {
    return this.passportRegex.test(passport);
  }

  /**
   * Validate business registration number
   */
  static isValidBusinessRegistration(number: string): boolean {
    return this.businessRegex.test(number);
  }

  /**
   * Get error message from Zod error
   */
  static getErrorMessage(error: z.ZodError): string {
    return error.errors.map(e => e.message).join(', ');
  }

  /**
   * Get field errors from Zod error
   */
  static getFieldErrors(error: z.ZodError): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    
    error.errors.forEach(err => {
      const field = err.path.join('.');
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(err.message);
    });
    
    return fieldErrors;
  }
}