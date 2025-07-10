export interface DocumentType {
  id: string;
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  partyDocumentLinks: PartyDocumentLinkType[];
  files: DocumentFileType[];
}

export interface DocumentListType {
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

export interface DocumentFileType {
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

export interface PartyDocumentLinkType {
  id: string;
  customerId: string;
  documentId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentType {
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
  parties: PartyDocumentLinkType[];
}

export interface UpdateDocumentType {
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string | null;
  documentType: string;
}

export interface SearchRequestType {
  pageNumber: number;
  pageSize: number;
}

export interface DateRangeSearchRequestType extends SearchRequestType {
  from: string;
  to: string;
}
