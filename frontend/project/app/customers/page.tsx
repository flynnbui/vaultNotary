"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { CustomerDialog } from "@/src/components/forms/CustomerDialog";
import { CustomerSearchFilters } from "@/src/components/ui/customer-search-filters";
import { CustomerTableSkeleton } from "@/src/components/ui/customer-table-skeleton";
import { CustomerCardView } from "@/src/components/ui/customer-card-view";
import { CustomerBulkActions } from "@/src/components/ui/customer-bulk-actions";
import { CustomerDetailsDialog } from "@/src/components/ui/customer-details-dialog";
import {
  Users,
  Plus,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import "@/src/lib/i18n";
import useCustomerApiService from "@/src/features/customers/services/customerApiService";
import { CustomerType, CustomerFilterOptions } from "@/src/types/customer.type";
import { exportCustomersToCSV, exportCustomersToExcel } from "@/src/lib/export-utils";
import { cn } from "@/src/lib/utils";
import { CustomerSummary } from "@/src/lib/schemas";
import { ErrorHandler } from "@/src/shared/utils/errorHandler";


export default function CustomersPage() {
  const { t } = useTranslation();
  
  // Data state
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CustomerFilterOptions>({});
  
  // UI state
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerSummary | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Helper function to convert CustomerType to CustomerSummary
  const convertToCustomerSummary = (customer: CustomerType): CustomerSummary => {
    return {
      id: customer.id,
      fullName: customer.fullName,
      address: customer.address || '',
      phone: customer.phone || '',
      email: customer.email || '',
      type: customer.type,
      documentId: customer.documentId || '',
      passportId: customer.passportId || '',
      businessRegistrationNumber: customer.businessRegistrationNumber || '',
      businessName: customer.businessName || '',
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  };

  const { 
    getPaginatedCustomers, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    bulkDeleteCustomers,
    searchCustomers 
  } = useCustomerApiService();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm.trim()) {
        response = await searchCustomers(searchTerm, pageNumber, pageSize);
      } else {
        response = await getPaginatedCustomers(pageNumber, pageSize, filters);
      }
      
      setCustomers(response?.items || []);
      setTotalItems(response?.totalCount || 0);
      setTotalPages(response?.totalPages || 1);
    } catch (error: any) {
      // With the new axios interceptor, errors are now ApiError instances
      ErrorHandler.handleApiError(error, "load customers");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageNumber, pageSize, filters, searchCustomers, getPaginatedCustomers]);

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPageNumber(1);
    setSelectedCustomers([]);
  };

  const handleFiltersChange = (newFilters: CustomerFilterOptions) => {
    setFilters(newFilters);
    setPageNumber(1);
    setSelectedCustomers([]);
  };

  // Selection handlers
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    setSelectedCustomers(selectAll ? customers.map(c => c.id) : []);
  };

  const handleClearSelection = () => {
    setSelectedCustomers([]);
  };

  // CRUD handlers
  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowDialog(true);
  };

  const handleEditCustomer = (customer: CustomerType) => {
    setEditingCustomer(convertToCustomerSummary(customer));
    setShowDialog(true);
  };

  const handleViewCustomer = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      
      // Transform form data to match backend API schema
      const transformedData = {
        fullName: customerData.fullName || "",
        address: customerData.permanentAddress || customerData.currentAddress || "",
        phone: customerData.phone || "",
        email: customerData.email || "",
        type: customerData.customerType === 'individual' ? 0 : 1,
        documentId: customerData.idType === 'CMND' ? (customerData.cmndNumber || customerData.idNumber || "") : "",
        passportId: customerData.idType === 'Passport' ? (customerData.passportNumber || customerData.idNumber || "") : "",
        businessRegistrationNumber: customerData.businessRegistrationNumber || "",
        businessName: customerData.businessName || ""
      };


      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, transformedData);
        toast.success("Thông tin khách hàng đã được cập nhật!");
        await loadCustomers();
      } else {
        await createCustomer(transformedData);
        toast.success("Khách hàng mới đã được thêm!");
        await loadCustomers();
      }
      setShowDialog(false);
    } catch (error: any) {
      
      // Handle Axios errors properly
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data || error.response.statusText || error.message;
        toast.error(`Lỗi ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        // Something else happened
        toast.error(error.message || "Có lỗi xảy ra khi lưu khách hàng");
      }
    }
  };

  const handleBulkDelete = async (customerIds: string[]) => {
    const result = await bulkDeleteCustomers(customerIds);
    // Reload customers to reflect changes regardless of partial failures
    await loadCustomers();
    return result;
  };

  const handleBulkExport = (customerIds: string[]) => {
    const customersToExport = customers.filter(c => customerIds.includes(c.id));
    exportCustomersToExcel(customersToExport);
  };

  useEffect(() => {
    loadCustomers();
  }, [pageNumber, filters, searchTerm, loadCustomers]);

  // Memoized computed values
  const displayCustomers = useMemo(() => customers, [customers]);
  
  const getCustomerTypeBadge = (type: number) => {
    const isIndividual = type === 0; // Backend uses 0 for Individual, 1 for Business
    return isIndividual ? (
      <Badge variant="secondary">Cá nhân</Badge>
    ) : (
      <Badge variant="outline">Doanh nghiệp</Badge>
    );
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 md:h-8 md:w-8 text-[#800020]" />
              <div>
                <h1 className="text-lg md:text-3xl font-bold text-foreground">
                  Quản lý khách hàng
                </h1>
                <p className="text-xs md:text-base text-muted-foreground">
                  Quản lý thông tin khách hàng và lịch sử giao dịch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkExport(customers.map(c => c.id))}
                  disabled={customers.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Xuất tất cả
                </Button>
                <Button
                  onClick={handleAddCustomer}
                  className="bg-[#800020] hover:bg-[#722F37] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm khách hàng
                </Button>
              </div>

              {/* Mobile buttons */}
              <div className="flex md:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkExport(customers.map(c => c.id))}
                  disabled={customers.length === 0}
                  className="min-h-[44px] px-3"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleAddCustomer}
                  className="bg-[#800020] hover:bg-[#722F37] text-white min-h-[44px] px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <CustomerSearchFilters
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Bulk Actions */}
        <CustomerBulkActions
          customers={displayCustomers}
          selectedCustomers={selectedCustomers}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          loading={loading}
        />

        {/* View Toggle and Data Display */}
        <Card className="mb-6">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-[#800020]" />
                <span className="text-base md:text-lg">Danh sách khách hàng</span>
                {totalItems > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "card")}>
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Bảng
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Thẻ
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              viewMode === "table" ? (
                <CustomerTableSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Card>
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-muted rounded-full" />
                            <div>
                              <div className="h-5 w-32 bg-muted rounded mb-2" />
                              <div className="h-4 w-24 bg-muted rounded" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-4 w-3/4 bg-muted rounded" />
                          <div className="flex gap-2 mt-4">
                            <div className="h-8 w-16 bg-muted rounded" />
                            <div className="h-8 w-20 bg-muted rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )
            ) : displayCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Không tìm thấy khách hàng
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || Object.values(filters).some(Boolean)
                    ? "Không có khách hàng nào phù hợp với tiêu chí tìm kiếm."
                    : "Chưa có khách hàng nào trong hệ thống."}
                </p>
                {(searchTerm || Object.values(filters).some(Boolean)) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({});
                      setPageNumber(1);
                    }}
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : viewMode === "table" ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedCustomers.length === displayCustomers.length && displayCustomers.length > 0}
                            onCheckedChange={handleSelectAll}
                            ref={(el) => {
                              if (el) (el as any).indeterminate = selectedCustomers.length > 0 && selectedCustomers.length < displayCustomers.length;
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Loại</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Họ tên</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Tổ chức</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Điện thoại</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap min-w-[150px]">Địa chỉ</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">CMND/CCCD</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Passport</TableHead>
                        <TableHead className="font-semibold whitespace-nowrap">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {displayCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className={cn(
                          "hover:bg-muted/50",
                          selectedCustomers.includes(customer.id) && "bg-[#800020]/10 dark:bg-[#800020]/20"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() => handleCustomerSelect(customer.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {getCustomerTypeBadge(customer.type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="max-w-[120px] truncate" title={customer.fullName}>
                            {customer.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[100px] truncate" title={customer.businessName || "-"}>
                            {customer.businessName || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[100px] truncate" title={customer.phone || "-"}>
                            {customer.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={customer.address || "-"}>
                            {customer.address || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="max-w-[100px] truncate" title={customer.documentId || "-"}>
                            {customer.documentId || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="max-w-[100px] truncate" title={customer.passportId || "-"}>
                            {customer.passportId || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              className="min-h-[40px] min-w-[40px] p-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                              className="min-h-[40px] min-w-[40px] p-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            ) : (
              <CustomerCardView
                customers={displayCustomers}
                selectedCustomers={selectedCustomers}
                onCustomerSelect={handleCustomerSelect}
                onCustomerEdit={handleEditCustomer}
                onCustomerView={handleViewCustomer}
                loading={loading}
              />
            )}

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="px-6 py-4 border-t bg-muted/20 mt-6">
                {/* Desktop pagination */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {(pageNumber - 1) * pageSize + 1}-
                    {Math.min(pageNumber * pageSize, totalItems)} trong tổng số{" "}
                    {totalItems} kết quả
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber - 1)}
                      disabled={pageNumber === 1 || loading}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= pageNumber - 1 && page <= pageNumber + 1);

                          if (!showPage) {
                            if (page === 2 && pageNumber > 4)
                              return <span key={page} className="px-2">...</span>;
                            if (
                              page === totalPages - 1 &&
                              pageNumber < totalPages - 3
                            )
                              return <span key={page} className="px-2">...</span>;
                            return null;
                          }

                          return (
                            <Button
                              key={page}
                              variant={
                                pageNumber === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              disabled={loading}
                              className={cn(
                                "h-8 w-8 p-0",
                                pageNumber === page && "bg-[#800020] hover:bg-[#722F37] text-white"
                              )}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber + 1)}
                      disabled={pageNumber === totalPages || loading}
                      className="h-8 px-3"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile pagination - simplified */}
                <div className="md:hidden space-y-4">
                  <div className="text-center text-xs text-muted-foreground">
                    Hiển thị {(pageNumber - 1) * pageSize + 1}-
                    {Math.min(pageNumber * pageSize, totalItems)} trong tổng số{" "}
                    {totalItems} kết quả
                  </div>
                  <div className="flex justify-center items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber - 1)}
                      disabled={pageNumber === 1 || loading}
                      className="min-h-[44px] px-3 text-sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="text-xs">Trước</span>
                    </Button>
                    
                    <span className="text-xs font-medium px-2 py-2 bg-muted rounded">
                      {pageNumber}/{totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNumber + 1)}
                      disabled={pageNumber === totalPages || loading}
                      className="min-h-[44px] px-3 text-sm"
                    >
                      <span className="text-xs">Sau</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CustomerDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          initialData={editingCustomer}
          onSave={handleSaveCustomer}
        />

        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onEdit={handleEditCustomer}
        />
      </div>
  );
}