import { FILE_TYPES } from '@/src/lib/constants';

export class DocumentTypeUtils {
  /**
   * Get display label for a document type
   * Maps value to label for predefined types, returns raw value for custom types
   */
  static getDisplayLabel(documentType: string): string {
    const predefinedType = FILE_TYPES.find(type => type.value === documentType);
    return predefinedType?.label || documentType;
  }

  /**
   * Get color class for document type badge
   * Uses predefined colors for known types, default color for custom types
   */
  static getColorClass(documentType: string): string {
    const predefinedType = FILE_TYPES.find(type => type.value === documentType);
    const displayText = predefinedType?.label || documentType;
    
    const colors: Record<string, string> = {
      "Hợp đồng giao dịch": "bg-green-100 text-green-800",
      "Thừa kế": "bg-blue-100 text-blue-800", 
      "Mua bán xe": "bg-purple-100 text-purple-800",
      "Thuê nhà": "bg-yellow-100 text-yellow-800",
      "Thế chấp": "bg-orange-100 text-orange-800",
      "Góp vốn": "bg-indigo-100 text-indigo-800",
    };
    
    return colors[displayText] || "bg-slate-100 text-slate-800";
  }

  /**
   * Check if a document type is predefined in FILE_TYPES
   */
  static isPredefinedType(documentType: string): boolean {
    return FILE_TYPES.some(type => type.value === documentType);
  }

  /**
   * Get all available document type options (predefined + custom option)
   */
  static getFormOptions() {
    return [
      ...FILE_TYPES,
      { value: '__custom__', label: 'Khác (nhập tùy chỉnh)' }
    ];
  }
}