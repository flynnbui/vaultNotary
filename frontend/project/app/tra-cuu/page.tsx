'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/src/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { searchSchema, type SearchFormData } from '@/src/lib/schemas';
import { formatDate } from '@/src/lib/constants';
import { apiService } from '@/src/lib/api';
import { Search, FileText, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import '@/src/lib/i18n';

interface SearchResult {
  id: string;
  fileCode: string;
  customerName: string;
  fileType: string;
  notaryDate: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    fileCode: 'HS001',
    customerName: 'Nguyễn Văn A',
    fileType: 'Hợp đồng giao dịch',
    notaryDate: '15/12/2024',
    status: 'completed'
  },
  {
    id: '2',
    fileCode: 'HS002',
    customerName: 'Trần Thị B',
    fileType: 'Thừa kế',
    notaryDate: '14/12/2024',
    status: 'pending'
  },
  {
    id: '3',
    fileCode: 'HS003',
    customerName: 'Lê Văn C',
    fileType: 'Mua bán xe',
    notaryDate: '13/12/2024',
    status: 'completed'
  }
];

export default function SearchPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      identity: '',
      fileNo: ''
    }
  });

  const performSearch = useCallback(
    debounce(async (data: SearchFormData) => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filteredResults = mockResults;
        
        if (data.identity) {
          // In real app, this would search by customer identity
          filteredResults = mockResults.filter(result => 
            result.customerName.toLowerCase().includes(data.identity!.toLowerCase())
          );
        }
        
        if (data.fileNo) {
          filteredResults = filteredResults.filter(result => 
            result.fileCode.toLowerCase().includes(data.fileNo!.toLowerCase())
          );
        }
        
        setResults(filteredResults);
        
        if (filteredResults.length === 0) {
          toast.info('Không tìm thấy kết quả phù hợp');
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tìm kiếm');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const onSubmit = (data: SearchFormData) => {
    performSearch(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">Đang xử lý</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-foreground">{t('search.title')}</h1>
          </div>
          <p className="text-muted-foreground">Tìm kiếm hồ sơ công chứng theo số CMND/CCCD hoặc mã hồ sơ</p>
        </div>

        {/* Search Form */}
        <Card className="shadow-md border-0 mb-8">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-600" />
              Tìm kiếm hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="identity" className="block text-sm font-medium text-foreground mb-2">
                    {t('search.identityPlaceholder')}
                  </label>
                  <Input
                    id="identity"
                    {...form.register('identity')}
                    placeholder="Nhập số CMND/CCCD"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="fileNo" className="block text-sm font-medium text-foreground mb-2">
                    {t('search.fileNoPlaceholder')}
                  </label>
                  <Input
                    id="fileNo"
                    {...form.register('fileNo')}
                    placeholder="Nhập mã hồ sơ"
                    className="w-full"
                  />
                </div>
              </div>
              
              {form.formState.errors.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.root.message}
                </p>
              )}
              
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 px-8"
                  disabled={isLoading}
                >
                  <Search className="h-5 w-5 mr-2" />
                  {isLoading ? 'Đang tìm...' : t('search.searchButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                {t('search.results')} ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">{t('search.fileCode')}</TableHead>
                      <TableHead className="font-semibold">{t('search.customer')}</TableHead>
                      <TableHead className="font-semibold">{t('search.fileType')}</TableHead>
                      <TableHead className="font-semibold">{t('search.notaryDate')}</TableHead>
                      <TableHead className="font-semibold">{t('search.status')}</TableHead>
                      <TableHead className="font-semibold">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium text-orange-600">
                          {result.fileCode}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {result.customerName}
                          </div>
                        </TableCell>
                        <TableCell>{result.fileType}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {result.notaryDate}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(result.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Xem
                            </Button>
                            <Button variant="outline" size="sm">
                              Sửa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {!isLoading && results.length === 0 && form.formState.isSubmitted && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-muted-foreground">
                Không tìm thấy hồ sơ phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với thông tin khác.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}