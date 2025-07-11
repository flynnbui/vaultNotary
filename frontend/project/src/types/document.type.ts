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
  description: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  parties: Party[]; 
}
