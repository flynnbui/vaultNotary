"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/src/components/layout/Layout";
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
import useCustomerService from "@/src/services/useCustomerService";
import { CustomerType, CustomerFilterOptions } from "@/src/types/customer.type";
import { exportCustomersToCSV, exportCustomersToExcel } from "@/src/lib/export-utils";
import { cn } from "@/src/lib/utils";
import { CustomerSummary } from "@/src/lib/schemas";


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
      idType: customer.documentId ? 'CMND' : 'Passport',
      idNumber: customer.documentId || customer.passportId || '',
      dob: customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      // Additional fields needed for form prefill
      customerType: customer.type === 0 ? 'individual' : 'organization',
      phone: customer.phone || '',
      email: customer.email || '',
      permanentAddress: customer.address || '',
      currentAddress: customer.address || '',
      businessName: customer.businessName || '',
      businessRegistrationNumber: customer.businessRegistrationNumber || '',
      cmndNumber: customer.documentId || '',
      passportNumber: customer.passportId || '',
      isVip: false,
      gender: 'male' as const,
      dateOfBirth: customer.createdAt ? new Date(customer.createdAt) : new Date()
    };
  };

  const { 
    getPaginatedCustomers, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    bulkDeleteCustomers,
    searchCustomers 
  } = useCustomerService();

  const loadCustomers = async () => {
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
      console.error("Error loading customers:", error);
      
      // Handle Axios errors properly
      if (error.response) {
        const errorMessage = error.response.data || error.response.statusText || error.message;
        toast.error(`Lỗi ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        toast.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        toast.error(error.message || "Không thể tải danh sách khách hàng");
      }
    } finally {
      setLoading(false);
    }
  };

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
      console.log("Received customer data:", customerData);
      
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

      console.log("Transformed data for API:", transformedData);

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
      console.error("Error saving customer:", error);
      
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
    await bulkDeleteCustomers(customerIds);
    await loadCustomers();
  };

  const handleBulkExport = (customerIds: string[]) => {
    const customersToExport = customers.filter(c => customerIds.includes(c.id));
    exportCustomersToExcel(customersToExport);
  };

  useEffect(() => {
    loadCustomers();
  }, [pageNumber, filters, searchTerm]);

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
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Quản lý khách hàng
                </h1>
                <p className="text-muted-foreground">
                  Quản lý thông tin khách hàng và lịch sử giao dịch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm khách hàng
              </Button>
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
                <Users className="h-5 w-5 text-orange-600" />
                Danh sách khách hàng
                {totalItems > 0 && (
                  <Badge variant="secondary" className="ml-2">
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
                      <TableHead className="font-semibold">Loại</TableHead>
                      <TableHead className="font-semibold">Họ tên</TableHead>
                      <TableHead className="font-semibold">Tổ chức</TableHead>
                      <TableHead className="font-semibold">Điện thoại</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">CMND/CCCD</TableHead>
                      <TableHead className="font-semibold">Passport</TableHead>
                      <TableHead className="font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayCustomers.map((customer) => (
                      <TableRow 
                        key={customer.id} 
                        className={cn(
                          "hover:bg-muted/50",
                          selectedCustomers.includes(customer.id) && "bg-orange-50 dark:bg-orange-950/50"
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
                          {customer.fullName}
                        </TableCell>
                        <TableCell>{customer.businessName || "-"}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell className="font-mono">
                          {customer.documentId || "-"}
                        </TableCell>
                        <TableCell className="font-mono">
                          {customer.passportId || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
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
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20 mt-6">
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
                              pageNumber === page && "bg-orange-600 hover:bg-orange-700"
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
    </Layout>
  );
}
