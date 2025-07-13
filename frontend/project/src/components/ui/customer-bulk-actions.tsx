"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { 
  Trash2, 
  Download, 
  Mail, 
  MoreHorizontal, 
  X,
  Users,
  Archive,
  Tag,
  FileSpreadsheet
} from "lucide-react";
import { CustomerType } from "@/src/types/customer.type";
import { toast } from "sonner";

interface CustomerBulkActionsProps {
  customers: CustomerType[];
  selectedCustomers: string[];
  onSelectAll: (selectAll: boolean) => void;
  onClearSelection: () => void;
  onBulkDelete: (customerIds: string[]) => Promise<{ success: number; failed: number }>;
  onBulkExport: (customerIds: string[]) => void;
  loading?: boolean;
}

export function CustomerBulkActions({
  customers,
  selectedCustomers,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  loading = false
}: CustomerBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length;
  const someSelected = selectedCustomers.length > 0 && selectedCustomers.length < customers.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await onBulkDelete(selectedCustomers);
      setShowDeleteDialog(false);
      onClearSelection();
      
      if (result.failed === 0) {
        toast.success(`Đã xóa thành công ${result.success} khách hàng`);
      } else if (result.success === 0) {
        toast.error(`Không thể xóa bất kỳ khách hàng nào (${result.failed} thất bại)`);
      } else {
        toast.warning(`Đã xóa ${result.success} khách hàng, ${result.failed} thất bại`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa khách hàng");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkExport = () => {
    onBulkExport(selectedCustomers);
    toast.success(`Đang xuất dữ liệu ${selectedCustomers.length} khách hàng`);
  };

  if (selectedCustomers.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#800020]/10 dark:bg-[#800020]/20 border border-[#800020]/30 dark:border-[#800020]/40 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) {
                const checkbox = el as HTMLInputElement;
                checkbox.indeterminate = someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#800020]" />
            <span className="font-medium text-[#800020] dark:text-[#e6b3b3]">
              Đã chọn {selectedCustomers.length} khách hàng
            </span>
            <Badge variant="secondary" className="bg-[#800020]/20 dark:bg-[#800020]/40 text-[#800020] dark:text-[#e6b3b3]">
              {selectedCustomers.length}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="text-[#800020] dark:text-[#e6b3b3] border-[#800020]/30 dark:border-[#800020]/40 hover:bg-[#800020]/10 dark:hover:bg-[#800020]/20"
          >
            <X className="h-4 w-4 mr-1" />
            Bỏ chọn
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            disabled={loading}
            className="text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/50"
          >
            <Download className="h-4 w-4 mr-1" />
            Xuất Excel
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={loading}
                className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <MoreHorizontal className="h-4 w-4 mr-1" />
                Thêm
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleBulkExport} className="text-green-700 dark:text-green-300">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Xuất CSV
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-blue-700 dark:text-blue-300">
                <Mail className="h-4 w-4 mr-2" />
                Gửi email hàng loạt
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-purple-700 dark:text-purple-300">
                <Tag className="h-4 w-4 mr-2" />
                Gắn nhãn
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-gray-700 dark:text-gray-300">
                <Archive className="h-4 w-4 mr-2" />
                Lưu trữ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-700 dark:text-red-300 focus:text-red-700 dark:focus:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa hàng loạt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Xác nhận xóa khách hàng
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa <strong>{selectedCustomers.length}</strong> khách hàng đã chọn?
              </p>
              <p className="text-red-600 font-medium">
                Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa {selectedCustomers.length} khách hàng
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}