'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/src/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { CustomerDialog } from '@/src/components/forms/CustomerDialog';
import { Users, Search, Plus, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomerFormData } from '@/src/lib/schemas';
import '@/src/lib/i18n';

// Mock customer data
const mockCustomers: CustomerFormData[] = [
  {
    id: '1',
    type: 'individual',
    fullName: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'nguyenvana@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    idCard: '123456789'
  },
  {
    id: '2',
    type: 'organization',
    fullName: 'Trần Thị B',
    organizationName: 'Công ty TNHH XYZ',
    phone: '0987654321',
    email: 'contact@xyz.com',
    address: '456 Đường DEF, Quận 2, TP.HCM',
    idCard: '987654321'
  },
  {
    id: '3',
    type: 'individual',
    fullName: 'Lê Văn C',
    phone: '0555666777',
    email: 'levanc@email.com',
    address: '789 Đường GHI, Quận 3, TP.HCM',
    passport: 'A1234567'
  }
];

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerFormData[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerFormData | undefined>();

  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.idCard?.includes(searchTerm) ||
    customer.passport?.includes(searchTerm) ||
    customer.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowDialog(true);
  };

  const handleEditCustomer = (customer: CustomerFormData) => {
    setEditingCustomer(customer);
    setShowDialog(true);
  };

  const handleSaveCustomer = (customerData: CustomerFormData) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id ? { ...customerData, id: editingCustomer.id } : c
      ));
      toast.success('Thông tin khách hàng đã được cập nhật!');
    } else {
      // Add new customer
      const newCustomer = { ...customerData, id: Date.now().toString() };
      setCustomers(prev => [...prev, newCustomer]);
      toast.success('Khách hàng mới đã được thêm!');
    }
    setShowDialog(false);
  };

  const getCustomerTypeBadge = (type: string) => {
    return type === 'individual' ? (
      <Badge variant="secondary">Cá nhân</Badge>
    ) : (
      <Badge variant="outline">Tổ chức</Badge>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-foreground">Quản lý khách hàng</h1>
          </div>
          <p className="text-muted-foreground">Quản lý thông tin khách hàng và lịch sử giao dịch</p>
        </div>

        {/* Search and Add Section */}
        <Card className="mb-8">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-600" />
                Tìm kiếm khách hàng
              </div>
              <Button 
                onClick={handleAddCustomer}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm khách hàng
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm theo tên, số điện thoại, CMND/CCCD, Passport</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập thông tin tìm kiếm..."
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Danh sách khách hàng ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
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
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>{getCustomerTypeBadge(customer.type)}</TableCell>
                      <TableCell className="font-medium">{customer.fullName}</TableCell>
                      <TableCell>{customer.organizationName || '-'}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell className="font-mono">{customer.idCard || '-'}</TableCell>
                      <TableCell className="font-mono">{customer.passport || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredCustomers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Không tìm thấy khách hàng
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Không có khách hàng nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có khách hàng nào trong hệ thống.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <CustomerDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
        />
      </div>
    </Layout>
  );
}