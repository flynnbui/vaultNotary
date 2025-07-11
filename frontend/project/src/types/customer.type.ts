export interface CustomerType {
  id: string;
  fullName: string;
  address: string;
  phone: string | null;
  email: string | null;
  type: number;
  documentId: string | null;
  passportId: string | null;
  businessRegistrationNumber: string | null;
  businessName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerType {
  fullName: string;
  address: string;
  phone: string | null;
  email: string | null;
  type: number;
  documentId: string | null;
  passportId: string | null;
  businessRegistrationNumber: string | null;
  businessName: string | null;
}

export interface UpdateCustomerType {
  fullName: string;
  address: string;
  phone: string | null;
  email: string | null;
  type: number;
  documentId: string | null;
  passportId: string | null;
  businessRegistrationNumber: string | null;
  businessName: string | null;
}

export interface CustomerFilterOptions {
  type?: number;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}
