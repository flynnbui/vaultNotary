import React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
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
      <div className="overflow-x-auto">
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
    );
  }

  if (documents.length === 0) {
    return (
      <div className="overflow-x-auto">
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
    );
  }

  return (
    <div className="overflow-x-auto">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(document)}
                    title="Chỉnh sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(document)}
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpload(document)}
                    title="Thêm file"
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
  );
};