'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/src/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { PartiesAccordion } from '@/src/components/forms/PartiesAccordion';
import { FileMetaCard } from '@/src/components/forms/FileMetaCard';
import { fileSchema, type FileFormData } from '@/src/lib/schemas';
import { Users, Search, Plus, Edit, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/src/lib/api';
import '@/src/lib/i18n';

// Type cho dữ liệu hồ sơ khách hàng
interface CustomerRecord {
  id: string;
  maSoSo: string;
  trangThai: 'Đang xử lý' | 'Hoàn thành' | 'Chờ ký';
  khachHang: string;
  ccvThuKy: string;
  thoiGianTao: Date;
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Form methods for creating new file
  const methods = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      ngayTao: new Date(),
      thuKy: '',
      congChungVien: '',
      maGiaoDich: '',
      moTa: '',
      loaiHoSo: '',
      parties: {
        A: [],
        B: [],
        C: []
      }
    }
  });

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Giả lập dữ liệu hồ sơ khách hàng
      const mockCustomerRecords: CustomerRecord[] = [
        {
          id: '1',
          maSoSo: 'HS001',
          trangThai: 'Hoàn thành',
          khachHang: 'Nguyễn Văn A',
          ccvThuKy: 'Trần Thị B (CCV)',
          thoiGianTao: new Date('2024-01-15T09:30:00')
        },
        {
          id: '2',
          maSoSo: 'HS002',
          trangThai: 'Đang xử lý',
          khachHang: 'Lê Văn C',
          ccvThuKy: 'Phạm Thị D (Thư ký)',
          thoiGianTao: new Date('2024-01-16T14:20:00')
        },
        {
          id: '3',
          maSoSo: 'HS003',
          trangThai: 'Chờ ký',
          khachHang: 'Hoàng Thị E',
          ccvThuKy: 'Vũ Văn F (CCV)',
          thoiGianTao: new Date('2024-01-17T11:45:00')
        },
        {
          id: '4',
          maSoSo: 'HS004',
          trangThai: 'Hoàn thành',
          khachHang: 'Đỗ Văn G',
          ccvThuKy: 'Ngô Thị H (Thư ký)',
          thoiGianTao: new Date('2024-01-18T16:10:00')
        },
        {
          id: '5',
          maSoSo: 'HS005',
          trangThai: 'Đang xử lý',
          khachHang: 'Bùi Thị I',
          ccvThuKy: 'Lý Văn J (CCV)',
          thoiGianTao: new Date('2024-01-19T08:15:00')
        },
        {
          id: '6',
          maSoSo: 'HS006',
          trangThai: 'Chờ ký',
          khachHang: 'Trương Văn K',
          ccvThuKy: 'Đinh Thị L (Thư ký)',
          thoiGianTao: new Date('2024-01-20T13:30:00')
        },
        {
          id: '7',
          maSoSo: 'HS007',
          trangThai: 'Hoàn thành',
          khachHang: 'Phan Thị M',
          ccvThuKy: 'Võ Văn N (CCV)',
          thoiGianTao: new Date('2024-01-21T10:00:00')
        },
        {
          id: '8',
          maSoSo: 'HS008',
          trangThai: 'Đang xử lý',
          khachHang: 'Huỳnh Văn O',
          ccvThuKy: 'Tôn Thị P (Thư ký)',
          thoiGianTao: new Date('2024-01-22T15:45:00')
        }
      ];

      // Filter customers based on search term
      const filteredCustomers = mockCustomerRecords.filter(customer =>
        customer.maSoSo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.khachHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.ccvThuKy.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setTotalItems(filteredCustomers.length);

      // Pagination logic
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

      setCustomers(paginatedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Không thể tải danh sách hồ sơ khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers;

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowDialog(true);
  };

  const onSubmit = async (data: FileFormData) => {
    try {
      await apiService.createFile(data);
      toast.success('Hồ sơ đã được lưu thành công!');
      setShowDialog(false);
      methods.reset();
      loadCustomers(); // Reload the table
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.')) {
      methods.reset();
      toast.info('Đã hủy tạo hồ sơ');
      setShowDialog(false);
    }
  };

  const handleEditCustomer = (customer: CustomerRecord) => {
    setEditingCustomer(customer);
    setShowDialog(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      try {
        // API call to delete customer record
        // await apiService.deleteCustomerRecord(id);
        toast.success('Đã xóa hồ sơ thành công!');
        loadCustomers();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa hồ sơ');
      }
    }
  };

  const handleSaveCustomer = (customerData: any) => {
    if (editingCustomer) {
      toast.success('Thông tin hồ sơ đã được cập nhật!');
    } else {
      toast.success('Hồ sơ mới đã được thêm!');
    }
    setShowDialog(false);
    loadCustomers();
  };

  const getTrangThaiColor = (trangThai: string) => {
    switch (trangThai) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800';
      case 'Chờ ký':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     

        {/* Header with Create Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-foreground">Quản lý hồ sơ khách hàng</h1>
              </div>
              <p className="text-muted-foreground">Quản lý thông tin hồ sơ và lịch sử giao dịch khách hàng</p>
            </div>
            
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-orange-700 hover:bg-orange-900">
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo hồ sơ mới
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo hồ sơ mới</DialogTitle>
                </DialogHeader>
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    {/* File Meta Information */}
                    <FileMetaCard />
                    
                    {/* Parties Section */}
                    <PartiesAccordion />
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancel}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Huỷ
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-orange-700 hover:bg-orange-900 px-8"
                        disabled={methods.formState.isSubmitting}
                      >
                        {methods.formState.isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-600" />
              Tìm kiếm hồ sơ khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm theo mã số sơ, khách hàng, CCV/Thư ký</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Nhập thông tin tìm kiếm..."
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Records Table */}
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Danh sách hồ sơ khách hàng ({totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Mã số sơ</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold">Khách hàng</TableHead>
                    <TableHead className="font-semibold">CCV/Thư ký chịu trách nhiệm</TableHead>
                    <TableHead className="font-semibold">Thời gian tạo</TableHead>
                    <TableHead className="font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          <span className="ml-2 text-muted-foreground">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Không tìm thấy hồ sơ
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Không có hồ sơ nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có hồ sơ nào trong hệ thống.'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{customer.maSoSo}</TableCell>
                        <TableCell>
                          <Badge className={getTrangThaiColor(customer.trangThai)}>
                            {customer.trangThai}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.khachHang}</TableCell>
                        <TableCell>{customer.ccvThuKy}</TableCell>
                        <TableCell>{formatDateTime(customer.thoiGianTao)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              title="Xóa"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>
                    Hiển thị {startItem}-{endItem} trong tổng số {totalItems} kết quả
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis
                        if (page === 2 && currentPage > 4) {
                          return <span key={page} className="px-2 text-sm text-gray-500">...</span>;
                        }
                        if (page === totalPages - 1 && currentPage < totalPages - 3) {
                          return <span key={page} className="px-2 text-sm text-gray-500">...</span>;
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 w-8 p-0 ${currentPage === page
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'hover:bg-gray-100'
                            }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}