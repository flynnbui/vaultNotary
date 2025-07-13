"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  File,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Archive,
  Eye
} from "lucide-react";
import { toast } from "sonner";

// File interface
export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url?: string;
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType: string, fileName: string) {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? "";
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return <FileImage className="h-4 w-4 text-blue-500" />;
  }
  
  // Spreadsheet files
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(ext)) {
    return <FileCode className="h-4 w-4 text-purple-500" />;
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <Archive className="h-4 w-4 text-[#800020] dark:text-[#e6b3b3]" />;
  }
  
  // PDF and documents
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }
  
  // Default file icon
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function getFileTypeLabel(fileName: string): string {
 const ext = fileName?.split('.').pop()?.toLowerCase() ?? "";
  
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xlsx: 'Excel',
    xls: 'Excel',
    csv: 'CSV',
    txt: 'Text',
    jpg: 'Image',
    jpeg: 'Image',
    png: 'Image',
    gif: 'Image',
    svg: 'Image',
    zip: 'Archive',
    rar: 'Archive',
    '7z': 'Archive',
  };
  
  return typeMap[ext] || ext.toUpperCase();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ReadOnly File Row Component
interface ReadOnlyFileRowProps {
  file: FileItem;
  index: number;
  onDownload: (file: FileItem) => void;
  onPreview?: (file: FileItem) => void;
}

function ReadOnlyFileRow({ file, index, onDownload, onPreview }: ReadOnlyFileRowProps) {
  const canPreview = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'pdf', 'txt'].includes(ext);
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-8 text-center text-sm text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {getFileIcon(file.type, file.name)}
          <div className="flex flex-col">
            <span className="font-medium text-foreground truncate max-w-[200px]" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getFileTypeLabel(file.name)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(file.uploadDate)}
      </TableCell>
      <TableCell>
      
          {/* {canPreview(file.name) && onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(file)}
              title="Xem trước"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )} */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(file)}
            title="Tải xuống"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
    
      </TableCell>
    </TableRow>
  );
}

// Editable File Row Component
interface EditableFileRowProps {
  file: FileItem;
  index: number;
  onDownload: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onPreview?: (file: FileItem) => void;
}

function EditableFileRow({ file, index, onDownload, onDelete, onPreview }: EditableFileRowProps) {
  const canPreview = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() ?? "";
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'pdf', 'txt'].includes(ext);
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa file "${file.name}"?`)) {
      onDelete(file);
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="w-8 text-center text-sm text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {getFileIcon(file.type, file.name)}
          <div className="flex flex-col">
            <span className="font-medium text-foreground truncate max-w-[200px]" title={file.name}>
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {getFileTypeLabel(file.name)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(file.uploadDate)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {/* {canPreview(file.name) && onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreview(file)}
              title="Xem trước"
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )} */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(file)}
            title="Tải xuống"
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Xóa file"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// File Upload Component
interface FileUploadProps {
  onFilesUpload: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

function FileUpload({ onFilesUpload, accept, multiple = true }: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFilesUpload(files);
    }
    // Reset input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesUpload(files);
    }
  };

  return (
    <div className="mb-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-[#800020] bg-[#800020]/10' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Nhấp để chọn file</span> hoặc kéo thả file vào đây
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Hỗ trợ các định dạng: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG...
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
    </div>
  );
}

// Main FileListCard Component
export interface FileListCardProps {
  files: FileItem[];
  readOnly?: boolean;
  allowDelete?: boolean;
  allowUpload?: boolean;
  accept?: string;         
  multiple?: boolean;     
  title?: string;
  onFilesChange?: (files: FileItem[]) => void;
  onFileUpload?: (files: FileList) => void;
  onFileDownload?: (file: FileItem) => void;
  onFilePreview?: (file: FileItem) => void;
  onFileDelete?: (file: FileItem) => void;
}

export function FileListCard({
  readOnly = false,
  files = [],
  onFilesChange,
  onFileUpload,
  onFileDownload,
  onFileDelete,
  onFilePreview,
  accept,
  multiple = true,
  allowDelete,
  allowUpload,
  title = "Danh sách file đính kèm"
}: FileListCardProps) {
  const { t } = useTranslation();

  // Default handlers
  const handleDownload = (file: FileItem) => {
    if (onFileDownload) {
      onFileDownload(file);
    } else {
      // Default download behavior
      if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Đang tải xuống file: ${file.name}`);
      } else {
        toast.error("Không thể tải xuống file này");
      }
    }
  };

  const handleDelete = (file: FileItem) => {
    if (onFileDelete) {
      onFileDelete(file);
    } else {
      // Default delete behavior
      if (onFilesChange) {
        const newFiles = files.filter(f => f.id !== file.id);
        onFilesChange(newFiles);
        toast.success(`Đã xóa file: ${file.name}`);
      }
    }
  };

  const handleFilesUpload = (fileList: FileList) => {
    if (onFileUpload) {
      onFileUpload(fileList);
    } else {
      // Default upload behavior - convert to FileItem[]
      const newFiles: FileItem[] = Array.from(fileList).map((file, index) => ({
        id: `${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file), // Create object URL for preview
      }));

      if (onFilesChange) {
        onFilesChange([...files, ...newFiles]);
        toast.success(`Đã thêm ${newFiles.length} file`);
      }
    }
  };

  const handlePreview = (file: FileItem) => {
    if (onFilePreview) {
      onFilePreview(file);
    } else {
      // Default preview behavior
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        toast.error("Không thể xem trước file này");
      }
    }
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#800020] dark:text-[#e6b3b3]" />
          {title}
          {files.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {files.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* File Upload Section - Only show in edit mode */}
        {allowUpload  && (
          <FileUpload
            onFilesUpload={handleFilesUpload}
            accept={accept}
            multiple={multiple}
          />
        )}

        {/* Files Table - Desktop */}
        {files.length > 0 ? (
          <>
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Tên file</TableHead>
                    <TableHead className="w-20">Loại</TableHead>
                    <TableHead className="w-32">Ngày tải lên</TableHead>
                    <TableHead className="w-24 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {files.map((file, index) => {
    if (allowDelete) {
      return (
        <EditableFileRow
          key={file.id}
          file={file}
          index={index}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      );
    }
    return (
      <ReadOnlyFileRow
        key={file.id}
        file={file}
        index={index}
        onDownload={handleDownload}
        onPreview={handlePreview}
      />
    );
  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Files Cards - Mobile */}
            <div className="block md:hidden space-y-3">
              {files.map((file, index) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type, file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getFileTypeLabel(file.name)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(file.uploadDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        title="Tải xuống"
                        className="h-8 w-8 p-0 min-h-[44px] md:min-h-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {allowDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa file "${file.name}"?`)) {
                              handleDelete(file);
                            }
                          }}
                          title="Xóa file"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 min-h-[44px] md:min-h-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          <>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
         <h3 className="text-lg font-medium text-foreground mb-2">
  {files.length === 0 && readOnly && !allowUpload
    ? "Chưa có file đính kèm"
    : "Chưa có file nào"}
</h3>
          <p className="text-muted-foreground">
  {readOnly 
    ? "Hồ sơ này chưa có file đính kèm nào."
    : "Kéo thả file vào đây hoặc nhấp vào khu vực phía trên để thêm file."
  }
</p>

          </div>
        )}
      </CardContent>
    </Card>
  );
}