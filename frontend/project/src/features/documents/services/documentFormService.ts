import {
  PartyRole,
  FileFormData,
  PartyDocumentLink,
  CustomerSummary,
  FormParties,
} from "../types/document.types";
import {
  CreateDocumentDto,
  CreateDocumentPartyDto,
} from "@/src/types/api.types";
import { DateUtils } from "@/src/shared/utils/dateUtils";

export class DocumentFormService {
  /**
   * Prepare document data for API submission
   */
  static prepareDocumentData(formData: FileFormData): CreateDocumentDto {
    const parties = this.processParties(formData.parties);

    return {
      createdDate: formData.ngayTao.toISOString(),
      secretary: formData.thuKy,
      notaryPublic: formData.congChungVien,
      transactionCode: formData.maGiaoDich || "",
      description: formData.description || null,
      documentType: formData.loaiHoSo,
      parties: parties,
    };
  }

  /**
   * Process parties data from form to API format
   */
  private static processParties(
    parties: FormParties
  ): CreateDocumentPartyDto[] {
    const result: CreateDocumentPartyDto[] = [];

    // Process Party A (partyRole = 0)
    parties.A.forEach((customer) => {
      if (customer.id) {
        result.push({
          customerId: customer.id,
          partyRole: PartyRole.PARTY_A,
        });
      }
    });

    // Process Party B (partyRole = 1)
    parties.B.forEach((customer) => {
      if (customer.id) {
        result.push({
          customerId: customer.id,
          partyRole: PartyRole.PARTY_B,
        });
      }
    });

    // Process Party C (partyRole = 2)
    parties.C.forEach((customer) => {
      if (customer.id) {
        result.push({
          customerId: customer.id,
          partyRole: PartyRole.PARTY_C,
        });
      }
    });

    return result;
  }

  /**
   * Validate form data before submission
   */
  static validateFormData(formData: FileFormData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required field validation
    if (!formData.thuKy.trim()) {
      errors.push("Thư ký là bắt buộc");
    }

    if (!formData.congChungVien.trim()) {
      errors.push("Công chứng viên là bắt buộc");
    }

    if (!formData.loaiHoSo.trim()) {
      errors.push("Loại hồ sơ là bắt buộc");
    }

    // Party validation is now handled by schema validation in the form
    // This validation is kept as a fallback

    // Date validation
    if (!DateUtils.isValidDate(formData.ngayTao)) {
      errors.push("Ngày tạo không hợp lệ");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default form values
   */
  static getDefaultFormValues(): FileFormData {
    return {
      ngayTao: new Date(),
      thuKy: "",
      congChungVien: "",
      maGiaoDich: "",
      description: "",
      loaiHoSo: "",
      parties: {
        A: [],
        B: [],
        C: [],
      },
    };
  }

  /**
   * Reset form data for edit mode
   */
  static prepareFormDataForEdit(document: any): FileFormData {
    const partiesData = this.extractPartiesFromDocument(document);

    return {
      ngayTao: new Date(document.createdDate),
      thuKy: document.secretary,
      congChungVien: document.notaryPublic,
      maGiaoDich: document.transactionCode,
      description: document?.description ?? "",
      loaiHoSo: document.documentType,
      parties: partiesData,
    };
  }

  /**
   * Extract parties data from document for form
   */
  private static extractPartiesFromDocument(document: any): FormParties {
    const partiesData: FormParties = {
      A: [],
      B: [],
      C: [],
    };

    if (document.partyDocumentLinks && document.partyDocumentLinks.length > 0) {
      document.partyDocumentLinks.forEach((partyLink: any) => {
        if (partyLink.customer) {
          const customerData = partyLink.customer;
          const customerSummary: CustomerSummary = {
            id: customerData.id,
            fullName: customerData.fullName,
            address: customerData.address,
            phone: customerData.phone,
            email: customerData.email,
            type: customerData.type,
            documentId: customerData.documentId,
            passportId: customerData.passportId,
            businessRegistrationNumber: customerData.businessRegistrationNumber,
            businessName: customerData.businessName,
            createdAt: customerData.createdAt,
            updatedAt: customerData.updatedAt,
          };

          switch (partyLink.partyRole) {
            case PartyRole.PARTY_A:
              partiesData.A.push(customerSummary);
              break;
            case PartyRole.PARTY_B:
              partiesData.B.push(customerSummary);
              break;
            case PartyRole.PARTY_C:
              partiesData.C.push(customerSummary);
              break;
            default:
              console.warn(`Unknown partyRole: ${partyLink.partyRole}`);
          }
        }
      });
    }

    return partiesData;
  }
}
