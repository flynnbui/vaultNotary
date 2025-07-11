/**
 * API Types matching backend DTOs
 * These interfaces should match the C# DTOs exactly
 */

// Customer DTOs
export interface CustomerDto {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number; // 0 = Individual, 1 = Business
  documentId: string;
  passportId: string;
  businessRegistrationNumber: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  type: number;
  documentId: string;
  passportId: string;
  businessRegistrationNumber?: string;
  businessName?: string;
}

export interface UpdateCustomerDto extends CreateCustomerDto {
  id: string;
}

// Document DTOs
export interface DocumentDto {
  id: string;
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  partyDocumentLinks: PartyDocumentLinkDto[];
}

export interface DocumentListDto {
  id: string;
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
}

export interface UpdateDocumentDto extends CreateDocumentDto {
  id: string;
}

export interface DocumentWithFilesDto extends DocumentDto {
  files: DocumentFileDto[];
}

// Document File DTOs
export interface DocumentFileDto {
  id: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  s3Bucket: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentFileDto {
  documentId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  s3Bucket: string;
}

export interface UpdateDocumentFileDto extends CreateDocumentFileDto {
  id: string;
}

// Party Document Link DTOs
export interface PartyDocumentLinkDto {
  id: string;
  documentId: string;
  customerId: string;
  partyRole: number; // 0 = PartyA, 1 = PartyB, 2 = PartyC
  signatureStatus: number; // 0 = Pending, 1 = Signed, 2 = Rejected
  notaryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartyDocumentLinkDto {
  documentId: string;
  customerId: string;
  partyRole: number;
  signatureStatus: number;
  notaryDate: string;
}

export interface UpdatePartyDocumentLinkDto extends CreatePartyDocumentLinkDto {
  id: string;
}

// Search DTOs
export interface SearchRequestDto {
  pageNumber: number;
  pageSize: number;
}

export interface DateRangeSearchRequestDto extends SearchRequestDto {
  from: string;
  to: string;
}

export interface PagedResultDto<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// File Upload DTOs
export interface FileUploadDto {
  file: File;
  documentId: string;
}

export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  s3Bucket: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileDownloadResponse {
  url: string;
  expiresAt: string;
}

export interface PresignedUrlDto {
  url: string;
  expiresAt: string;
}

// Enums
export enum CustomerType {
  Individual = 0,
  Business = 1
}

export enum PartyRole {
  PartyA = 0,
  PartyB = 1,
  PartyC = 2
}

export enum SignatureStatus {
  Pending = 0,
  Signed = 1,
  Rejected = 2
}