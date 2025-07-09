export interface CustomerType {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number;
  documentId: string | null;
  passportId: string | null;
  businessRegistrationNumber: string | null;
  businessName: string | null;
  createdAt: string;
  updatedAt: string;
}
