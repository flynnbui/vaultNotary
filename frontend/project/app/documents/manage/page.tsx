"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Users } from "lucide-react";

import { Layout } from "@/src/components/layout/Layout";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";

import { DocumentTable } from "@/src/features/documents/components/DocumentTable";
import { DocumentDialog } from "@/src/features/documents/components/DocumentDialog";
import { SearchAndPagination } from "@/src/shared/components/SearchAndPagination";

import { useDocumentSearch } from "@/src/features/documents/hooks/useDocumentSearch";
import { useDocumentOperations } from "@/src/features/documents/hooks/useDocumentOperations";
import { useDocumentFiles } from "@/src/features/documents/hooks/useDocumentFiles";

import { DocumentType, DialogMode } from "@/src/features/documents/types/document.types";

import "@/src/lib/i18n";

export default function DocumentManagePage() {
  const { t } = useTranslation();

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingDocument, setEditingDocument] = useState<DocumentType | undefined>();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  // Search and pagination
  const {
    documents,
    loading,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    handleSearchChange,
    handlePageChange,
    refreshDocuments,
  } = useDocumentSearch();

  // Document operations
  const {
    handleEditDocument,
    handleViewDocument,
    handleUploadDocument,
    handleDeleteDocument,
    loading: operationsLoading,
  } = useDocumentOperations({
    onEdit: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setShowDialog(true);
    },
    onView: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setShowDialog(true);
    },
    onUpload: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setShowDialog(true);
    },
    onRefresh: refreshDocuments,
  });

  // File operations
  const {
    attachedFiles,
    handleFileUpload,
    handleFileDownload,
    handleFilePreview,
    handleFileDelete,
    setAttachedFiles,
  } = useDocumentFiles({
    editingDocument,
    dialogMode,
  });

  const handleCreateDocument = () => {
    setDialogMode("create");
    setEditingDocument(undefined);
    setShowDialog(true);
  };

  const handleDialogSuccess = () => {
    setEditingDocument(undefined);
    refreshDocuments();
  };

  const handleDialogCancel = () => {
    setEditingDocument(undefined);
    setAttachedFiles([]);
  };

  const handleModeChange = (mode: DialogMode) => {
    setDialogMode(mode);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                  onClick={handleCreateDocument}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo hồ sơ mới
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Search and Pagination */}
        <div className="mb-8">
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Nhập thông tin tìm kiếm..."
            searchLabel="Tìm kiếm theo Số Công Chứng, mô tả, thư ký, công chứng viên"
            searchTitle="Tìm kiếm hồ sơ tài liệu"
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startItem={startItem}
            endItem={endItem}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Danh sách hồ sơ tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DocumentTable
              documents={documents}
              loading={loading || operationsLoading}
              searchTerm={searchTerm}
              onEdit={handleEditDocument}
              onView={handleViewDocument}
              onUpload={handleUploadDocument}
            />
          </CardContent>
        </Card>

        {/* Document Dialog */}
        <DocumentDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          mode={dialogMode}
          editingDocument={editingDocument}
          attachedFiles={attachedFiles}
          onFilesChange={setAttachedFiles}
          onFileUpload={handleFileUpload}
          onFileDownload={handleFileDownload}
          onFilePreview={handleFilePreview}
          onFileDelete={handleFileDelete}
          onCustomerDialogChange={setCustomerDialogOpen}
          onSuccess={handleDialogSuccess}
          onCancel={handleDialogCancel}
          onModeChange={handleModeChange}
        />
      </div>
    </Layout>
  );
}