import { toast } from 'sonner';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ErrorHandler {
  /**
   * Handle API errors with appropriate user messages
   */
  static handleApiError(error: unknown, context?: string): void {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    if (error instanceof ApiError) {
      this.handleTypedApiError(error, context);
    } else if (error instanceof Error) {
      this.handleGenericError(error, context);
    } else {
      this.handleUnknownError(error, context);
    }
  }

  /**
   * Handle typed API errors
   */
  private static handleTypedApiError(error: ApiError, context?: string): void {
    switch (error.status) {
      case 400:
        toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        break;
      case 401:
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        break;
      case 403:
        toast.error("Bạn không có quyền thực hiện thao tác này.");
        break;
      case 404:
        toast.error("Không tìm thấy dữ liệu yêu cầu.");
        break;
      case 409:
        toast.error("Dữ liệu đã tồn tại hoặc xung đột.");
        break;
      case 422:
        toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        break;
      case 500:
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
        break;
      case 503:
        toast.error("Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.");
        break;
      default:
        toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  /**
   * Handle generic JavaScript errors
   */
  private static handleGenericError(error: Error, context?: string): void {
    if (error.message.includes('Network')) {
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
    } else if (error.message.includes('timeout')) {
      toast.error("Thời gian chờ quá lâu. Vui lòng thử lại.");
    } else {
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  }

  /**
   * Handle unknown errors
   */
  private static handleUnknownError(error: unknown, context?: string): void {
    toast.error("Có lỗi không xác định xảy ra. Vui lòng thử lại.");
  }

  /**
   * Handle document-specific errors
   */
  static handleDocumentError(error: unknown, operation: string): void {
    const context = `document ${operation}`;
    
    if (error instanceof ApiError) {
      switch (error.status) {
        case 404:
          toast.error("Không tìm thấy hồ sơ.");
          break;
        case 409:
          toast.error("Hồ sơ đã tồn tại hoặc có xung đột dữ liệu.");
          break;
        default:
          this.handleApiError(error, context);
      }
    } else {
      this.handleApiError(error, context);
    }
  }

  /**
   * Handle file operation errors
   */
  static handleFileError(error: unknown, operation: string, fileName?: string): void {
    const context = `file ${operation}${fileName ? ` for ${fileName}` : ''}`;
    
    if (error instanceof ApiError) {
      switch (error.status) {
        case 413:
          toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn.");
          break;
        case 415:
          toast.error("Định dạng file không được hỗ trợ.");
          break;
        default:
          this.handleApiError(error, context);
      }
    } else {
      this.handleApiError(error, context);
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        toast.error(`${field}: ${message}`);
      });
    });
  }

  /**
   * Create a typed API error
   */
  static createApiError(status: number, message: string, details?: Record<string, any>): ApiError {
    return new ApiError(status, message, details);
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('Network') || 
            error.message.includes('fetch') || 
            error.message.includes('ERR_NETWORK'));
  }

  /**
   * Check if error is a timeout error
   */
  static isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('timeout');
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown): string {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 400:
          return "Dữ liệu không hợp lệ";
        case 401:
          return "Phiên đăng nhập đã hết hạn";
        case 403:
          return "Không có quyền truy cập";
        case 404:
          return "Không tìm thấy dữ liệu";
        case 500:
          return "Lỗi máy chủ";
        default:
          return error.message || "Có lỗi xảy ra";
      }
    } else if (error instanceof Error) {
      if (this.isNetworkError(error)) {
        return "Lỗi kết nối mạng";
      } else if (this.isTimeoutError(error)) {
        return "Thời gian chờ quá lâu";
      } else {
        return error.message;
      }
    }
    
    return "Có lỗi không xác định xảy ra";
  }
}