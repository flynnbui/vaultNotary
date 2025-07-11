"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Layout } from "@/src/components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { PartiesAccordion } from "@/src/components/forms/PartiesAccordion";
import { FileMetaCard } from "@/src/components/forms/FileMetaCard";
import { fileSchema, type FileFormData } from "@/src/lib/schemas";
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar,
  FileText,
  User,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

import "@/src/lib/i18n";
import useDocumentService from "@/src/services/useDocumentService";
import { FileItem, FileListCard } from "@/src/components/forms/FileListCard";
import useUploadService from "@/src/services/useUploadService";

// Interface cho DocumentType
export interface DocumentType {
  id: string;
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho response pagination (để match với service)
interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// Helper function để transform API response thành FileItem
export function transformApiFileToFileItem(
  apiFile: any,
  fileName: string,
  fileSize: number
): FileItem {
  return {
    id: apiFile.id,
    name: fileName,
    size: fileSize,
    type: apiFile.contentType,
    uploadDate: apiFile.createdAt,
    url: `/api/files/download/${apiFile.id}`, // Construct download URL
  };
}

// Dialog modes
type DialogMode = "create" | "edit" | "view" | "upload";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingDocument, setEditingDocument] = useState<
    DocumentType | undefined
  >();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(
    null
  );
  const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);

  const { uploadDocumentFile } = useUploadService();
  // Import all document service methods
  const {
    getPaginatedDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentFiles,
    deleteDocumentFile,
    getFileDownloadUrl,
    getFilePresignedUrl,
    loading: apiLoading,
  } = useDocumentService();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Form methods for creating new file
  const methods = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      ngayTao: new Date(),
      thuKy: "",
      congChungVien: "",
      maGiaoDich: "",
      moTa: "",
      loaiHoSo: "",
      parties: {
        A: [],
        B: [],
        C: [],
      },
    },
  });

  // Reset form khi edit document
  useEffect(() => {
    loadDocuments();
  }, [currentPage, searchTerm]);

  // Load files when viewing/editing a document
  useEffect(() => {
    const loadDocumentFiles = async () => {
      if (
        editingDocument &&
        (dialogMode === "view" ||
          dialogMode === "edit" ||
          dialogMode === "upload")
      ) {
        try {
          console.log("🔄 Loading files for document:", editingDocument.id);
          const files = await getDocumentFiles(editingDocument.id);

          // Transform API files to FileItem format
          const transformedFiles = files.map((apiFile) => ({
            id: apiFile.id,
            name: apiFile.fileName,
            size: apiFile.fileSize,
            type: apiFile.contentType,
            uploadDate: apiFile.createdAt,
            url: getFileDownloadUrl(apiFile.id),
          }));

          setAttachedFiles(transformedFiles);
          console.log("✅ Loaded files:", transformedFiles);
        } catch (error) {
          console.error("❌ Error loading files:", error);
          setAttachedFiles([]);
        }
      } else {
        setAttachedFiles([]);
      }
    };

    loadDocumentFiles();
  }, [editingDocument, dialogMode, getDocumentFiles, getFileDownloadUrl]);
  useEffect(() => {
    if (editingDocument && (dialogMode === "edit" || dialogMode === "view")) {
      methods.reset({
        ngayTao: new Date(editingDocument.createdDate),
        thuKy: editingDocument.secretary,
        congChungVien: editingDocument.notaryPublic,
        maGiaoDich: editingDocument.transactionCode,
        moTa: editingDocument.description,
        loaiHoSo: editingDocument.documentType,
        parties: {
          A: [],
          B: [],
          C: [],
        },
      });
    } else {
      methods.reset({
        ngayTao: new Date(),
        thuKy: "",
        congChungVien: "",
        maGiaoDich: "",
        moTa: "",
        loaiHoSo: "",
        parties: {
          A: [],
          B: [],
          C: [],
        },
      });
    }
  }, [editingDocument, dialogMode, methods]);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const response = await getPaginatedDocuments(currentPage, itemsPerPage);

      if (response) {
        // Filter documents based on search term locally if needed
        let filteredItems = response.items || [];

        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(
            (doc) =>
              doc.transactionCode?.toLowerCase().includes(searchLower) ||
              doc.description?.toLowerCase().includes(searchLower) ||
              doc.secretary?.toLowerCase().includes(searchLower) ||
              doc.notaryPublic?.toLowerCase().includes(searchLower) ||
              doc.documentType?.toLowerCase().includes(searchLower)
          );
        }

        setDocuments(filteredItems);
        setTotalItems(
          searchTerm.trim() ? filteredItems.length : response.totalPages || 0
        );
      } else {
        setDocuments([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Không thể tải danh sách hồ sơ từ máy chủ");
      setDocuments([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    setDialogMode("create");
    setEditingDocument(undefined);
    setShowDialog(true);
  };

  const handleEditDocument = (document: DocumentType) => {
    setDialogMode("edit");
    setEditingDocument(document);
    setShowDialog(true);
  };

  const handleViewDocument = (document: DocumentType) => {
    setDialogMode("view");
    setEditingDocument(document);
    setShowDialog(true);
  };

  const onSubmit = async (data: FileFormData) => {
    console.log("submitting...", data);
    try {
      // Prepare document data for API
      const documentData = {
        createdDate: data.ngayTao.toISOString(),
        secretary: data.thuKy,
        notaryPublic: data.congChungVien,
        transactionCode: data.maGiaoDich || "",
        description: data.moTa || "",
        documentType: data.loaiHoSo,
      };

      console.log("Document data to save:", documentData);

      if (editingDocument) {
        // Update existing document
        const updatedDocument = await updateDocument(
          editingDocument.id,
          documentData
        );
        if (updatedDocument) {
          toast.success("Hồ sơ đã được cập nhật thành công!");
        }
      } else {
        // Create new document
        const newDocument = await createDocument(documentData);
        if (newDocument) {
          toast.success("Hồ sơ đã được tạo thành công!");
        }
      }

      setShowDialog(false);
      methods.reset();
      setEditingDocument(undefined);
      await loadDocuments(); // Reload the table
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.");
    }
  };

  const handleFileUpload = async (fileList: FileList) => {
    if (!uploadingDocumentId) {
      toast.error("Không tìm thấy ID hồ sơ để upload.");
      return;
    }

    const uploadedFiles: FileItem[] = [];

    for (const file of Array.from(fileList)) {
      try {
        const result = await uploadDocumentFile({
          documentId: uploadingDocumentId,
          file: file,
        });

        uploadedFiles.push({
          id: result.id,
          name: result.name,
          size: result.size,
          type: result.type,
          uploadDate: result.uploadDate,
          url: result.url,
        });
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Upload thất bại: ${file.name}`);
      }
    }

    setAttachedFiles((prev) => [...prev, ...uploadedFiles]);
    toast.success(`Đã upload ${uploadedFiles.length} file`);

    // 🆕 Reload files from server to ensure consistency
    if (editingDocument) {
      try {
        const serverFiles = await getDocumentFiles(editingDocument.id);
        const transformedFiles = serverFiles.map((apiFile) => ({
          id: apiFile.id,
          name: apiFile.fileName,
          size: apiFile.fileSize,
          type: apiFile.contentType,
          uploadDate: apiFile.createdAt,
          url: getFileDownloadUrl(apiFile.id),
        }));
        setAttachedFiles(transformedFiles);
        console.log("🔄 Reloaded files from server:", transformedFiles);
      } catch (error) {
        console.error("❌ Error reloading files:", error);
      }
    }
  };

  const handleCancel = () => {
    if (dialogMode === "view") {
      setShowDialog(false);
      setEditingDocument(undefined);
      setUploadingDocumentId(null);
      return;
    }

    if (confirm("Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.")) {
      methods.reset();
      setEditingDocument(undefined);
      setUploadingDocumentId(null);
      setAttachedFiles([]);
      toast.info("Đã hủy thao tác");
      setShowDialog(false);
    }
  };

  // 🆕 Handle file download
  const handleFileDownload = async (file: FileItem) => {
    try {
      console.log("🔄 Downloading file:", file.name);

      // Get presigned URL for download
      const presignedUrl = await getFilePresignedUrl(file.id);

      if (presignedUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = presignedUrl;
        link.download = file.name;
        link.target = "_blank";

        // Add to DOM temporarily
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Đang tải xuống: ${file.name}`);
      } else {
        throw new Error("Không thể lấy link download");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Không thể tải xuống file: ${file.name}`);
    }
  };

  // 🆕 Handle file preview
  const handleFilePreview = async (file: FileItem) => {
    try {
      toast.info("Đang tạo link xem trước...");

      // Get presigned URL for preview
      const presignedUrl = await getFilePresignedUrl(file.id);

      if (presignedUrl) {
        // Open in new tab for preview
        window.open(presignedUrl, "_blank");
        toast.success("Đã mở file xem trước");
      } else {
        // Fallback to direct download URL
        const downloadUrl = getFileDownloadUrl(file.id);
        window.open(downloadUrl, "_blank");
        toast.success("Đã mở file");
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast.error(`Không thể xem trước file: ${file.name}`);
    }
  };

  // 🆕 Handle file delete
  const handleFileDelete = async (file: FileItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa file "${file.name}"?`)) {
      try {
        await deleteDocumentFile(file.id);

        // Remove from local state
        setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id));
        toast.success(`Đã xóa file: ${file.name}`);

        // Reload files from server to ensure consistency
        if (editingDocument) {
          const serverFiles = await getDocumentFiles(editingDocument.id);
          const transformedFiles = serverFiles.map((apiFile) => ({
            id: apiFile.id,
            name: apiFile.fileName,
            size: apiFile.fileSize,
            type: apiFile.contentType,
            uploadDate: apiFile.createdAt,
            url: getFileDownloadUrl(apiFile.id),
          }));
          setAttachedFiles(transformedFiles);
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(`Không thể xóa file: ${file.name}`);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      try {
        const success = await deleteDocument(id);
        if (success) {
          toast.success("Đã xóa hồ sơ thành công!");
          await loadDocuments();
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Có lỗi xảy ra khi xóa hồ sơ");
      }
    }
  };

  const getDocumentTypeColor = (documentType: string) => {
    const colors = {
      "Hợp đồng": "bg-green-100 text-green-800",
      "Thỏa thuận": "bg-blue-100 text-blue-800",
      "Công chứng": "bg-purple-100 text-purple-800",
      "Chứng thực": "bg-yellow-100 text-yellow-800",
      Khác: "bg-gray-100 text-gray-800",
    };
    return (
      colors[documentType as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case "create":
        return "Tạo hồ sơ mới";
      case "edit":
        return "Chỉnh sửa hồ sơ";
      case "view":
        return "Xem chi tiết hồ sơ";
      case "upload":
        return "Thêm tài liệu";
      default:
        return "Hồ sơ";
    }
  };

  const renderDialogContent = () => {
    const isReadOnly = dialogMode === "view";

    if (isReadOnly) {
      return (
        <FormProvider {...methods}>
          <div className="space-y-6 mt-6">
            {/* File Meta Information - Read Only */}
            <FileMetaCard readOnly={true} />

            {/* Parties Section - Read Only */}
            <PartiesAccordion readOnly={true} />

            <FileListCard
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
              onFileDownload={handleFileDownload}
              onFilePreview={handleFilePreview}
              readOnly={true}
            />

            {/* Action Buttons for Preview Mode */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDialogMode("edit");
                  // Form sẽ tự động reset với dữ liệu của editingDocument
                }}
                className="bg-orange-700 hover:bg-orange-900"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </FormProvider>
      );
    }

    if (dialogMode === "upload") {
      return (
        <FormProvider {...methods}>
          <div className="space-y-6 mt-6">
            <FileListCard
              files={attachedFiles}
              onFilesChange={setAttachedFiles}
              onFileUpload={handleFileUpload}
              onFileDownload={handleFileDownload}
              onFilePreview={handleFilePreview}
              onFileDelete={handleFileDelete}
              readOnly={false}
              allowDelete={true}
              allowUpload={true}
            />

            {/* Action Buttons for Upload Mode */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={() => setShowDialog(false)}
                className="bg-orange-700 hover:bg-orange-900"
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </FormProvider>
      );
    }
    if (dialogMode === "create") {
      return (
   <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-6 mt-6"
        >
          {/* File Meta Information */}
          <FileMetaCard readOnly={false} />

          {/* Parties Section */}
          <PartiesAccordion readOnly={false} />

       
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
              disabled={methods.formState.isSubmitting || apiLoading}
            >
              {methods.formState.isSubmitting || apiLoading
                ? "Đang lưu..."
                : editingDocument
                ? "Cập nhật hồ sơ"
                : "Lưu hồ sơ"}
            </Button>
          </div>
        </form>
      </FormProvider>
      );
    }

    // Form mode (create/edit)
    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-6 mt-6"
        >
          {/* File Meta Information */}
          <FileMetaCard readOnly={false} />

          {/* Parties Section */}
          <PartiesAccordion readOnly={false} />

          <FileListCard
            files={attachedFiles}
            onFilesChange={setAttachedFiles}
            onFileDownload={handleFileDownload}
            onFilePreview={handleFilePreview}
            onFileDelete={handleFileDelete}
            readOnly={false}
            allowDelete={true}
            allowUpload={false}
            title="File đính kèm"
          />

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
              disabled={methods.formState.isSubmitting || apiLoading}
            >
              {methods.formState.isSubmitting || apiLoading
                ? "Đang lưu..."
                : editingDocument
                ? "Cập nhật hồ sơ"
                : "Lưu hồ sơ"}
            </Button>
          </div>
        </form>
      </FormProvider>
    );
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
                <h1 className="text-3xl font-bold text-foreground">
                  Quản lý hồ sơ tài liệu
                </h1>
              </div>
              <p className="text-muted-foreground">
                Quản lý thông tin hồ sơ và tài liệu công chứng
              </p>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-orange-700 hover:bg-orange-900"
                  onClick={handleAddDocument}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo hồ sơ mới
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>
                {renderDialogContent()}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-600" />
              Tìm kiếm hồ sơ tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">
                  Tìm kiếm theo mã giao dịch, mô tả, thư ký, công chứng viên
                </Label>
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

        {/* Documents Table */}
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Danh sách hồ sơ tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      Mã giao dịch
                    </TableHead>
                    <TableHead className="font-semibold">Loại hồ sơ</TableHead>
                    <TableHead className="font-semibold">Mô tả</TableHead>
                    <TableHead className="font-semibold">
                      Thư ký / Công chứng viên
                    </TableHead>
                    <TableHead className="font-semibold">Ngày tạo</TableHead>
                    <TableHead className="font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading || apiLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          <span className="ml-2 text-muted-foreground">
                            Đang tải...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : documents.length === 0 ? (
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
                  ) : (
                    documents.map((document) => (
                      <TableRow key={document.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {document.transactionCode}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getDocumentTypeColor(
                              document.documentType
                            )}
                          >
                            {document.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs "
                            title={document.description}
                          >
                            {document.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-bold">Thư ký:</span>{" "}
                              {document.secretary}
                            </div>
                            <div className="text-sm">
                              <span className="font-bold">CCV:</span>{" "}
                              {document.notaryPublic}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(document.createdDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDocument(document)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(document)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDialogMode("upload");
                                setEditingDocument(document);
                                setUploadingDocumentId(document.id);
                                setAttachedFiles([]);
                                setShowDialog(true);
                              }}
                              title="Thêm file"
                            >
                              <Upload className="h-4 w-4" />
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
                    Hiển thị {startItem}-{endItem} trong tổng số {totalItems}{" "}
                    kết quả
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current page
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage) {
                          // Show ellipsis
                          if (page === 2 && currentPage > 4) {
                            return (
                              <span
                                key={page}
                                className="px-2 text-sm text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          if (
                            page === totalPages - 1 &&
                            currentPage < totalPages - 3
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-2 text-sm text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`h-8 w-8 p-0 ${
                              currentPage === page
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "hover:bg-gray-100"
                            }`}
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
