import { z } from 'zod';

// Party role enum for type safety
export enum PartyRole {
  PARTY_A = 0,
  PARTY_B = 1,
  PARTY_C = 2
}

// Dialog modes for document operations
export type DialogMode = "create" | "edit" | "view" | "upload";

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// Document file interfaces
export interface DocumentFileFromApi {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url?: string;
}

// Party document link interfaces
export interface PartyDocumentLink {
  id: string;
  documentId: string;
  customerId: string;
  partyRole: PartyRole;
  signatureStatus: number;
  notaryDate: string;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerData;
}

export interface CustomerData {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number;
  documentId: string;
  passportId: string;
  businessRegistrationNumber: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

// Document creation/update data
export interface CreateDocumentData {
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string;
  documentType: string;
  parties: PartyDocumentLink[];
}

export interface UpdateDocumentData extends CreateDocumentData {
  id: string;
}

// Form data interfaces
export interface CustomerSummary {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number;
  documentId: string;
  passportId: string;
  businessRegistrationNumber: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormParties {
  A: CustomerSummary[];
  B: CustomerSummary[];
  C: CustomerSummary[];
}

export interface FileFormData {
  ngayTao: Date;
  thuKy: string;
  congChungVien: string;
  maGiaoDich: string;
  description: string;
  loaiHoSo: string;
  parties: FormParties;
}

// Document state interfaces
export interface DocumentState {
  documents: DocumentType[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  totalItems: number;
  selectedDocument: DocumentType | null;
  dialogState: {
    isOpen: boolean;
    mode: DialogMode;
    editingDocument?: DocumentType;
  };
}

// Document with files interface - matches backend DocumentWithFilesDto
export interface DocumentWithFiles extends DocumentType {
  files: DocumentFileFromApi[];
  partyDocumentLinks: PartyDocumentLink[];
}

// Re-export existing types from the main document type file
export type { DocumentType, DocumentWithPopulatedParties } from '@/src/types/document.type';