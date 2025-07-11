export class DateUtils {
  /**
   * Format date and time for Vietnamese locale
   */
  static formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Format date only for Vietnamese locale
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  /**
   * Format date for form inputs
   */
  static formatDateForForm(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Parse date string to Date object
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Check if date is valid
   */
  static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Get current date in ISO format
   */
  static getCurrentISODate(): string {
    return new Date().toISOString();
  }

  /**
   * Format date for display in Vietnamese
   */
  static formatDateVietnamese(date: Date): string {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}