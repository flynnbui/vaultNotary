import React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Edit, Eye, Upload, Users } from 'lucide-react';

import { DocumentType } from '../types/document.types';
import { DateUtils } from '@/src/shared/utils/dateUtils';

interface DocumentTableProps {
  documents: DocumentType[];
  loading: boolean;
  searchTerm: string;
  onEdit: (document: DocumentType) => void;
  onView: (document: DocumentType) => void;
  onUpload: (document: DocumentType) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  searchTerm,
  onEdit,
  onView,
  onUpload,
}) => {
  const getDocumentTypeColor = (documentType: string) => {
    const colors = {
      "Hợp đồng": "bg-green-100 text-green-800",
      "Thỏa thuận": "bg-blue-100 text-blue-800",
      "Công chứng": "bg-purple-100 text-purple-800",
      "Chứng thực": "bg-yellow-100 text-yellow-800",
      Khác: "bg-gray-100 text-gray-800",
    };
    return colors[documentType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <>
        {/* Desktop loading */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Số Công Chứng</TableHead>
                <TableHead className="font-semibold">Loại hồ sơ</TableHead>
                <TableHead className="font-semibold">Mô tả</TableHead>
                <TableHead className="font-semibold">Thư ký / Công chứng viên</TableHead>
                <TableHead className="font-semibold">Ngày tạo</TableHead>
                <TableHead className="font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#800020]"></div>
                    <span className="ml-2 text-muted-foreground">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile loading */}
        <div className="block md:hidden">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#800020]"></div>
            <span className="ml-2 text-muted-foreground">Đang tải...</span>
          </div>
        </div>
      </>
    );
  }

  if (documents.length === 0) {
    return (
      <>
        {/* Desktop empty state */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Số Công Chứng</TableHead>
                <TableHead className="font-semibold">Loại hồ sơ</TableHead>
                <TableHead className="font-semibold">Mô tả</TableHead>
                <TableHead className="font-semibold">Thư ký / Công chứng viên</TableHead>
                <TableHead className="font-semibold">Ngày tạo</TableHead>
                <TableHead className="font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Không tìm thấy hồ sơ
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Không có hồ sơ nào phù hợp với từ khóa tìm kiếm."
                      : "Chưa có hồ sơ nào trong hệ thống."}
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile empty state */}
        <div className="block md:hidden text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Không tìm thấy hồ sơ
          </h3>
          <p className="text-muted-foreground px-4">
            {searchTerm
              ? "Không có hồ sơ nào phù hợp với từ khóa tìm kiếm."
              : "Chưa có hồ sơ nào trong hệ thống."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block">
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold whitespace-nowrap">Số Công Chứng</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Loại hồ sơ</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Mô tả</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Thư ký / Công chứng viên</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Ngày tạo</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {document.transactionCode}
                </TableCell>
                <TableCell>
                  <Badge className={getDocumentTypeColor(document.documentType)}>
                    {document.documentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs" title={document.description || undefined}>
                    {document.description || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-bold">Thư ký:</span> {document.secretary}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">CCV:</span> {document.notaryPublic}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {DateUtils.formatDateTime(document.createdDate)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(document)}
                      title="Chỉnh sửa"
                      className="min-h-[40px] min-w-[40px] p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(document)}
                      title="Xem chi tiết"
                      className="min-h-[40px] min-w-[40px] p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpload(document)}
                      title="Thêm file"
                      className="min-h-[40px] min-w-[40px] p-2"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="block md:hidden space-y-4">
        {documents.map((document) => (
          <Card key={document.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {document.transactionCode}
                </CardTitle>
                <Badge className={getDocumentTypeColor(document.documentType)}>
                  {document.documentType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              {document.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mô tả</p>
                  <p className="text-sm">{document.description}</p>
                </div>
              )}
              
              <Separator />
              
              {/* Staff info */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Thư ký:</span>
                  <span className="text-sm">{document.secretary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">CCV:</span>
                  <span className="text-sm">{document.notaryPublic}</span>
                </div>
              </div>
              
              <Separator />
              
              {/* Date */}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
                <span className="text-sm">{DateUtils.formatDateTime(document.createdDate)}</span>
              </div>
              
              <Separator />
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(document)}
                  className="flex-1 min-h-[44px]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(document)}
                  className="flex-1 min-h-[44px]"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpload(document)}
                  className="flex-1 min-h-[44px]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  File
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};