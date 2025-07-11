import { z } from 'zod';
export type PartyKey = 'A' | 'B' | 'C';

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

const passportOrId = z.object({
  cmndNumber: z.string().trim().optional(),
  passportNumber: z.string().trim().optional(),
}).refine(data => {
  if (data.cmndNumber && data.cmndNumber.length > 0) {
    return /^[0-9]{9}$|^[0-9]{12}$/.test(data.cmndNumber);
  }
  if (data.passportNumber && data.passportNumber.length > 0) {
    return /^[A-Z0-9]{8,9}$/.test(data.passportNumber);
  }
  return data.cmndNumber || data.passportNumber;
}, {
  message: 'Phải nhập CMND/CCCD hoặc Passport hợp lệ',
});

export const customerSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['individual', 'organization']),
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  organizationName: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số').optional().or(z.literal('')),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
}).and(passportOrId).refine(data => {
  if (data.type === 'organization') {
    return data.organizationName && data.organizationName.length > 0;
  }
  return true;
}, {
  message: 'Tên tổ chức là bắt buộc',
  path: ['organizationName']
}).refine(data => {
  if (data.type === 'organization') {
    return data.businessRegistrationNumber && data.businessRegistrationNumber.length > 0;
  }
  return true;
}, {
  message: 'Số đăng ký kinh doanh là bắt buộc',
  path: ['businessRegistrationNumber']
});

export const extendedCustomerSchema = z.object({
  customerType: z.enum(['individual', 'organization']),
  cmndNumber: z.string().optional(),
  cmndIssueDate: z.date().optional(),
  cmndIssuePlace: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssueDate: z.date().optional(),
  passportIssuePlace: z.string().optional(),
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  permanentAddress: z.string().min(1, 'Địa chỉ thường trú là bắt buộc'),
  currentAddress: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số').optional().or(z.literal('')),
  dateOfBirth: z.date({ required_error: 'Ngày sinh là bắt buộc' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Giới tính là bắt buộc' }),
  businessName: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
}).and(passportOrId).refine(data => {
  if (data.customerType === 'organization') {
    return data.businessName && data.businessName.length > 0;
  }
  return true;
}, {
  message: 'Tên doanh nghiệp là bắt buộc',
  path: ['businessName']
}).refine(data => {
  if (data.customerType === 'organization') {
    return data.businessRegistrationNumber && data.businessRegistrationNumber.length > 0;
  }
  return true;
}, {
  message: 'Số đăng ký kinh doanh là bắt buộc',
  path: ['businessRegistrationNumber']
});

export const partiesSchema = z.object({
  // A: z.array(z.object({
  //   id: z.string(),
  //   fullName: z.string(),
  //   idType: z.enum(['CMND', 'Passport']),
  //   idNumber: z.string(),
  //   dob: z.string()
  // })).optional(),
  
  // B: z.array(z.object({
  //   id: z.string(),
  //   fullName: z.string(),
  //   idType: z.enum(['CMND', 'Passport']),
  //   idNumber: z.string(),
  //   dob: z.string()
  // })).optional(),
  
  A: z.array(z.object({
    id: z.string(),
    fullName: z.string(),
    idType: z.enum(['CMND', 'Passport']),
    idNumber: z.string(),
    dob: z.string()
  })).min(1, 'Bên A phải có ít nhất 1 khách hàng'),
  
  B: z.array(z.object({
    id: z.string(),
    fullName: z.string(),
    idType: z.enum(['CMND', 'Passport']),
    idNumber: z.string(),
    dob: z.string()
  })).min(1, 'Bên B phải có ít nhất 1 khách hàng'),
  
  C: z.array(z.object({
    id: z.string(),
    fullName: z.string(),
    idType: z.enum(['CMND', 'Passport']),
    idNumber: z.string(),
    dob: z.string()
  })).default([])
}).refine((data) => {
  // Check for duplicate ID numbers across all parties
  const allIdNumbers: string[] = [];
  
  [...data.A, ...data.B, ...(data.C || [])].forEach(customer => {
    if (allIdNumbers.includes(customer.idNumber)) {
      return false;
    }
    allIdNumbers.push(customer.idNumber);
  });
  
  return true;
}, {
  message: 'Không được có số giấy tờ trùng lặp',
  path: ['root']
});

export const fileSchema = z.object({
  ngayTao: z.date(),
  thuKy: z.string().min(1, 'Thư ký là bắt buộc'),
  congChungVien: z.string().min(1, 'Công chứng viên là bắt buộc'),
  maGiaoDich: z.string().min(1, 'Mã giao dịch là bắt buộc'),
  description: z.string().optional(),
  loaiHoSo: z.string().min(1, 'Loại hồ sơ là bắt buộc'),
  parties: partiesSchema
});

export const searchSchema = z.object({
  identity: z.string().optional(),
  fileNo: z.string().optional()
}).refine(data => data.identity || data.fileNo, {
  message: 'Phải nhập ít nhất một trường tìm kiếm'
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ExtendedCustomerFormData = z.infer<typeof extendedCustomerSchema>;
export type FileFormData = z.infer<typeof fileSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;