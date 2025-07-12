export interface Party {
  documentId: string;
  customerId: string;
  partyRole: string;
  signatureStatus: number;
  notaryDate: string;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface DocumentWithPopulatedParties extends Omit<DocumentType, 'partyDocumentLinks'> {
  partyDocumentLinks: PopulatedPartyDocumentLinkType[];
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
  parties: Party[]; 
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
  documentId: string;
  customerId: string;
  partyRole: number;
  signatureStatus: number;
  notaryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedPartyDocumentLinkType extends PartyDocumentLinkType {
  customer: import('./customer.type').CustomerType;
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
