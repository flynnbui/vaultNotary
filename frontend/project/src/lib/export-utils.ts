import { CustomerType } from "@/src/types/customer.type";

export function exportCustomersToCSV(customers: CustomerType[], filename = "khach-hang") {
  const headers = [
    "ID",
    "Họ và tên",
    "Loại",
    "Địa chỉ", 
    "Số điện thoại",
    "Email",
    "CMND/CCCD",
    "Passport",
    "Tên doanh nghiệp",
    "Số đăng ký kinh doanh",
    "Ngày tạo",
    "Ngày cập nhật"
  ];

  const csvContent = [
    headers.join(","),
    ...customers.map(customer => [
      customer.id,
      `"${customer.fullName}"`,
      customer.type === 1 ? "Cá nhân" : "Doanh nghiệp",
      `"${customer.address}"`,
      customer.phone || "",
      customer.email || "",
      customer.documentId || "",
      customer.passportId || "",
      customer.businessName || "",
      customer.businessRegistrationNumber || "",
      new Date(customer.createdAt).toLocaleDateString("vi-VN"),
      new Date(customer.updatedAt).toLocaleDateString("vi-VN")
    ].join(","))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportCustomersToExcel(customers: CustomerType[], filename = "khach-hang") {
  // For now, we'll use CSV format. To implement actual Excel export,
  // you would need to install a library like 'xlsx' or 'exceljs'
  exportCustomersToCSV(customers, filename);
}