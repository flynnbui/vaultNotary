"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Users } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";

import { DocumentTable } from "@/src/features/documents/components/DocumentTable";
import { DocumentDialog } from "@/src/features/documents/components/DocumentDialog";
import { SearchAndPagination } from "@/src/shared/components/SearchAndPagination";

import { useDocumentSearch } from "@/src/features/documents/hooks/useDocumentSearch";
import { useDocumentDialog } from "@/src/features/documents/hooks/useDocumentDialog";

import { DocumentType, DialogMode } from "@/src/features/documents/types/document.types";

import "@/src/lib/i18n";

export default function DocumentManagePage() {
  const { t } = useTranslation();
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

  // Document dialog hook
  const documentDialog = useDocumentDialog({
    onRefresh: refreshDocuments,
  });

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 md:h-8 md:w-8 text-[#800020]" />
                <h1 className="text-lg md:text-3xl font-bold text-foreground">
                  Quản lý hồ sơ tài liệu
                </h1>
              </div>
              <p className="text-xs md:text-base text-muted-foreground">
                Quản lý thông tin hồ sơ và tài liệu công chứng
              </p>
            </div>

            <Button
              size="lg"
              className="bg-[#800020] hover:bg-[#722F37] text-white min-h-[44px] w-full md:w-auto"
              onClick={documentDialog.handleCreate}
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="md:hidden">Tạo hồ sơ</span>
              <span className="hidden md:inline">Tạo hồ sơ mới</span>
            </Button>
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
              <Users className="h-5 w-5 text-[#800020]" />
              Danh sách hồ sơ tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DocumentTable
              documents={documents}
              loading={loading || documentDialog.loading}
              searchTerm={searchTerm}
              onEdit={documentDialog.handleEdit}
              onView={documentDialog.handleView}
              onUpload={documentDialog.handleUpload}
            />
          </CardContent>
        </Card>

        {/* Document Dialog */}
        <DocumentDialog
          open={documentDialog.isOpen}
          onOpenChange={documentDialog.handleDialogChange}
          mode={documentDialog.dialogMode}
          editingDocument={documentDialog.editingDocument}
          attachedFiles={documentDialog.attachedFiles}
          onFilesChange={documentDialog.handleFilesChange}
          onFileUpload={documentDialog.handleFileUpload}
          onFileDownload={documentDialog.handleFileDownload}
          onFilePreview={documentDialog.handleFilePreview}
          onFileDelete={documentDialog.handleFileDelete}
          onCustomerDialogChange={setCustomerDialogOpen}
          onSuccess={documentDialog.handleSuccess}
          onCancel={documentDialog.handleCancel}
          onModeChange={documentDialog.handleModeChange}
        />
      </div>
  );
}